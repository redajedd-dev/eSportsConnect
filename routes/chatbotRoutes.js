// chatbotRoutes.js

const express = require('express');
const router = express.Router();
const axios = require('axios'); // Pour faire des requêtes HTTP à Ollama

/**
 * @route   POST /api/chatbot/ask
 * @desc    Envoyer une question à l'assistant IA (Ollama)
 * @access  Privé
 */
router.post('/ask', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ message: 'Un message est requis.' });
    }

    try {
        // On envoie la requête à l'API d'Ollama qui tourne localement
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'phi', // Le modèle que vous avez installé
            // On ajoute un contexte pour que l'IA sache qui elle est
            prompt: `System: Tu es un assistant eSport pour la plateforme eSportsConnect. Sois concis et utile. \nUser: ${prompt}\nAssistant:`,
            stream: false // Pour plus de simplicité, on attend la réponse complète
        });

        // On renvoie la réponse de l'IA au frontend
        res.json({ reply: response.data.response });

    } catch (error) {
        console.error("Erreur de communication avec Ollama:", error.message);
        res.status(500).json({ message: "L'assistant IA n'est pas disponible pour le moment." });
    }
});

module.exports = router;
