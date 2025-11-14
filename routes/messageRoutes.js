// messageRoutes.js

const express = require('express');
const router = express.Router();
const { auth } = require('../authMiddleware'); // <-- CORRECTION : On importe 'auth' depuis l'objet
const Message = require('../models/messageModel');

/**
 * @route   GET /api/messages/:otherUserId
 * @desc    Récupérer l'historique de la conversation avec un autre utilisateur
 * @access  Privé
 */
router.get('/:otherUserId', auth, async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const otherUserId = req.params.otherUserId;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 'asc' }); // Récupérer les messages par ordre chronologique

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur.' });
    }
});

module.exports = router;
