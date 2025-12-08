const Playlist = require('../models/playlist-model')
const User = require('../models/user-model');
const Song = require('../models/song-model'); // ADD THIS
const auth = require('../auth')
const mongoose = require('mongoose');

createPlaylist = async (req, res) => {
    const body = req.body;
    const userId = req.userId; // Use userId from auth middleware
    
    if (!body || !body.name) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Playlist name is required'
      });
    }
  
    // Get user to check name uniqueness
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        errorMessage: 'User not found'
      });
    }
    
    // Check if user already has a playlist with this name
    const existingPlaylist = await Playlist.findOne({
      owner: userId,
      name: body.name
    });
    
    if (existingPlaylist) {
      return res.status(400).json({
        success: false,
        errorMessage: 'You already have a playlist with this name'
      });
    }
  
    const playlist = new Playlist({
      name: body.name,
      owner: userId, // Use ObjectId, not email
      songs: body.songs || []
    });
  
    try {
      const savedPlaylist = await playlist.save();
      // Populate before returning
      const populatedPlaylist = await Playlist.findById(savedPlaylist._id)
        .populate('owner', 'userName email')
        .populate('songs');
        
      return res.status(201).json({
        success: true,
        playlist: populatedPlaylist
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Failed to create playlist: ' + err.message
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
      
      // Check if user owns this playlist
      if (playlist.owner.toString() !== req.userId) {
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
        const playlistId = req.params.id;
        
        // Check if it's a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(playlistId)) {
            return res.status(400).json({
                success: false,
                errorMessage: 'Invalid playlist ID'
            });
        }
        
        const playlist = await Playlist.findById(playlistId)
            .populate('owner', 'userName email')
            .populate('songs');
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Playlist not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            playlist: playlist
        });
    } catch (err) {
        console.error('getPlaylistById error:', err);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to fetch playlist'
        });
    }
};

// Get playlist pairs (id and name) for logged in user 
getPlaylistPairs = async (req, res) => {
    try {
      const userId = req.userId;
      
      // Get user's playlists + public playlists
      const playlists = await Playlist.find({
        $or: [
          { owner: userId },
          { published: true }
        ]
      })
      .populate('owner', 'userName email')
      .populate('songs')
      .sort({ updatedAt: -1 });
  
      const pairs = playlists.map(playlist => ({
        _id: playlist._id,
        name: playlist.name,
        ownerName: playlist.owner.userName,
        ownerEmail: playlist.owner.email,
        songs: playlist.songs,
        listenerCount: playlist.listenerCount || 0,
        published: playlist.published || true
      }));
  
      return res.status(200).json({
        success: true,
        idNamePairs: pairs
      });
    } catch (err) {
      console.error('getPlaylistPairs error:', err);
      return res.status(500).json({
        success: false,
        errorMessage: 'Failed to fetch playlists'
      });
    }
};

// Get all playlists for logged in user
getPlaylists = async (req, res) => {
    try {
      const userId = req.userId;
      
      const playlists = await Playlist.find({ owner: userId })
        .populate('owner', 'userName email')
        .populate('songs')
        .sort({ updatedAt: -1 });
      
      return res.status(200).json({
        success: true,
        playlists: playlists
      });
    } catch (err) {
      console.error('getPlaylists error:', err);
      return res.status(500).json({
        success: false,
        errorMessage: 'Failed to fetch playlists'
      });
    }
};

// Update playlist
updatePlaylist = async (req, res) => {
    try {
      const playlistId = req.params.id;
      const userId = req.userId;
      const updateData = req.body;
      
      const playlist = await Playlist.findById(playlistId);
      
      if (!playlist) {
        return res.status(404).json({
          success: false,
          errorMessage: 'Playlist not found'
        });
      }
      
      // Check ownership
      if (playlist.owner.toString() !== userId) {
        return res.status(403).json({
          success: false,
          errorMessage: 'Access denied'
        });
      }
      
      // Update fields
      if (updateData.name !== undefined) {
        // Check name uniqueness for this user
        const existing = await Playlist.findOne({
          owner: userId,
          name: updateData.name,
          _id: { $ne: playlistId }
        });
        
        if (existing) {
          return res.status(400).json({
            success: false,
            errorMessage: 'You already have a playlist with this name'
          });
        }
        
        playlist.name = updateData.name;
      }
      
      if (updateData.songs !== undefined) {
        playlist.songs = updateData.songs;
      }
      
      if (updateData.listenerCount !== undefined) {
        playlist.listenerCount = updateData.listenerCount;
      }
      
      if (updateData.published !== undefined) {
        playlist.published = updateData.published;
      }
      
      playlist.updatedAt = new Date();
      
      const updatedPlaylist = await playlist.save();
      
      // Populate before returning
      const populatedPlaylist = await Playlist.findById(updatedPlaylist._id)
        .populate('owner', 'userName email')
        .populate('songs');
      
      return res.status(200).json({
        success: true,
        playlist: populatedPlaylist
      });
    } catch (err) {
      console.error('updatePlaylist error:', err);
      return res.status(500).json({
        success: false,
        errorMessage: 'Failed to update playlist: ' + err.message
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