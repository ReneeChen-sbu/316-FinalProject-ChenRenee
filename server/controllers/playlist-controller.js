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
      .populate('owner', 'userName email avatar')
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

// COPY Playlists
 const copyPlaylist = async (req, res) => {
  console.log('SERVER: copyPlaylist route HIT, id =', req.params.id);
    try {
        const userId = req.userId;     
        const playlistId = req.params.id; 

        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: 'You must be logged in to copy a playlist.'
            });
        }

        const original = await Playlist.findById(playlistId);
        if (!original) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Original playlist not found.'
            });
        }

        const baseName = original.name || 'Untitled Playlist';
        let newName = baseName;
        let suffix = 1;

        // no user may own two playlists with the same name
        while (true) {
            const clash = await Playlist.findOne({ owner: userId, name: newName });
            if (!clash) break;
            newName = `${baseName} (${suffix++})`;
        }

        const copiedSongs = (original.songs || []).map(song => {
          const s = song.toObject ? song.toObject() : song;
      
          return {
              title:     s.title,
              artist:    s.artist,
              year:      s.year,
              youTubeId: s.youTubeId
          };
      });
      

  
        const newPlaylist = new Playlist({
            name: newName,
            owner: userId,
            songs: copiedSongs,     // deep-copied subdocuments
            listenerCount: 0,
            published: true,
            publishedDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newPlaylist.save();

        return res.status(201).json({
            success: true,
            playlist: newPlaylist
        });

    } catch (error) {
        console.error('Copy playlist error:', error);
        return res.status(500).json({
            success: false,
            errorMessage: 'Server error while copying playlist.'
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
    console.log('SERVER: getPlaylistById called with ID:', playlistId);
    
    if (!mongoose.Types.ObjectId.isValid(playlistId)) {
        console.log('SERVER: Invalid playlist ID:', playlistId);
        return res.status(400).json({
            success: false,
            errorMessage: 'Invalid playlist ID'
        });
    }

    const playlist = await Playlist.findById(playlistId)
      .populate('owner', 'userName email avatar') 
      .populate('songs');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        errorMessage: 'Playlist not found'
      });
    }

    // Check if user can access this playlist
    const userId = req.userId;
    
    if (!playlist.published) {
      if (!userId) {
        return res.status(401).json({
          success: false,
          errorMessage: 'Authentication required'
        });
      }
      if (playlist.owner.toString() !== userId) {
        return res.status(403).json({
          success: false,
          errorMessage: 'Access denied - playlist is private'
        });
      }
    }

    return res.status(200).json({
      success: true,
      playlist: {
        _id: playlist._id,
        name: playlist.name,
        ownerName: playlist.owner?.userName,
        ownerEmail: playlist.owner?.email,
        ownerAvatar: playlist.owner?.avatar, 
        songs: playlist.songs || [],
        listenerCount: playlist.listenerCount || 0,
        published: playlist.published ?? true
      }
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
    console.log('getPlaylistPairs called for userId:', userId);

    if (!userId) {
      console.log('No user ID, returning empty');
      return res.status(401).json({
        success: false,
        errorMessage: 'Not logged in'
      });
    }

    // Get user to verify
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        errorMessage: 'User not found'
      });
    }
    
    console.log('User found:', user.email);

    // Get playlists owned by this user AND public playlists from others
    const playlists = await Playlist.find({
      $or: [
        { owner: userId }, // User's own playlists
        { published: true } // Public playlists from others
      ]
    })
    .populate('owner', 'userName email avatar') 
    .populate('songs')
    .sort({ updatedAt: -1 });

    console.log(`Found ${playlists.length} playlists for user ${user.email}`);
    
    const pairs = playlists.map(playlist => {
      console.log('Playlist owner data:', {
        ownerId: playlist.owner?._id,
        ownerName: playlist.owner?.userName,
        ownerEmail: playlist.owner?.email,
        ownerAvatar: playlist.owner?.avatar,
        hasAvatar: !!playlist.owner?.avatar,
        avatarLength: playlist.owner?.avatar?.length
      });
      
      return {
        _id: playlist._id,
        name: playlist.name,
        ownerName: playlist.owner?.userName || 'Unknown',
        ownerEmail: playlist.owner?.email || 'unknown@example.com',
        ownerAvatar: playlist.owner?.avatar || null, // Include avatar
        songs: playlist.songs || [],
        listenerCount: playlist.listenerCount || 0,
        published: playlist.published ?? true
      };
    });

    console.log('Sending pairs with avatars:', pairs.map(p => ({
      name: p.name,
      ownerName: p.ownerName,
      hasAvatar: !!p.ownerAvatar,
      avatarLength: p.ownerAvatar?.length
    })));

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
      .populate('owner', 'userName email avatar')
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
    console.log("SERVER: updatePlaylist called");
    console.log("Body received:", JSON.stringify(req.body, null, 2));
    
    const userId = req.userId;
    const playlistId = req.params.id;
    const updateData = req.body;

    // DEBUG: Check what we're receiving
    console.log("songs received type:", typeof updateData.songs);
    console.log("songs received value:", updateData.songs);

    // FIX: If songs is a string, parse it to array
    if (updateData.songs && typeof updateData.songs === 'string') {
      try {
        updateData.songs = JSON.parse(updateData.songs);
        console.log("Parsed songs from string to array:", updateData.songs);
      } catch (parseErr) {
        console.error("Failed to parse songs:", parseErr);
        return res.status(400).json({
          success: false,
          errorMessage: 'Invalid songs format'
        });
      }
    }

    // Make sure songs is an array
    if (!Array.isArray(updateData.songs)) {
      console.error("songs is not an array after parsing:", updateData.songs);
      updateData.songs = [];
    }

    console.log("Processed updateData.songs:", updateData.songs);

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
      // Make sure we're assigning an array
      playlist.songs = updateData.songs;
      console.log("Setting playlist.songs to:", playlist.songs);
    }
    
    if (updateData.listenerCount !== undefined) {
      playlist.listenerCount = updateData.listenerCount;
    }
    
    if (updateData.published !== undefined) {
      playlist.published = updateData.published;
    }
    
    playlist.updatedAt = new Date();

    console.log("Saving playlist with songs:", playlist.songs);
    
    const updated = await playlist.save();
    
    // Populate before returning
    const populated = await Playlist.findById(updated._id)
      .populate('owner', 'userName email avatar')
      .populate('songs');

    console.log("Successfully updated playlist");

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
    console.log('SERVER: getGuestPlaylists called');

    const playlists = await Playlist.find({ published: true })
      .populate('owner', 'userName email avatar') 
      .populate('songs')
      .sort({ updatedAt: -1 });

    console.log(`Found ${playlists.length} public playlists`);
    
    const pairs = playlists.map(playlist => {
      console.log('Guest playlist owner data:', {
        ownerName: playlist.owner?.userName,
        ownerEmail: playlist.owner?.email,
        ownerAvatar: playlist.owner?.avatar,
        hasAvatar: !!playlist.owner?.avatar,
        avatarLength: playlist.owner?.avatar?.length
      });
      
      return {
        _id: playlist._id,
        name: playlist.name,
        ownerName: playlist.owner?.userName || 'Unknown',
        ownerEmail: playlist.owner?.email || 'unknown@example.com',
        ownerAvatar: playlist.owner?.avatar || null, 
        songs: playlist.songs || [],
        listenerCount: playlist.listenerCount || 0,
        published: playlist.published ?? true
      };
    });

    console.log('Sending guest pairs with avatars:', pairs.slice(0, 3).map(p => ({
      name: p.name,
      ownerName: p.ownerName,
      hasAvatar: !!p.ownerAvatar,
      avatarLength: p.ownerAvatar?.length
    })));

    return res.status(200).json({
      success: true,
      idNamePairs: pairs
    });
  } catch (err) {
    console.error('SERVER: getGuestPlaylists error:', err);
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
  copyPlaylist,
  getGuestPlaylists
};