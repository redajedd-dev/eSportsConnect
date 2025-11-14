// rankingModel.js
const mongoose = require('mongoose');

const RankingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game: {
        type: String,
        required: true,
        trim: true
    },
    points: {
        type: Number,
        default: 0
    }
});

// Empêche un utilisateur d'avoir plusieurs classements pour le même jeu
RankingSchema.index({ user: 1, game: 1 }, { unique: true });

const Ranking = mongoose.model('Ranking', RankingSchema);
module.exports = Ranking;
