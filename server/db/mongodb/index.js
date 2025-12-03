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
  async updateUser(id, data) {
    console.log('Updating user in database:', id, data);
    
    // Use findByIdAndUpdate to update and return the updated document
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true } // new: true returns updated doc, runValidators validates the update
    );
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    console.log('User updated successfully:', updatedUser);
    return updatedUser;
  }



}

module.exports = MongoDatabaseManager;
