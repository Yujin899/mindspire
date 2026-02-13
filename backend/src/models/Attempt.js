const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  choiceId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Remove the unique constraint to allow multiple attempts (historical/replays)
// Session-based XP validation will be handled at the controller level
AttemptSchema.index({ userId: 1, questionId: 1, sessionId: 1 });

module.exports = mongoose.model('Attempt', AttemptSchema);
