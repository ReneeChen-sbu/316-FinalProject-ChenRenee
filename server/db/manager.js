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
    async getUserByEmail(email) { throw new Error("getUserByEmail() not implemented"); }
    async createUser(userData) { throw new Error("createUser() not implemented"); }
    async getPlaylistsByEmail(email) { throw new Error("getPlaylistsByEmail() not implemented"); }
    async getPlaylistById(id) {
      return await mongoose.model('Playlist')
        .findById(id)
        .populate('owner', 'userName email avatar')   
        .populate('songs');
    }
    
    async getPlaylistsByOwner(ownerId) {
      return await mongoose.model('Playlist')
        .find({ owner: ownerId })
        .populate('owner', 'userName email avatar')   
        .populate('songs');
    }
    
    async createPlaylist(data) { throw new Error("createPlaylist() not implemented"); }
    async updatePlaylist(id, data) { throw new Error("updatePlaylist() not implemented"); }
    async deletePlaylist(id) { throw new Error("deletePlaylist() not implemented"); }
    async getAllPlaylists() { throw new Error("getAllPlaylists() not implemented"); }
    async updateUser(id, data) { throw new Error("updateUser() not implemented"); }
    async getUserById(id) {
      try {
          const user = await User.findById(id).select('-passwordHash');
          console.log('DB getUserById result:', {
              id: user?._id,
              userName: user?.userName,
              avatar: user?.avatar?.substring(0, 30),
              avatarImage: user?.avatarImage
          });
          return user;
      } catch (error) {
          console.error('DB: Error getting user by ID:', error);
          throw error;
      }
  }


  }
  
  module.exports = MongoDatabaseManager;
  