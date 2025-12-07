const express = require('express');
const PlaylistController = require('../controllers/playlist-controller');
const { requireAuth } = require('../auth');
const auth = require('../auth');

const router = express.Router();

//GUEST LIBRARY (no auth)
router.get('/guest', PlaylistController.getGuestPlaylists);

//LOGGED-IN ROUTES 
router.get('/pairs', requireAuth, PlaylistController.getPlaylistPairs);
router.get('/', requireAuth, PlaylistController.getPlaylists);
router.get('/:id', requireAuth, PlaylistController.getPlaylistById);
router.post('/', requireAuth, PlaylistController.createPlaylist);
router.put('/:id', requireAuth, PlaylistController.updatePlaylist);
router.delete('/:id', requireAuth, PlaylistController.deletePlaylist);
router.post('/:id/copy', requireAuth, PlaylistController.copyPlaylist);




module.exports = router;

