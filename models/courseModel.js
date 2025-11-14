const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    // CORRECTION : Le champ 'category' est remplacé par 'game' pour la cohérence
    game: { type: String, required: true },
    coach: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

