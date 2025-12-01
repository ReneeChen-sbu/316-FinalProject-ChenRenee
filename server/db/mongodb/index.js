const mongoose = require('mongoose');
const User = require('../../models/user-model');
const Playlist = require('../../models/playlist-model');
const DatabaseManager = require('../manager');

class MongoDatabaseManager extends DatabaseManager {
  async connect() {
    await mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  }

  async getUserByEmail(email) { return await User.findOne({ email }); }
  async createUser(data) { const user = new User(data); return await user.save(); }
  async getPlaylistsByUser(email){
    return await Playlist.find({ ownerEmail: email });
 }
 
  async createPlaylist(data) { const playlist = new Playlist(data); return await playlist.save(); }
  async getPlaylistsByEmail(email) { return await Playlist.find({ ownerEmail: email }); }
  async getPlaylistById(id) { return await Playlist.findById(id); }
  async updatePlaylist(id, data) { return await Playlist.findByIdAndUpdate(id, data, { new: true }); }
  async deletePlaylist(id) { return await Playlist.findByIdAndDelete(id); }
  async getAllPlaylists() { return await Playlist.find({}); }
  async getUserById(id) { return await User.findById(id); }



}

module.exports = MongoDatabaseManager;
