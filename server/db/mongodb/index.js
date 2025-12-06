const mongoose = require('mongoose');

class MongoDatabaseManager {
    constructor() {
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/playlister';
    }

    async connect() {
        try {
            await mongoose.connect(this.uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Connected to MongoDB');
        } catch (err) {
            console.error('MongoDB connection error:', err);
            process.exit(1);
        }
    }

    // User methods
    async getUserByEmail(email) {
        return await mongoose.model('User').findOne({ email });
    }

    async getUserById(id) {
        return await mongoose.model('User').findById(id);
    }

    async createUser(userData) {
        const User = mongoose.model('User');
        const user = new User(userData);
        return await user.save();
    }

    // Playlist methods
    async getPlaylistById(id) {
        return await mongoose.model('Playlist')
            .findById(id)
            .populate('owner', 'userName email')
            .populate('songs');
    }

    async getPlaylistsByOwner(ownerId) {
        return await mongoose.model('Playlist')
            .find({ owner: ownerId })
            .populate('owner', 'userName email')
            .populate('songs');
    }

    async createPlaylist(playlistData) {
        const Playlist = mongoose.model('Playlist');
        const playlist = new Playlist(playlistData);
        return await playlist.save();
    }

    // Song methods
    async getSongById(id) {
        return await mongoose.model('Song').findById(id);
    }

    async findSongs(searchCriteria) {
        const Song = mongoose.model('Song');
        let query = {};
        
        if (searchCriteria.title) {
            query.title = { $regex: searchCriteria.title, $options: 'i' };
        }
        if (searchCriteria.artist) {
            query.artist = { $regex: searchCriteria.artist, $options: 'i' };
        }
        if (searchCriteria.year) {
            query.year = searchCriteria.year;
        }
        
        return await Song.find(query).populate('addedBy', 'userName');
    }

    async createSong(songData) {
        const Song = mongoose.model('Song');
        const song = new Song(songData);
        return await song.save();
    }
}

module.exports = MongoDatabaseManager;