const mongoose = require('mongoose');

const gameProfileSchema = new mongoose.Schema({
game: { type: String, required: true },
ign: { type: String, required: true }, // In-Game Name
rank: { type: String }
});

const userSchema = new mongoose.Schema({
username: { type: String, required: true, unique: true },
email: { type: String, required: true, unique: true },
password: { type: String, required: true },
role: {
type: String,
enum: ['player', 'coach', 'admin'],
default: 'player'
},
bio: { type: String, default: '' },
avatarUrl: { type: String, default: '' },
gameProfiles: [gameProfileSchema],
// NOUVEAU CHAMP POUR LE STREAMING
streamChannel: { type: String, default: '' }, // Nom de la chaîne Twitch/YouTube
diplomaUrl: { type: String },
isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;