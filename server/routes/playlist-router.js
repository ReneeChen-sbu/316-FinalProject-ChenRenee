const express = require('express');
const PlaylistController = require('../controllers/playlist-controller');
const { requireAuth } = require('../auth');

const router = express.Router();

/** GUEST LIBRARY – NO AUTH */
router.get('/guest', PlaylistController.getGuestPlaylists);

/** LOGGED-IN ROUTES (no :id yet) */
router.get('/pairs', requireAuth, PlaylistController.getPlaylistPairs);
router.get('/', requireAuth, PlaylistController.getPlaylists);
router.post('/', requireAuth, PlaylistController.createPlaylist);

/** ROUTES WITH :id – PUT THESE LAST */
router.get('/:id', requireAuth, PlaylistController.getPlaylistById);
router.put('/:id', requireAuth, PlaylistController.updatePlaylist);
router.delete('/:id', requireAuth, PlaylistController.deletePlaylist);

module.exports = router;
