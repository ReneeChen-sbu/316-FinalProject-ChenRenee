const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song'
    }],
    listenerCount: {  
        type: Number,
        default: 0
    },
    published: {
        type: Boolean,
        default: true
    },
    publishedDate: {
        type: Date,
        default: Date.now
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

// Compound index: No user can have two playlists with same name
PlaylistSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);