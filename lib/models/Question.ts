import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    content: {
        type: String,
        required: true
    },
    options: [
        {
            id: String,
            text: String,
            isCorrect: Boolean
        }
    ],
    basePoints: {
        type: Number,
        default: 10
    },
    explanation: {
        type: String,
        default: ""
    }
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
