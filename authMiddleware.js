const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
const token = req.header('Authorization')?.replace('Bearer ', '');
if (!token) {
return res.status(401).json({ message: 'Accès refusé, token manquant.' });
}
try {
const decoded = jwt.verify(token, 'votreSecretJWT');
req.user = decoded.user;
next();
} catch (err) {
res.status(401).json({ message: 'Token invalide.' });
}
};

const adminAuth = (req, res, next) => {
auth(req, res, () => {
if (req.user.role === 'admin') {
next();
} else {
res.status(403).json({ message: 'Accès refusé. Réservé aux administrateurs.' });
}
});
};

// NOUVEAU : Middleware pour les coachs et les admins
const coachOrAdminAuth = (req, res, next) => {
auth(req, res, () => {
if (req.user.role === 'coach' || req.user.role === 'admin') {
next();
} else {
res.status(403).json({ message: 'Accès refusé. Réservé aux coachs et administrateurs.' });
}
});
};

module.exports = { auth, adminAuth, coachOrAdminAuth };