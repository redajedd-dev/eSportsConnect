const express = require('express');
const router = express.Router();
const Tournament = require('../models/tournamentModel');
const User = require('../models/userModel');
const Ranking = require('../models/rankingModel');
// CORRECTION : On importe le bon middleware
const { auth, adminAuth, coachOrAdminAuth } = require('../authMiddleware');

// @route   POST /api/tournaments
// @desc    Créer un nouveau tournoi
// @access  Privé (Coach ou Admin)
// CORRECTION : On utilise 'coachOrAdminAuth' au lieu de 'adminAuth'
router.post('/', coachOrAdminAuth, async (req, res) => {
    try {
        const { name, game, startDate } = req.body;
        const newTournament = new Tournament({
            name,
            game,
            startDate,
            createdBy: req.user.id
        });
        const tournament = await newTournament.save();
        res.status(201).json(tournament);
    } catch (error) {
        res.status(500).send('Erreur Serveur');
    }
});

// @route   GET /api/tournaments
// @desc    Obtenir tous les tournois
// @access  Privé
router.get('/', auth, async (req, res) => {
    try {
        const tournaments = await Tournament.find().populate('participants', 'username').sort({ startDate: 1 });
        res.json(tournaments);
    } catch (error) {
        res.status(500).send('Erreur Serveur');
    }
});

// @route   GET /api/tournaments/:id
// @desc    Obtenir un tournoi par ID
// @access  Privé
router.get('/:id', auth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('participants', 'username');
        if (!tournament) return res.status(404).json({ message: 'Tournoi non trouvé' });
        res.json(tournament);
    } catch (error) {
        res.status(500).send('Erreur Serveur');
    }
});


// @route   POST /api/tournaments/:id/register
// @desc    S'inscrire à un tournoi
// @access  Privé (Player)
router.post('/:id/register', auth, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) return res.status(404).json({ message: 'Tournoi non trouvé' });

        if (tournament.participants.some(p => p.toString() === req.user.id)) {
            return res.status(400).json({ message: 'Vous êtes déjà inscrit à ce tournoi' });
        }
        
        tournament.participants.push(req.user.id);
        await tournament.save();
        res.json(tournament);
    } catch (error) {
        res.status(500).send('Erreur Serveur');
    }
});

// @route   POST /api/tournaments/:id/complete
// @desc    Marquer un tournoi comme terminé et désigner un vainqueur
// @access  Privé (Coach ou Admin)
router.post('/:id/complete', coachOrAdminAuth, async (req, res) => {
    try {
        const { winnerId } = req.body;
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) return res.status(404).json({ message: 'Tournoi non trouvé' });
        
        tournament.status = 'completed';
        tournament.winner = winnerId;
        await tournament.save();

        const pointsForWin = 10;
        let ranking = await Ranking.findOne({ user: winnerId, game: tournament.game });
        if (ranking) {
            ranking.points += pointsForWin;
        } else {
            ranking = new Ranking({ user: winnerId, game: tournament.game, points: pointsForWin });
        }
        await ranking.save();

        res.json({ message: 'Tournoi terminé et classement mis à jour.' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur Serveur');
    }
});

module.exports = router;
