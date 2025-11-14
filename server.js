const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // N'oubliez pas d'importer axios

// Importer les modèles de données
const User = require('./models/userModel');
const Message = require('./models/messageModel');
const Moderation = require('./models/moderationModel'); // NOUVEAU MODÈLE

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5001",
        methods: ["GET", "POST"]
    }
});

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à MongoDB
const MONGO_URI = 'mongodb://127.0.0.1:27017/eSportsConnect';
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Importer les routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const aiRoutes = require('./routes/aiRoutes');
const moderationRoutes = require('./routes/moderationRoutes'); // NOUVELLE ROUTE

// Utiliser les routes de l'API
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/moderation', moderationRoutes); // NOUVELLE ROUTE

// Route "attrape-tout" pour le frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Logique Socket.IO
const userSockets = {}; 

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, 'votreSecretJWT');
            socket.user = decoded.user;
            next();
        } catch (err) {
            return next(new Error('Authentication error'));
        }
    } else {
        return next(new Error('Authentication error'));
    }
});

io.on('connection', (socket) => {
    console.log(`Un utilisateur est connecté: ${socket.user.id}`);
    userSockets[socket.user.id] = socket.id;

    socket.on('private message', async ({ recipient, content }) => {
        try {
            const senderId = socket.user.id;
            const message = new Message({ sender: senderId, recipient, content });
            await message.save();
            const populatedMessage = await Message.findById(message._id).populate('sender', 'username avatarUrl');
            
            const recipientSocketId = userSockets[recipient];
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('private message', populatedMessage);
            }

            // **MODÉRATION AUTOMATIQUE EN ARRIÈRE-PLAN**
            axios.post('http://localhost:5001/api/ai/moderate', { content })
                .then(response => {
                    if (response.data.isToxic) {
                        console.log(`Message signalé par l'IA: ${message._id}`);
                        const newFlag = new Moderation({
                            message: message._id,
                            reason: response.data.reason
                        });
                        newFlag.save();
                    }
                })
                .catch(err => console.error("Erreur lors de l'appel à la modération:", err.message));

        } catch (error) {
            console.error('Erreur socket.io:', error);
        }
    });

    socket.on('disconnect', () => {
        delete userSockets[socket.user.id];
        console.log(`Utilisateur déconnecté: ${socket.user.id}`);
    });
});

const PORT = 5001;
server.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

