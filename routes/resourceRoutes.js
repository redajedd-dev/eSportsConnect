const express = require('express');
const router = express.Router();
// Les chemins changent pour remonter d'un dossier
const Resource = require('../models/resourceModel');
const { auth, coachOrAdminAuth } = require('../authMiddleware');

// @route   POST /api/resources
// @desc    Créer une nouvelle ressource
// @access  Privé (Coach ou Admin)
router.post('/', coachOrAdminAuth, async (req, res) => {
try {
const { title, content, category } = req.body;
const newResource = new Resource({
title,
content,
category,
author: req.user.id
});
const resource = await newResource.save();
res.status(201).json(resource);
} catch (error) {
console.error(error.message);
res.status(500).send('Erreur Serveur');
}
});

// @route   GET /api/resources
// @desc    Obtenir toutes les ressources
// @access  Privé (Tous les utilisateurs connectés)
router.get('/', auth, async (req, res) => {
try {
const resources = await Resource.find().populate('author', 'username').sort({ createdAt: -1 });
res.json(resources);
} catch (error) {
console.error(error.message);
res.status(500).send('Erreur Serveur');
}
});

module.exports = router;