const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    youTubeId: {
        type: String,
        required: true
    },
    listenCount: {  
        type: Number,
        default: 0
    },
    playlistCount: {  
        type: Number,
        default: 0
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index: No two songs can have same title, artist, and year
SongSchema.index({ title: 1, artist: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Song', SongSchema);