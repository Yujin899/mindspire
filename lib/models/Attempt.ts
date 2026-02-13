import mongoose from 'mongoose';

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

AttemptSchema.index({ userId: 1, questionId: 1, sessionId: 1 });

export default mongoose.models.Attempt || mongoose.model('Attempt', AttemptSchema);
