const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Subject = require('./models/Subject');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const Attempt = require('./models/Attempt');

const questionsData = [
  {
    content: "What is the capital of Japan?",
    options: [
      { id: "1", text: "Seoul", isCorrect: false },
      { id: "2", text: "Tokyo", isCorrect: true },
      { id: "3", text: "Beijing", isCorrect: false },
      { id: "4", text: "Bangkok", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "Which planet is known as the Red Planet?",
    options: [
      { id: "1", text: "Venus", isCorrect: false },
      { id: "2", text: "Jupiter", isCorrect: false },
      { id: "3", text: "Mars", isCorrect: true },
      { id: "4", text: "Saturn", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "What is the largest ocean on Earth?",
    options: [
      { id: "1", text: "Atlantic Ocean", isCorrect: false },
      { id: "2", text: "Indian Ocean", isCorrect: false },
      { id: "3", text: "Arctic Ocean", isCorrect: false },
      { id: "4", text: "Pacific Ocean", isCorrect: true }
    ],
    basePoints: 10
  },
  {
    content: "Who painted the Mona Lisa?",
    options: [
      { id: "1", text: "Vincent van Gogh", isCorrect: false },
      { id: "2", text: "Leonardo da Vinci", isCorrect: true },
      { id: "3", text: "Pablo Picasso", isCorrect: false },
      { id: "4", text: "Claude Monet", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "What is the chemical symbol for Gold?",
    options: [
      { id: "1", text: "Ag", isCorrect: false },
      { id: "2", text: "Fe", isCorrect: false },
      { id: "3", text: "Au", isCorrect: true },
      { id: "4", text: "Pb", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "Which element has the atomic number 1?",
    options: [
      { id: "1", text: "Helium", isCorrect: false },
      { id: "2", text: "Oxygen", isCorrect: false },
      { id: "3", text: "Hydrogen", isCorrect: true },
      { id: "4", text: "Nitrogen", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "What is the smallest prime number?",
    options: [
      { id: "1", text: "0", isCorrect: false },
      { id: "2", text: "1", isCorrect: false },
      { id: "3", text: "2", isCorrect: true },
      { id: "4", text: "3", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "In which year did the Titanic sink?",
    options: [
      { id: "1", text: "1905", isCorrect: false },
      { id: "2", text: "1912", isCorrect: true },
      { id: "3", text: "1918", isCorrect: false },
      { id: "4", text: "1923", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "Which country is home to the Kangaroo?",
    options: [
      { id: "1", text: "South Africa", isCorrect: false },
      { id: "2", text: "Australia", isCorrect: true },
      { id: "3", text: "Brazil", isCorrect: false },
      { id: "4", text: "India", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "What is the hardest natural substance on Earth?",
    options: [
      { id: "1", text: "Gold", isCorrect: false },
      { id: "2", text: "Iron", isCorrect: false },
      { id: "3", text: "Diamond", isCorrect: true },
      { id: "4", text: "Quartz", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "Who wrote 'Romeo and Juliet'?",
    options: [
      { id: "1", text: "Charles Dickens", isCorrect: false },
      { id: "2", text: "William Shakespeare", isCorrect: true },
      { id: "3", text: "Jane Austen", isCorrect: false },
      { id: "4", text: "Mark Twain", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "Which gas do plants absorb from the atmosphere?",
    options: [
      { id: "1", text: "Oxygen", isCorrect: false },
      { id: "2", text: "Nitrogen", isCorrect: false },
      { id: "3", text: "Carbon Dioxide", isCorrect: true },
      { id: "4", text: "Hydrogen", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "What is the largest planet in our solar system?",
    options: [
      { id: "1", text: "Mars", isCorrect: false },
      { id: "2", text: "Jupiter", isCorrect: true },
      { id: "3", text: "Saturn", isCorrect: false },
      { id: "4", text: "Neptune", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "Which is the longest river in the world?",
    options: [
      { id: "1", text: "Amazon", isCorrect: false },
      { id: "2", text: "Nile", isCorrect: true },
      { id: "3", text: "Yangtze", isCorrect: false },
      { id: "4", text: "Mississippi", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "What is the capital of Italy?",
    options: [
      { id: "1", text: "Venice", isCorrect: false },
      { id: "2", text: "Florence", isCorrect: false },
      { id: "3", text: "Rome", isCorrect: true },
      { id: "4", text: "Milan", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "How many continents are there on Earth?",
    options: [
      { id: "1", text: "5", isCorrect: false },
      { id: "2", text: "6", isCorrect: false },
      { id: "3", text: "7", isCorrect: true },
      { id: "4", text: "8", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "Which ocean is the third largest in the world?",
    options: [
      { id: "1", text: "Pacific Ocean", isCorrect: false },
      { id: "2", text: "Atlantic Ocean", isCorrect: false },
      { id: "3", text: "Indian Ocean", isCorrect: true },
      { id: "4", text: "Arctic Ocean", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "What is the fast animal on land?",
    options: [
      { id: "1", text: "Cheetah", isCorrect: true },
      { id: "2", text: "Lion", isCorrect: false },
      { id: "3", text: "Eagle", isCorrect: false },
      { id: "4", text: "Horse", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "What is the boiling point of water at sea level?",
    options: [
      { id: "1", text: "50°C", isCorrect: false },
      { id: "2", text: "100°C", isCorrect: true },
      { id: "3", text: "150°C", isCorrect: false },
      { id: "4", text: "200°C", isCorrect: false }
    ],
    basePoints: 10
  },
  {
    content: "Which country is the largest by land area?",
    options: [
      { id: "1", text: "Canada", isCorrect: false },
      { id: "2", text: "China", isCorrect: false },
      { id: "3", text: "USA", isCorrect: false },
      { id: "4", text: "Russia", isCorrect: true }
    ],
    basePoints: 10
  }
];

const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Clear existing data
    await Subject.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await Attempt.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create a hashed password
    const hashedPass = await bcrypt.hash('mindspire123', 10);

    // 2. Create Users
    const admin = await User.create({
      username: 'AdminMaster',
      password: hashedPass,
      role: 'admin'
    });
    console.log(`Created Admin: ${admin.username}`);

    const user = await User.create({
      username: 'teststudent',
      password: hashedPass,
      role: 'student'
    });
    console.log(`Created Student: ${user.username}`);

    // 2. Create 1 Subject
    const subject = await Subject.create({
      name: "General Knowledge",
      description: "Everything from science to history",
      icon: "Globe"
    });
    console.log(`Created Subject: ${subject.name} (ID: ${subject._id})`);

    // 3. Create 1 Quiz
    const quiz = await Quiz.create({
      subjectId: subject._id,
      title: "Mixed Trivia",
      difficulty: "Medium"
    });
    console.log(`Created Quiz: ${quiz.title} (ID: ${quiz._id})`);

    // 4. Create 20 Questions
    const questionsWithRefs = questionsData.map(q => ({
      ...q,
      quizId: quiz._id
    }));

    const insertedQuestions = await Question.insertMany(questionsWithRefs);
    console.log(`Inserted ${insertedQuestions.length} questions.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
