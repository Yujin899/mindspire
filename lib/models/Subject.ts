import mongoose from 'mongoose';

const SubjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    icon: String
});

export default mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
