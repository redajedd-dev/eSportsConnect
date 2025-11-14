// tournamentModel.js

const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    game: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    rules: {
        type: String,
        default: 'Les règles seront communiquées prochainement.'
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    maxParticipants: {
        type: Number,
        default: 16
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

const Tournament = mongoose.model('Tournament', TournamentSchema);

module.exports = Tournament;
