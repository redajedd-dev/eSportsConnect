const express = require('express');
const router = express.Router();
const Course = require('../models/courseModel');
const { auth, coachOrAdminAuth } = require('../authMiddleware');

// @route   POST /api/courses
// @desc    Créer un nouveau cours
// @access  Privé (Coach ou Admin)
router.post('/', coachOrAdminAuth, async (req, res) => {
    try {
        // CORRECTION : On récupère 'game' au lieu de 'category'
        const { title, description, videoUrl, game } = req.body;
        const newCourse = new Course({
            title,
            description,
            videoUrl,
            game, // Et on le sauvegarde ici
            coach: req.user.id
        });
        const course = await newCourse.save();
        res.status(201).json(course);
    } catch (error) {
        console.error("Erreur de création de cours:", error);
        res.status(500).send('Erreur Serveur');
    }
});

// @route   GET /api/courses
// @desc    Obtenir tous les cours
// @access  Privé (Tous les utilisateurs connectés)
router.get('/', auth, async (req, res) => {
    try {
        const courses = await Course.find().populate('coach', 'username').sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        console.error("Erreur de récupération des cours:", error);
        res.status(500).send('Erreur Serveur');
    }
});

module.exports = router;

