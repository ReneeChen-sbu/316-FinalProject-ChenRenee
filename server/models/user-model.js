const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const UserSchema = new mongoose.Schema({
    userName: { type: String },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);