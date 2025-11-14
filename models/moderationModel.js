const mongoose = require('mongoose');

const moderationSchema = new mongoose.Schema({
    message: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message', 
        required: true 
    },
    flaggedBy: { 
        type: String, 
        default: 'IA' 
    },
    reason: { 
        type: String, 
        required: true 
    }, // Ex: "Langage toxique détecté"
    status: { 
        type: String, 
        enum: ['pending', 'reviewed'], 
        default: 'pending' 
    },
}, { timestamps: true });

const Moderation = mongoose.model('Moderation', moderationSchema);

module.exports = Moderation;
