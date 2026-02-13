const User = require('../models/User');
const Subject = require('../models/Subject');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');

exports.submitAnswer = async (req, res) => {
  try {
    const { userId, questionId, choiceId, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    // 1. Fetch Question and User
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for duplicate submission in this session to prevent XP double-counting
    const existingAttempt = await Attempt.findOne({ userId, questionId, sessionId });

    // 2. Check correctness
    const selectedOption = question.options.find(opt => opt.id === choiceId);
    if (!selectedOption) {
      return res.status(400).json({ message: 'Invalid choice' });
    }
    const isCorrect = selectedOption.isCorrect;

    // 3. Logic for Streak and XP
    let xpGained = 0;
    let newStreak = user.stats.currentStreak;
    const now = new Date();
    const lastAttemptDate = user.stats.lastAttemptDate;

    // RULE: Only grant XP if this question hasn't been answered correctly in this session before
    // We also check existingAttempt to satisfy the "If the same question is submitted twice in the same session, do not grant XP again" requirement.
    const shouldGrantXP = isCorrect && !existingAttempt;

    if (isCorrect) {
      // Streak reset logic (inactivity > 24h)
      if (lastAttemptDate) {
        const hoursSinceLast = (now - new Date(lastAttemptDate)) / (1000 * 60 * 60);
        if (hoursSinceLast > 24) {
          newStreak = 1;
        } else {
          newStreak += 1;
        }
      } else {
        newStreak = 1;
      }

      if (shouldGrantXP) {
        const multiplier = Math.min(2.0, 1 + ((newStreak - 1) * 0.1));
        xpGained = Math.floor(question.basePoints * multiplier);
      }
    } else {
      newStreak = 0;
    }

    // 4. Record Attempt (Now allows duplicates across sessions/historical)
    await Attempt.create({
      userId,
      questionId,
      sessionId,
      isCorrect,
      choiceId
    });

    // 5. Update User Stats
    user.stats.totalXP += xpGained;
    user.stats.currentStreak = newStreak;
    user.stats.lastAttemptDate = now;
    await user.save();

    // 6. Response body as per contract
    res.json({
      isCorrect,
      correctChoiceId: question.options.find(opt => opt.isCorrect).id,
      xpGained,
      newStreak,
      multiplier: isCorrect ? Math.min(2.0, 1 + ((newStreak - 1) * 0.1)) : 1.0,
      stats: {
        totalXP: user.stats.totalXP,
        userLeague: "Bronze" // Hardcoded for now as per Scope Lock
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuizzesBySubject = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ subjectId: req.params.subjectId });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ quizId: req.params.quizId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getMistakes = async (req, res) => {
  try {
    const { userId, subjectId, quizId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const pipeline = [
      { $match: { userId: userObjectId, isCorrect: false } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionId',
          foreignField: '_id',
          as: 'question'
        }
      },
      { $unwind: '$question' }
    ];

    // Filter by Quiz if provided
    if (quizId) {
      pipeline.push({ 
        $match: { 'question.quizId': new mongoose.Types.ObjectId(quizId) } 
      });
    }

    // Filter by Subject if provided (requires another lookup)
    if (subjectId) {
      pipeline.push({
        $lookup: {
          from: 'quizzes',
          localField: 'question.quizId',
          foreignField: '_id',
          as: 'quiz'
        }
      },
      { $unwind: '$quiz' },
      {
        $match: { 'quiz.subjectId': new mongoose.Types.ObjectId(subjectId) }
      });
    }

    const mistakes = await Attempt.aggregate(pipeline);

    // Use a Map to keep only the latest attempt per question
    const uniqueMistakes = [];
    const seen = new Set();
    
    for (const attempt of mistakes) {
      if (!attempt.question) continue;
      
      const qId = attempt.question._id.toString();
      if (!seen.has(qId)) {
        seen.add(qId);
        // Include the user's wrong choice in the response object
        uniqueMistakes.push({
          ...attempt.question, // This is already a plain object from aggregate
          userChoiceId: attempt.choiceId || null
        });
      }
    }

    res.json(uniqueMistakes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ role: 'student' })
      .sort({ 'stats.totalXP': -1 })
      .limit(10)
      .select('username character stats.totalXP');
    
    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Functions
exports.createSubject = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const subject = new Subject({ name, description, icon });
    await subject.save();
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { subjectId, title, difficulty } = req.body;
    const quiz = new Quiz({ subjectId, title, difficulty });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.batchUploadQuestions = async (req, res) => {
  try {
    const { quizId, questions } = req.body;
    
    // Validate quizId existence
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Format and insert questions
    const formattedQuestions = questions.map(q => ({
      quizId,
      content: q.content,
      options: q.options,
      basePoints: q.basePoints || 10,
      explanation: q.explanation || ""
    }));

    const inserted = await Question.insertMany(formattedQuestions);
    res.status(201).json({ count: inserted.length, questions: inserted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
