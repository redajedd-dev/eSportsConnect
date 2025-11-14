const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Course = require('../models/courseModel');
const Tournament = require('../models/tournamentModel');
const { auth } = require('../authMiddleware');
const axios = require('axios');

// @route   GET /api/ai/recommendations
// @desc    Obtenir des recommandations de cours et tournois
// @access  Privé
router.get('/recommendations', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.gameProfiles.length === 0) {
            return res.json({ courses: [], tournaments: [] });
        }
        const userGames = user.gameProfiles.map(p => p.game);
        
        const recommendedCourses = await Course.find({ 
            'game': { $in: userGames } 
        }).populate('coach', 'username').limit(2);

        const recommendedTournaments = await Tournament.find({ 
            'game': { $in: userGames },
            'status': 'upcoming' 
        }).limit(2);

        res.json({ courses: recommendedCourses, tournaments: recommendedTournaments });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des recommandations.' });
    }
});

// @route   POST /api/ai/analyze-stats
// @desc    Analyser les statistiques de jeu d'un utilisateur
// @access  Privé
router.post('/analyze-stats', auth, async (req, res) => {
    try {
        const { game, kills, deaths, assists, matchDuration } = req.body;
        if (game == null || kills == null || deaths == null || assists == null || matchDuration == null) {
            return res.status(400).json({ message: "Veuillez fournir toutes les statistiques." });
        }
        const kda = deaths === 0 ? (kills + assists) : ((kills + assists) / deaths).toFixed(2);

        const prompt = `
            Agis en tant que coach e-sport expert. Analyse les statistiques de match suivantes pour le jeu "${game}".
            Fournis une analyse structurée en 3 parties claires, formatée en HTML simple (<h4>, <p>, <ul>, <li>).
            1. <h4>Résumé Court</h4><p>Un résumé très bref de la performance.</p>
            2. <h4>Points Forts</h4><ul><li>Un ou deux points positifs.</li></ul>
            3. <h4>Axes d'Amélioration</h4><ul><li>Un ou deux conseils constructifs.</li></ul>
            Sois encourageant et direct.
        `;

        const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
            model: "phi",
            prompt: prompt,
            stream: false
        });

        res.json({ analysis: ollamaResponse.data.response });
    } catch (error) {
        res.status(500).json({ message: "L'IA n'a pas pu analyser les statistiques." });
    }
});

// NOUVELLE ROUTE POUR LA MODÉRATION
// @route   POST /api/ai/moderate
// @desc    Analyser un message pour détecter la toxicité
// @access  Interne (appelé par le serveur)
router.post('/moderate', async (req, res) => {
    try {
        const { content } = req.body;

        const prompt = `
            Agis comme un modérateur de contenu très strict pour une plateforme de gaming. 
            Analyse le message suivant : "${content}".
            Ta réponse DOIT être uniquement un objet JSON valide, sans aucun autre texte.
            Si le message contient des insultes, du harcèlement, des propos haineux ou est globalement toxique, réponds :
            {"isToxic": true, "reason": "Langage inapproprié détecté."}
            Sinon, si le message est acceptable, réponds :
            {"isToxic": false}
        `;

        const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
            model: "phi",
            prompt: prompt,
            stream: false,
            format: "json" // On demande explicitement du JSON
        });
        
        const analysis = JSON.parse(ollamaResponse.data.response);
        res.json(analysis);

    } catch (error) {
        console.error("Erreur de modération IA:", error.message);
        res.json({ isToxic: false });
    }
});

module.exports = router;

