const express = require('express');
const router = express.Router();
const Song = require('../models/song-model');
const Playlist = require('../models/playlist-model');
const auth = require('../auth');

// Get all songs
router.get('/', async (req, res) => {
    try {
        const songs = await Song.find()
            .populate('addedBy', 'userName email')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            songs: songs
        });
    } catch (err) {
        console.error('Error fetching songs:', err);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to fetch songs'
        });
    }
});

// Search songs
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        
        if (q && q.trim()) {
            const terms = q.toLowerCase().split(' ');
            
            let orConditions = [];
            
            terms.forEach(term => {
                if (term.startsWith('title:')) {
                    const titleTerm = term.substring(6);
                    query.title = { $regex: titleTerm, $options: 'i' };
                } else if (term.startsWith('artist:')) {
                    const artistTerm = term.substring(7);
                    query.artist = { $regex: artistTerm, $options: 'i' };
                } else if (term.startsWith('year:')) {
                    const yearTerm = term.substring(5);
                    const yearNum = parseInt(yearTerm);
                    if (!isNaN(yearNum)) {
                        query.year = yearNum;
                    }
                } else {
                    // General search across multiple fields
                    orConditions.push(
                        { title: { $regex: term, $options: 'i' } },
                        { artist: { $regex: term, $options: 'i' } }
                    );
                    
                    const yearNum = parseInt(term);
                    if (!isNaN(yearNum)) {
                        orConditions.push({ year: yearNum });
                    }
                }
            });
            
            if (orConditions.length > 0) {
                query.$or = orConditions;
            }
        }
        
        const songs = await Song.find(query)
            .populate('addedBy', 'userName email')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            songs: songs
        });
    } catch (err) {
        console.error('Error searching songs:', err);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to search songs'
        });
    }
});

// Create new song
router.post('/', auth.requireAuth, async (req, res) => {
    try {
        const { title, artist, year, youTubeId } = req.body;
        
        if (!title || !artist || !year || !youTubeId) {
            return res.status(400).json({
                success: false,
                errorMessage: 'All fields are required'
            });
        }
        
        // Check if song already exists (unique title+artist+year)
        const existingSong = await Song.findOne({ 
            title: title.trim(),
            artist: artist.trim(),
            year: parseInt(year)
        });
        
        if (existingSong) {
            return res.status(400).json({
                success: false,
                errorMessage: 'A song with this title, artist, and year already exists'
            });
        }
        
        const song = new Song({
            title: title.trim(),
            artist: artist.trim(),
            year: parseInt(year),
            youTubeId: youTubeId.trim(),
            addedBy: req.userId,
            listenCount: 0,
            playlistCount: 0
        });
        
        const savedSong = await song.save();
        const populatedSong = await Song.findById(savedSong._id)
            .populate('addedBy', 'userName email');
        
        return res.status(201).json({
            success: true,
            song: populatedSong
        });
    } catch (err) {
        console.error('Error creating song:', err);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to create song'
        });
    }
});

// Update song
router.put('/:id', auth.requireAuth, async (req, res) => {
    try {
        const songId = req.params.id;
        const { title, artist, year, youTubeId } = req.body;
        
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }
        
        // Check ownership
        if (song.addedBy.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                errorMessage: 'Access denied'
            });
        }
        
        // Check if new values would create a duplicate
        if (title || artist || year) {
            const duplicateCheck = {
                title: title || song.title,
                artist: artist || song.artist,
                year: year ? parseInt(year) : song.year
            };
            
            const existing = await Song.findOne({
                title: duplicateCheck.title,
                artist: duplicateCheck.artist,
                year: duplicateCheck.year,
                _id: { $ne: songId }
            });
            
            if (existing) {
                return res.status(400).json({
                    success: false,
                    errorMessage: 'Another song with this title, artist, and year already exists'
                });
            }
        }
        
        // Update fields
        if (title !== undefined) song.title = title.trim();
        if (artist !== undefined) song.artist = artist.trim();
        if (year !== undefined) song.year = parseInt(year);
        if (youTubeId !== undefined) song.youTubeId = youTubeId.trim();
        
        song.updatedAt = new Date();
        
        const updatedSong = await song.save();
        const populatedSong = await Song.findById(updatedSong._id)
            .populate('addedBy', 'userName email');
        
        return res.status(200).json({
            success: true,
            song: populatedSong
        });
    } catch (err) {
        console.error('Error updating song:', err);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to update song'
        });
    }
});

// Delete song
router.delete('/:id', auth.requireAuth, async (req, res) => {
    try {
        const songId = req.params.id;
        
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Song not found'
            });
        }
        
        // Check ownership
        if (song.addedBy.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                errorMessage: 'Access denied'
            });
        }
        
        // Remove song from all playlists that contain it
        await Playlist.updateMany(
            { songs: songId },
            { $pull: { songs: songId } }
        );
        
        await Song.findByIdAndDelete(songId);
        
        return res.status(200).json({
            success: true,
            message: 'Song deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting song:', err);
        return res.status(500).json({
            success: false,
            errorMessage: 'Failed to delete song'
        });
    }
});

module.exports = router;