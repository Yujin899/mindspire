const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const adminMiddleware = require('../middleware/adminMiddleware');

// Loading routes
router.get('/subjects', quizController.getSubjects);
router.get('/subjects/:subjectId/quizzes', quizController.getQuizzesBySubject);
router.get('/quizzes/:quizId/questions', quizController.getQuestionsByQuiz);

// Only answer endpoint as per Phase 1 recovery Step 5
router.post('/questions/answer', quizController.submitAnswer);
router.get('/mistakes', quizController.getMistakes);
router.get('/leaderboard', quizController.getLeaderboard);

// Admin Routes
router.post('/subjects', adminMiddleware, quizController.createSubject);
router.post('/quizzes', adminMiddleware, quizController.createQuiz);
router.post('/questions/batch', adminMiddleware, quizController.batchUploadQuestions);

module.exports = router;
