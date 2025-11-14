
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
title: { type: String, required: true },
content: { type: String, required: true }, // Le contenu de l'article, peut être du Markdown
category: { type: String, required: true },
author: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true
},
}, { timestamps: true });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;