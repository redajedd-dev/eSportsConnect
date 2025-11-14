const express = require('express');
const router = express.Router();
const Moderation = require('../models/moderationModel');
const Message = require('../models/messageModel');
const { adminAuth } = require('../authMiddleware');

// @route   GET /api/moderation/pending
// @desc    Obtenir tous les messages signalés en attente
// @access  Admin
router.get('/pending', adminAuth, async (req, res) => {
    try {
        const flaggedMessages = await Moderation.find({ status: 'pending' })
            .populate({
                path: 'message',
                populate: [
                    { path: 'sender', select: 'username' },
                    { path: 'recipient', select: 'username' }
                ]
            })
            .sort({ createdAt: -1 });
        res.json(flaggedMessages);
    } catch (error) {
        res.status(500).send('Erreur Serveur');
    }
});

// @route   PUT /api/moderation/:id/review
// @desc    Marquer un signalement comme examiné
// @access  Admin
router.put('/:id/review', adminAuth, async (req, res) => {
    try {
        const moderation = await Moderation.findByIdAndUpdate(req.params.id, { status: 'reviewed' }, { new: true });
        if (!moderation) return res.status(404).json({ msg: 'Signalement non trouvé' });
        res.json(moderation);
    } catch (error) {
        res.status(500).send('Erreur Serveur');
    }
});

module.exports = router;
