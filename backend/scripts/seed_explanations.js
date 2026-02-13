const mongoose = require('mongoose');

// Quick script to add dummy explanations to all questions
async function addExplanations() {
    try {
        await mongoose.connect('mongodb://localhost:27017/mindspire');
        console.log("Connected to MongoDB...");

        const Question = mongoose.model('Question', new mongoose.Schema({
            explanation: String
        }));

        const result = await Question.updateMany(
            { $or: [ { explanation: { $exists: false } }, { explanation: "" } ] },
            { $set: { explanation: "Elder knowledge suggests thy study more deeply of this realm." } }
        );

        console.log(`Successfully updated ${result.modifiedCount} questions with dummy explanations.`);
        process.exit(0);
    } catch (err) {
        console.error("Error updating database:", err);
        process.exit(1);
    }
}

addExplanations();
