class DatabaseManager {
    async connect() { throw new Error("connect() not implemented"); }
    async getUserByEmail(email) { throw new Error("getUserByEmail() not implemented"); }
    async createUser(userData) { throw new Error("createUser() not implemented"); }
    async getPlaylistsByEmail(email) { throw new Error("getPlaylistsByEmail() not implemented"); }
    async getPlaylistById(id) { throw new Error("getPlaylistById() not implemented"); }
    async createPlaylist(data) { throw new Error("createPlaylist() not implemented"); }
    async updatePlaylist(id, data) { throw new Error("updatePlaylist() not implemented"); }
    async deletePlaylist(id) { throw new Error("deletePlaylist() not implemented"); }
    async getAllPlaylists() { throw new Error("getAllPlaylists() not implemented"); }
    async updateUser(id, data) { throw new Error("updateUser() not implemented"); }
    async getUserById(id) {
      try {
          const user = await User.findById(id).select('-passwordHash');
          return user;
      } catch (error) {
          console.error('DB: Error getting user by ID:', error);
          throw error;
      }
  }


  }
  
  module.exports = DatabaseManager;
  