const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, adminAuth } = require('../authMiddleware');

// --- Inscription ---
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, diplomaUrl } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà." });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword, 
            role,
            diplomaUrl: role === 'coach' ? diplomaUrl : undefined
        });

        await newUser.save();
        res.status(201).json({ message: `Compte pour ${username} créé avec succès !` });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la création du compte." });
    }
});

// --- Connexion ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, 'votreSecretJWT', { expiresIn: '1h' });
        
        res.json({ message: `Connexion réussie !`, token });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la connexion." });
    }
});

// --- Obtenir les informations de l'utilisateur courant ---
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).send('Erreur Serveur');
    }
});

// --- Obtenir la liste de tous les utilisateurs pour le chat ---
router.get('/list', auth, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }).select('username avatarUrl');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// --- Obtenir la liste des streamers ---
router.get('/streams', auth, async (req, res) => {
    try {
        const streamers = await User.find({ streamChannel: { $ne: '' } }).select('username streamChannel avatarUrl');
        res.json(streamers);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// --- Routes d'administration ---
router.get('/all', adminAuth, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
});

router.put('/:id/role', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
});

router.put('/:id/verify', adminAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
});

// --- Routes de Profil ---
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.put('/profile/update', auth, async (req, res) => {
    try {
        const { bio, avatarUrl, streamChannel } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id, 
            { bio, avatarUrl, streamChannel }, 
            { new: true }
        ).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.post('/profile/game', auth, async (req, res) => {
    try {
        const { game, ign, rank } = req.body;
        const user = await User.findById(req.user.id);
        user.gameProfiles.push({ game, ign, rank });
        await user.save();
        res.status(201).json(user.gameProfiles);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.delete('/profile/game/:gameId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const gameProfile = user.gameProfiles.id(req.params.gameId);
        if (gameProfile) {
            gameProfile.remove();
        }
        await user.save();
        res.json({ message: "Profil de jeu supprimé" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
