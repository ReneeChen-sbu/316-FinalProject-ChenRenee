//const Playlist = require('../models/playlist-model')
//const User = require('../models/user-model');

//changing so it uses db instead of mongoose models
const auth = require('../auth')
const db = require('../db')

createPlaylist = async (req, res) => {
    const user = auth.verifyUser(req);
    if(!user) return res.status(401).json({ errorMessage: "UNAUTHORIZED" });

    const { name, songs} = req.body;
    if (!name) {
        return res.status(400).json({ success:false, error:'Missing playlist data' });
    }

    try {
        const newPlaylist = await db.createPlaylist({
            name,
            songs: songs || [],
            ownerEmail: user.email
        });
        return res.status(201).json({ success:true, playlist:newPlaylist });
    }
    catch(err){ console.log(err); return res.status(400).json({ success:false, errorMessage:'Playlist Not Created!' }) }
}

getPlaylistPairs = async (req, res) => {
    const user = auth.verifyUser(req);
    console.log("GET PLAYLIST PAIRS - user:", user);
    if(!user){
        return res.status(401).json({ errorMessage:'UNAUTHORIZED' })
    }

    try {
        const playlists = await db.getPlaylistsByUser(user.email);
        
        const pairs = playlists.map(list => ({
            _id: list._id ? list._id.toString() : list.id.toString(),
            name: list.name
        }));

        return res.status(200).json({ success:true, idNamePairs:pairs })
    }
    catch(err) { 
        console.log(err); 
        return res.status(500).json({ success:false, errorMessage:"Server error" });
    }
}


getPlaylists = async (req, res) => {
    const user = auth.verifyUser(req);
    if(!user) return res.status(401).json({ errorMessage:"UNAUTHORIZED" })

    try {
        const playlists = await db.getAllPlaylists();
        return res.status(200).json({ success:true, data:playlists })
    }
    catch(err){ console.log(err); return res.status(500).json({ errorMessage:"Server Error" }) }
}

getPlaylistById = async (req,res) => {
    const user = auth.verifyUser(req);
    if(!user) return res.status(401).json({ errorMessage:"UNAUTHORIZED" })

    try{
        const list = await db.getPlaylistById(req.params.id)
        return res.status(200).json({ success:true, playlist:list })
    }
    catch(err){ console.log(err); return res.status(500).json({ errorMessage:"Server Error" }) }
}

updatePlaylist = async (req,res) => {
    const user = auth.verifyUser(req);
    if(!user) return res.status(401).json({ errorMessage:"UNAUTHORIZED" })

    try{
        await db.updatePlaylist(req.params.id, {
            ...req.body.playlist,
            ownerEmail: user.email
        });
        
        return res.status(200).json({ success:true })
    }
    catch(err){ console.log(err); return res.status(400).json({ errorMessage:"Update Failed" }) }
}

deletePlaylist = async (req,res)=>{
    const user = auth.verifyUser(req);
    if(!user) return res.status(401).json({ errorMessage:"UNAUTHORIZED" })

    try{
        await db.deletePlaylist(req.params.id);
        return res.status(200).json({ success:true });
    }
    catch(err){ console.log(err); return res.status(400).json({ errorMessage:"Deletion Failed" }) }
}

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}
