const Playlist = require('../models/playlist-model');
const User = require('../models/user-model');
const Song = require('../models/song-model');
const mongoose = require('mongoose');

// CREATE playlist
const createPlaylist = async (req, res) => {
  try {
    const { name, songs = [] } = req.body;
    const userId = req.userId; // From auth middleware

    if (!name) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Playlist name is required'
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        errorMessage: 'Not logged in'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        errorMessage: 'User not found'
      });
    }

    // Check for duplicate playlist name for this user
    const existingPlaylist = await Playlist.findOne({
      owner: userId,
      name: name
    });

    if (existingPlaylist) {
      return res.status(400).json({
        success: false,
        errorMessage: 'You already have a playlist with this name'
      });
    }

    const playlist = new Playlist({
      name,
      owner: userId,
      songs: songs || [],
      listenerCount: 0,
      published: true
    });

    const saved = await playlist.save();
    
    // Populate before returning
    const populated = await Playlist.findById(saved._id)
      .populate('owner', 'userName email')
      .populate('songs');

    return res.status(201).json({
      success: true,
      playlist: populated
    });
  } catch (err) {
    console.error('createPlaylist error:', err);
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to create playlist: ' + err.message
    });
  }
};

// DELETE playlist
const deletePlaylist = async (req, res) => {
  try {
    const userId = req.userId;
    const playlistId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Invalid playlist ID'
      });
    }

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

    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('deletePlaylist error:', err);
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to delete playlist'
    });
  }
};

// GET playlist by id
const getPlaylistById = async (req, res) => {
  try {
    const playlistId = req.params.id;
    console.log('🎵 SERVER: getPlaylistById called with ID:', playlistId);
    
    // This might be getting called with "guest" as the ID!
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        console.log('🎵 SERVER: Invalid playlist ID:', playlistId);
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

    // Check if user can access this playlist
    const userId = req.userId;
    if (!playlist.published && (!userId || playlist.owner.toString() !== userId)) {
      return res.status(403).json({
        success: false,
        errorMessage: 'Access denied - playlist is private'
      });
    }

    return res.status(200).json({
      success: true,
      playlist
    });
  } catch (err) {
    console.error('getPlaylistById error:', err);
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to fetch playlist'
    });
  }
};

// GET id-name pairs for logged-in user
const getPlaylistPairs = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        errorMessage: 'Not logged in'
      });
    }

    const playlists = await Playlist.find({ owner: userId })
      .populate('owner', 'userName email')
      .populate('songs')
      .sort({ updatedAt: -1 });

    const pairs = playlists.map(playlist => ({
      _id: playlist._id,
      name: playlist.name,
      ownerName: playlist.owner?.userName || 'Unknown',
      ownerEmail: playlist.owner?.email || 'unknown@example.com',
      songs: playlist.songs || [],
      listenerCount: playlist.listenerCount || 0,
      published: playlist.published ?? true
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



// GET all playlists for logged-in user (full docs, not pairs)
const getPlaylists = async (req, res) => {
  try {
    const userId = req.userId;
    const playlists = await Playlist.find({ owner: userId })
      .populate('owner', 'userName email')
      .populate('songs')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      playlists
    });
  } catch (err) {
    console.error('getPlaylists error:', err);
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to fetch playlists'
    });
  }
};

// UPDATE playlist
const updatePlaylist = async (req, res) => {
  try {
    const userId = req.userId;
    const playlistId = req.params.id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
      return res.status(400).json({
        success: false,
        errorMessage: 'Invalid playlist ID'
      });
    }

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
      // Check for duplicate name
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

    const updated = await playlist.save();
    
    // Populate before returning
    const populated = await Playlist.findById(updated._id)
      .populate('owner', 'userName email')
      .populate('songs');

    return res.status(200).json({
      success: true,
      playlist: populated
    });
  } catch (err) {
    console.error('updatePlaylist error:', err);
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to update playlist: ' + err.message
    });
  }
};

// GUEST / public library – get all published playlists
const getGuestPlaylists = async (req, res) => {
  try {
    console.log('🎵 SERVER: getGuestPlaylists called');
    
    // Make sure this doesn't have any playlist ID validation
    // It should just return all playlists, not validate a specific ID
    
    const playlists = await Playlist.find({ published: true })
      .populate('owner', 'userName email')
      .populate('songs')
      .sort({ updatedAt: -1 });

    console.log('🎵 SERVER: Found', playlists.length, 'playlists');

    const pairs = playlists.map(playlist => ({
      _id: playlist._id,
      name: playlist.name,
      ownerName: playlist.owner?.userName || 'Unknown',
      ownerEmail: playlist.owner?.email || 'unknown@example.com',
      songs: playlist.songs || [],
      listenerCount: playlist.listenerCount || 0,
      published: playlist.published || true
    }));

    console.log('🎵 SERVER: Returning', pairs.length, 'playlists to client');
    
    return res.status(200).json({
      success: true,
      idNamePairs: pairs
    });
    
  } catch (err) {
    console.error('🎵 SERVER: getGuestPlaylists error:', err);
    return res.status(500).json({
      success: false,
      errorMessage: 'Server error: ' + err.message
    });
  }
};

module.exports = {
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getPlaylistPairs,
  getPlaylists,
  updatePlaylist,
  getGuestPlaylists
};