/*
    This is where we'll route all of the received http requests
    into controller response functions.
    
*/
const express = require('express');
const StoreController = require('../controllers/store-controller');
const router = express.Router();
const authManager = require('../auth/index');
const auth = authManager.verify;

router.post('/playlist', auth, StoreController.createPlaylist);
router.delete('/playlist/:id', auth, StoreController.deletePlaylist);
router.get('/playlist/:id', auth, StoreController.getPlaylistById);
router.get('/playlistpairs', auth, StoreController.getPlaylistPairs);
router.get('/playlists', auth, StoreController.getPlaylists);
router.put('/playlist/:id', auth, StoreController.updatePlaylist);

module.exports = router;
