const express = require('express');
const router = express.Router();
// Les chemins changent pour remonter d'un dossier
const Ranking = require('../models/rankingModel');
const User = require('../models/userModel');
const { auth } = require('../authMiddleware');

// @route   GET /api/rankings/:game
// @desc    Obtenir le classement pour un jeu spécifique
// @access  Privé
router.get('/:game', auth, async (req, res) => {
try {
const game = req.params.game;
const rankings = await Ranking.find({ game: game })
.populate('user', 'username')
.sort({ points: -1 })
.limit(20);

    res.json(rankings);
} catch (error) {
    console.error(error.message);
    res.status(500).send('Erreur Serveur');
}
});

module.exports = router;

