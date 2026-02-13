const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');
const Question = require('./src/models/Question');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Question.deleteMany({});
    console.log('Cleared existing data.');

    // Create a test user
    const testUser = await User.create({
      username: 'testuser',
      stats: {
        totalXP: 0,
        currentStreak: 0,
        lastAttemptDate: null
      }
    });
    console.log(`Created User: ${testUser.username} (ID: ${testUser._id})`);

    // Create a test question
    const testQuestion = await Question.create({
      content: 'What is the capital of France?',
      options: [
        { id: '1', text: 'London', isCorrect: false },
        { id: '2', text: 'Paris', isCorrect: true },
        { id: '3', text: 'Berlin', isCorrect: false },
        { id: '4', text: 'Madrid', isCorrect: false }
      ],
      basePoints: 10
    });
    console.log(`Created Question: ${testQuestion.content} (ID: ${testQuestion._id})`);

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();
