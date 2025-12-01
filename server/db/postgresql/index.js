const { Sequelize, DataTypes } = require('sequelize');
const DatabaseManager = require('../manager');
require('dotenv').config();



class PostgreDatabaseManager extends DatabaseManager {
  constructor() {
    super();
    this.sequelize = new Sequelize(
      process.env.POSTGRE_DB,
      process.env.POSTGRE_USER,
      process.env.POSTGRE_PASSWORD,
      {
        host: process.env.POSTGRE_HOST,
        dialect: 'postgres',
        port: process.env.POSTGRE_PORT
      }
    );

    this.User = this.sequelize.define('User', {
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      password_hash: DataTypes.STRING
    });

    this.Playlist = this.sequelize.define('Playlist', {
        name: DataTypes.STRING,
        owner_email: DataTypes.STRING,
        songs: { type: DataTypes.JSON }
      });
      
  }

  async connect() {
    await this.sequelize.authenticate();
    await this.sequelize.sync({ force: false });
    console.log('Connected to PostgreSQL via Sequelize');
  }

  async getUserByEmail(email) { return await this.User.findOne({ where: { email } }); }
  async createUser(data) { return await this.User.create(data); }
  
  async createPlaylist({ name, songs, ownerEmail }) {
    return await this.Playlist.create({
      name,
      owner_email: ownerEmail,
      songs: songs || []
    });
  }
  
  async getPlaylistsByUser(email) {
    console.log("DB getting playlists for email:", email)
    return await this.Playlist.findAll({
        where: { owner_email: email }
    });
  }

  async getPlaylistsByEmail(email) { return await this.Playlist.findAll({ where: { owner_email: email }}); }
  async getPlaylistById(id) { return await this.Playlist.findByPk(id); }
  async updatePlaylist(id, playlist) {
    return await this.Playlist.update(
        { 
          name: playlist.name,
          songs: playlist.songs,
          owner_email: playlist.ownerEmail 
        },
        { where: { id } }
    );
}

  async deletePlaylist(id) { return await this.Playlist.destroy({ where: { id }}); }
  async getAllPlaylists() { return await this.Playlist.findAll(); }
  async getUserById(id) { return await this.User.findByPk(id); }



}

module.exports = PostgreDatabaseManager;
