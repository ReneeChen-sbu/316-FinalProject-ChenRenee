const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const User = require('../models/user-model');
const Playlist = require('../models/playlist-model');
const Song = require('../models/song-model');

async function importData() {
    try {
        
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/playlister', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
   

        // JSON file path
        const dataPath = path.join(__dirname, '../public/data/playlisterdata.json');
        
        if (!fs.existsSync(dataPath)) {
            throw new Error(`JSON file not found at: ${dataPath}`);
        }
        
  
        
        // Read JSON file
        const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // Clear existing data
        await User.deleteMany({});
        await Playlist.deleteMany({});
        await Song.deleteMany({});
        
       
        const userMap = {}; // Map email to user ObjectId
        
        if (jsonData.users && jsonData.users.length > 0) {
            for (const userData of jsonData.users) {
                const user = new User({
                    userName: userData.name || userData.userName || `User${Date.now()}`,
                    email: userData.email || `user${Date.now()}@example.com`,
                    passwordHash: '$2a$10$placeholderpasswordhash', // Default password hash
                    avatar: '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                await user.save();
                userMap[user.email.toLowerCase()] = user._id;
        
            }
        }
        
        // Get first user ID for fallback
        const defaultUserId = Object.values(userMap)[0];
        
        
        const songMap = {}; // Map song key (title+artist+year) to ObjectId
        
        if (jsonData.playlists && jsonData.playlists.length > 0) {
            // Collect all unique songs first
            const uniqueSongs = new Map();
            
            for (const playlistData of jsonData.playlists) {
                if (playlistData.songs && playlistData.songs.length > 0) {
                    for (const songData of playlistData.songs) {
                        const key = `${songData.title}|${songData.artist}|${songData.year}`;
                        if (!uniqueSongs.has(key)) {
                            // Store song data along with owner email for reference
                            uniqueSongs.set(key, {
                                ...songData,
                                ownerEmail: playlistData.ownerEmail
                            });
                        }
                    }
                }
            }
            
            
            // Import unique songs
            let importedCount = 0;
            let duplicateCount = 0;
            
            for (const [key, songInfo] of uniqueSongs) {
                // Find user for addedBy
                let addedByUserId = defaultUserId;
                if (songInfo.ownerEmail && userMap[songInfo.ownerEmail.toLowerCase()]) {
                    addedByUserId = userMap[songInfo.ownerEmail.toLowerCase()];
                }
                
                const song = new Song({
                    title: songInfo.title || 'Untitled',
                    artist: songInfo.artist || 'Unknown',
                    year: songInfo.year || new Date().getFullYear(),
                    youTubeId: songInfo.youTubeId || 'dQw4w9WgXcQ',
                    listenCount: 0,
                    playlistCount: 0, 
                    addedBy: addedByUserId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                
                try {
                    await song.save();
                    songMap[key] = song._id;
                    importedCount++;
                } catch (error) {
                    duplicateCount++;
                    // Try to find existing song
                    const existingSong = await Song.findOne({
                        title: songInfo.title,
                        artist: songInfo.artist,
                        year: songInfo.year
                    });
                    if (existingSong) {
                        songMap[key] = existingSong._id;
                    }
                }
            }
         
        } 
        
      

        let playlistCount = 0;
        let skippedCount = 0;
        
        if (jsonData.playlists && jsonData.playlists.length > 0) {
            for (const playlistData of jsonData.playlists) {
                // Get owner by email
                const ownerEmail = playlistData.ownerEmail;
                let ownerId = defaultUserId;
                
                if (ownerEmail && userMap[ownerEmail.toLowerCase()]) {
                    ownerId = userMap[ownerEmail.toLowerCase()];
                }
                
                // Convert embedded songs to Song references
                const songs = [];
                if (playlistData.songs && playlistData.songs.length > 0) {
                    for (const songData of playlistData.songs) {
                        songs.push({
                            title: songData.title || 'Untitled',
                            artist: songData.artist || 'Unknown Artist',
                            year: songData.year || new Date().getFullYear(),
                            youTubeId: songData.youTubeId || 'dQw4w9WgXcQ'
                        });
                    }
                }
                
                // Create unique playlist name
                const playlistName = playlistData.name || 'Untitled Playlist';
                const uniquePlaylistName = `${playlistName} (${ownerEmail || 'unknown'})`;
                
                try {
                    const playlist = new Playlist({
                        name: uniquePlaylistName,
                        owner: ownerId,
                        songs: songs, // now full song objects, not ObjectIds
                        listenerCount: Math.floor(Math.random() * 1000),
                        published: true,
                        publishedDate: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                

        
                    await playlist.save();
                    playlistCount++;
                    
                    // Update song playlistCount
                    for (const songId of songIds) {
                        await Song.findByIdAndUpdate(songId, {
                            $inc: { playlistCount: 1 }
                        });
                    }
 
                    
                } catch (error) {
                    skippedCount++;
                }
            }
            
        }
        
        
        
        // Create a test user for yourself (replace with your actual email)
        try {
            const testUser = new User({
                userName: 'Ren',
                email: 'renee@chen.com',
                passwordHash: '$2a$10$1jbo3qZ6QOOK6HkMaS2cQOztNpAvaCag33yrp0M93UC4k0uBpMIUS',
                avatar: '',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await testUser.save();

            
            // Create a test playlist for the test user
            const sampleSongs =
            (jsonData.playlists[0]?.songs || []).slice(0, 5).map(s => ({
                title: s.title || 'Untitled',
                artist: s.artist || 'Unknown Artist',
                year: s.year || new Date().getFullYear(),
                youTubeId: s.youTubeId || 'dQw4w9WgXcQ'
            }));
            
            const testPlaylist = new Playlist({
            name: 'My Test Playlist',
            owner: testUser._id,
            songs: sampleSongs,
            listenerCount: 0,
            published: true,
            publishedDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
            });

            await testPlaylist.save();
            
        } catch (error) {
            console.log(` Test user already exists or error: ${error.message}`);
        }
        
        // Verify data
        const sampleUser = await User.findOne();
        const songCount = await Song.countDocuments();
        const playlistCountTotal = await Playlist.countDocuments();
        
        
        if (sampleUser) {
            const userPlaylists = await Playlist.find({ owner: sampleUser._id });
        }
    
        
        process.exit(0);
        
    } catch (error) {
        process.exit(1);
    }
}

importData();