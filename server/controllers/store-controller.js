const Playlist = require('../models/playlist-model')
const User = require('../models/user-model');

//changing so it uses db instead of mongoose models
const auth = require('../auth')
const db = require('../db')

createPlaylist = async (req, res) => {
    const body = req.body;
    
    if (!body || !body.name) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Playlist name is required'
      });
    }
  
    const playlist = new Playlist({
      name: body.name,
      ownerEmail: req.userEmail,
      songs: body.songs || []
    });
  
    try {
      const savedPlaylist = await playlist.save();
      return res.status(201).json({
        success: true,
        playlist: savedPlaylist
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Failed to create playlist'
      });
    }
  };
  
  // Delete playlist by ID
  deletePlaylist = async (req, res) => {
    try {
      const playlist = await Playlist.findById(req.params.id);
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          errorMessage: 'Playlist not found'
        });
      }
      
      if (playlist.ownerEmail !== req.userEmail) {
        return res.status(403).json({
          success: false,
          errorMessage: 'Access denied'
        });
      }
      
      await Playlist.findByIdAndDelete(req.params.id);
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Failed to delete playlist'
      });
    }
  };
  
  // Get playlist by ID
  getPlaylistById = async (req, res) => {
    try {
      const playlist = await Playlist.findById(req.params.id);
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          errorMessage: 'Playlist not found'
        });
      }
      
      if (playlist.ownerEmail !== req.userEmail) {
        return res.status(403).json({
          success: false,
          errorMessage: 'Access denied'
        });
      }
      
      return res.status(200).json({
        success: true,
        playlist: playlist
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Failed to fetch playlist'
      });
    }
  };
  
  // Get playlist pairs (id and name) for logged in user - includes full data for display
  getPlaylistPairs = async (req, res) => {
    try {
      const playlists = await Playlist.find({ ownerEmail: req.userEmail })
        .sort({ updatedAt: -1 });
      
      const pairs = playlists.map(playlist => ({
        _id: playlist._id,
        name: playlist.name,
        ownerEmail: playlist.ownerEmail,
        songs: playlist.songs,
        listens: playlist.listens || 0,
        likes: playlist.likes || 0,
        dislikes: playlist.dislikes || 0,
        published: playlist.published || false,
        publishedDate: playlist.publishedDate
      }));
      
      return res.status(200).json({
        success: true,
        idNamePairs: pairs
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Failed to fetch playlists'
      });
    }
  };
  
  // Get all playlists for logged in user
  getPlaylists = async (req, res) => {
    try {
      const playlists = await Playlist.find({ ownerEmail: req.userEmail })
        .sort({ updatedAt: -1 });
      
      return res.status(200).json({
        success: true,
        playlists: playlists
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Failed to fetch playlists'
      });
    }
  };
  
  // Update playlist
  updatePlaylist = async (req, res) => {
    try {
      const { playlist } = req.body;
      
      const existingPlaylist = await Playlist.findById(req.params.id);
      
      if (!existingPlaylist) {
        return res.status(404).json({
          success: false,
          errorMessage: 'Playlist not found'
        });
      }
      
      if (existingPlaylist.ownerEmail !== req.userEmail) {
        return res.status(403).json({
          success: false,
          errorMessage: 'Access denied'
        });
      }
      
      // Update fields
      if (playlist.name !== undefined) existingPlaylist.name = playlist.name;
      if (playlist.songs !== undefined) existingPlaylist.songs = playlist.songs;
      if (playlist.listens !== undefined) existingPlaylist.listens = playlist.listens;
      if (playlist.likes !== undefined) existingPlaylist.likes = playlist.likes;
      if (playlist.dislikes !== undefined) existingPlaylist.dislikes = playlist.dislikes;
      if (playlist.published !== undefined) existingPlaylist.published = playlist.published;
      if (playlist.publishedDate !== undefined) existingPlaylist.publishedDate = playlist.publishedDate;
      
      const updatedPlaylist = await existingPlaylist.save();
      return res.status(200).json({
        success: true,
        playlist: updatedPlaylist
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Failed to update playlist'
      });
    }
  };
  
  module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
  };
  