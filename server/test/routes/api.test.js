import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const authController = require('../../controllers/auth-controller');
const playlistController = require('../../controllers/playlist-controller');
const songController = require('../../routes/song-routes');
const songModel = require('../../models/song-model');
const playlistModel = require('../../models/playlist-model');
const userModel = require('../../models/user-model');
const auth = require('../../auth');
const MongoDatabaseManager = require('../../db/mongodb');

const getSongHandler = (stackIndex, handlerIndex = 0) => songController.stack[stackIndex].route.stack[handlerIndex].handle;

const createRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
};

const createReq = ({ params = {}, body = {}, query = {}, cookies = {}, userId = undefined, userEmail = undefined } = {}) => ({
  params,
  body,
  query,
  cookies,
  userId,
  userEmail,
});

let users = [];
let playlists = [];
let songs = [];

const resetMocks = () => {
  vi.restoreAllMocks();
  users = [];
  playlists = [];
  songs = [];
  process.env.JWT_SECRET = 'testsecret';

  vi.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);

  const ensureSongHelpers = (song) => {
    if (!song.populate) song.populate = vi.fn().mockReturnThis();
    if (!song.save) song.save = vi.fn(async function saveSongDoc() { return this; });
    if (!song.toObject) song.toObject = () => ({ ...song });
    return song;
  };

  const ensurePlaylistHelpers = (playlist) => {
    if (!playlist.populate) playlist.populate = vi.fn().mockReturnThis();
    if (!playlist.save) playlist.save = vi.fn(async function savePlaylistDoc() { return this; });
    return playlist;
  };

  userModel.findOne = vi.fn(async (query) => users.find((u) => u.email === query.email) || null);
  userModel.findById = vi.fn(async (id) => users.find((u) => u._id === id) || null);
  userModel.prototype.save = vi.fn(async function saveUser() {
    this._id = this._id || new mongoose.Types.ObjectId().toString();
    users.push(this);
    return this;
  });

  const chainArray = (arr) => ({ populate: vi.fn().mockReturnThis(), sort: vi.fn().mockReturnValue(arr) });
  const chainDoc = (doc) => (doc ? ensurePlaylistHelpers(doc) : doc);

  playlistModel.find = vi.fn(async () => chainArray(playlists.map(ensurePlaylistHelpers)));
  playlistModel.findOne = vi.fn(async (query) => playlists.find((p) => p.owner === query.owner && p.name === query.name && (!query._id || String(p._id) !== String(query._id.$ne))) || null);
  playlistModel.findById = vi.fn((id) => chainDoc(playlists.find((p) => String(p._id) === String(id)) || null));
  playlistModel.findByIdAndUpdate = vi.fn((id, update) => {
    const target = playlists.find((p) => String(p._id) === String(id));
    if (!target) return null;
    if (update.$inc && update.$inc.listenerCount) target.listenerCount = (target.listenerCount || 0) + update.$inc.listenerCount;
    if (update.$set) Object.assign(target, update.$set);
    else Object.assign(target, update);
    return chainDoc(target);
  });
  playlistModel.findByIdAndDelete = vi.fn(async (id) => {
    const idx = playlists.findIndex((p) => String(p._id) === String(id));
    if (idx === -1) return null;
    const [removed] = playlists.splice(idx, 1);
    return removed;
  });
  playlistModel.updateMany = vi.fn(async () => ({ acknowledged: true }));
  playlistModel.prototype.save = vi.fn(async function savePlaylist() {
    this._id = this._id ? this._id.toString() : new mongoose.Types.ObjectId().toString();
    ensurePlaylistHelpers(this);
    playlists.push(this);
    return this;
  });

  songModel.find = vi.fn(() => ({ populate: vi.fn().mockReturnThis(), sort: vi.fn().mockReturnValue(songs.map(ensureSongHelpers)) }));
  songModel.findOne = vi.fn((query) => songs.map(ensureSongHelpers).find((s) => s.title === query.title && s.artist === query.artist && s.year === query.year && (!query._id || s._id !== query._id.$ne)) || null);
  songModel.findById = vi.fn((id) => {
    const song = songs.find((s) => String(s._id) === String(id));
    return song ? ensureSongHelpers(song) : null;
  });
  songModel.findByIdAndUpdate = vi.fn((id, update) => {
    const song = songs.find((s) => String(s._id) === String(id));
    if (!song) return null;
    if (update.$inc && update.$inc.listenCount) song.listenCount = (song.listenCount || 0) + update.$inc.listenCount;
    if (update.$inc && update.$inc.playlistCount) song.playlistCount = (song.playlistCount || 0) + update.$inc.playlistCount;
    if (update.$set) Object.assign(song, update.$set);
    return ensureSongHelpers(song);
  });
  songModel.findByIdAndDelete = vi.fn((id) => {
    const idx = songs.findIndex((s) => String(s._id) === String(id));
    if (idx === -1) return null;
    const [removed] = songs.splice(idx, 1);
    return removed;
  });
  songModel.prototype.save = vi.fn(async function saveSong() {
    this._id = this._id ? this._id.toString() : new mongoose.Types.ObjectId().toString();
    ensureSongHelpers(this);
    songs.push(this);
    return this;
  });
};

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
});

beforeEach(() => {
  resetMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('Auth routes', () => {
  it('registers a user successfully', async () => {
    const req = createReq({ body: { userName: 'Tester', email: 'test@example.com', password: 'password123', passwordVerify: 'password123' } });
    const res = createRes();

    vi.spyOn(MongoDatabaseManager.prototype, 'getUserByEmail').mockResolvedValue(null);
    vi.spyOn(MongoDatabaseManager.prototype, 'createUser').mockImplementation(async (data) => ({ ...data, _id: 'user1', isGuest: false }));
    vi.spyOn(auth, 'signToken').mockReturnValue('token123');
    await authController.registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, user: expect.objectContaining({ userName: 'Tester', email: 'test@example.com' }) }));
  });

  it('prevents duplicate registration', async () => {
    vi.spyOn(MongoDatabaseManager.prototype, 'getUserByEmail').mockResolvedValue({ _id: 'user1' });
    const req = createReq({ body: { userName: 'Tester', email: 'test@example.com', password: 'password123', passwordVerify: 'password123' } });
    const res = createRes();
    await authController.registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('logs in user with correct credentials', async () => {
    const req = createReq({ body: { email: 'test@example.com', password: 'password123' } });
    const res = createRes();
    vi.spyOn(MongoDatabaseManager.prototype, 'getUserByEmail').mockResolvedValue({ _id: 'user1', email: 'test@example.com', passwordHash: 'hashed' });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    vi.spyOn(auth, 'signToken').mockReturnValue('token123');

    await authController.loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('rejects login with missing fields', async () => {
    const res = createRes();
    await authController.loginUser(createReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns logged out state when no token', async () => {
    const res = createRes();
    vi.spyOn(auth, 'verifyUser').mockReturnValue(null);
    await authController.getLoggedIn(createReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ loggedIn: false }));
  });

  it('updates profile when authenticated', async () => {
    const res = createRes();
    vi.spyOn(MongoDatabaseManager.prototype, 'updateUser').mockResolvedValue({ _id: 'user1', userName: 'New Name', email: 'test@example.com', avatar: null });
    await authController.updateUserProfile(createReq({ userId: 'user1', body: { userName: 'New Name' } }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, user: expect.objectContaining({ userName: 'New Name' }) }));
  });

  it('blocks profile update without authentication', async () => {
    const res = createRes();
    await authController.updateUserProfile(createReq({}), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('Playlist routes', () => {
  it('creates a playlist for the owner', async () => {
    users.push({ _id: 'u1', email: 'me@test.com' });
    const res = createRes();
    await playlistController.createPlaylist(createReq({ userId: 'u1', body: { name: 'My List', songs: [] } }), res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(playlists.length).toBe(1);
  });

  it('rejects playlist creation without name', async () => {
    const res = createRes();
    await playlistController.createPlaylist(createReq({ userId: 'u1', body: { name: '' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('requires authentication to create a playlist', async () => {
    const res = createRes();
    await playlistController.createPlaylist(createReq({ body: { name: 'No Auth' } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('prevents duplicate playlist names per user', async () => {
    users.push({ _id: 'u1', email: 'me@test.com' });
    playlists.push({ _id: 'p1', name: 'My List', owner: 'u1', songs: [] });
    const res = createRes();
    await playlistController.createPlaylist(createReq({ userId: 'u1', body: { name: 'My List' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updates playlist when owner edits', async () => {
    playlists.push({ _id: 'p1', name: 'My List', owner: 'u1', songs: [] });
    const res = createRes();
    await playlistController.updatePlaylist(createReq({ userId: 'u1', params: { id: 'p1' }, body: { name: 'Updated' } }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(playlists[0].name).toBe('Updated');
  });

  it('blocks playlist update by non-owner', async () => {
    playlists.push({ _id: 'p1', name: 'My List', owner: 'u1', songs: [] });
    const res = createRes();
    await playlistController.updatePlaylist(createReq({ userId: 'other', params: { id: 'p1' }, body: { name: 'Updated' } }), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns not found when updating missing playlist', async () => {
    const res = createRes();
    await playlistController.updatePlaylist(createReq({ userId: 'u1', params: { id: 'missing' }, body: { name: 'Updated' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('adds and removes songs from playlist', async () => {
    playlists.push({ _id: 'p1', name: 'My List', owner: 'u1', songs: [], listenerCount: 0 });
    songs.push({ _id: 's1', title: 'Song', artist: 'Artist', year: 2020, youTubeId: 'abc', listenCount: 0, playlistCount: 0 });

    const addRes = createRes();
    await playlistController.addSongToPlaylist(createReq({ userId: 'u1', params: { id: 'p1', songId: 's1' } }), addRes);
    expect(addRes.status).toHaveBeenCalledWith(200);
    expect(playlists[0].songs.length).toBe(1);
    expect(songs[0].playlistCount).toBe(1);

    const removeRes = createRes();
    await playlistController.removeSongFromPlaylist(createReq({ userId: 'u1', params: { id: 'p1', songId: 's1' } }), removeRes);
    expect(removeRes.status).toHaveBeenCalledWith(200);
    expect(playlists[0].songs.length).toBe(0);
    expect(songs[0].playlistCount).toBe(0);
  });

  it('rejects invalid ids when adding songs to playlist', async () => {
    const res = createRes();
    vi.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
    await playlistController.addSongToPlaylist(createReq({ userId: 'u1', params: { id: 'bad', songId: 'bad' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns not found when playlist is missing during add', async () => {
    songs.push({ _id: 's1', title: 'Song', artist: 'Artist', year: 2020, youTubeId: 'abc', listenCount: 0, playlistCount: 0 });
    const res = createRes();
    await playlistController.addSongToPlaylist(createReq({ userId: 'u1', params: { id: 'missing', songId: 's1' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('increments listener count for public view', async () => {
    playlists.push({ _id: 'p1', name: 'My List', owner: 'u1', songs: [], listenerCount: 0, populate: vi.fn().mockReturnThis() });
    const res = createRes();
    await playlistController.incrementListenerCount(createReq({ params: { id: 'p1' } }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(playlists[0].listenerCount).toBe(1);
  });

  it('rejects invalid playlist ids when incrementing listens', async () => {
    const res = createRes();
    vi.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
    await playlistController.incrementListenerCount(createReq({ params: { id: 'bad' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('Song routes', () => {
  it('creates a song for an authenticated user', async () => {
    const res = createRes();
    const req = createReq({ userId: 'user1', body: { title: 'New Song', artist: 'Singer', year: 2023, youTubeId: 'ytid' } });
    await getSongHandler(3, 1)(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(songs[0]).toMatchObject({ title: 'New Song', playlistCount: 0 });
  });

  it('requires auth middleware for song creation', async () => {
    const res = createRes();
    const next = vi.fn();
    vi.spyOn(auth, 'verifyUser').mockReturnValue(null);
    await getSongHandler(3, 0)(createReq({ body: {} }), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects song creation missing fields', async () => {
    const res = createRes();
    await getSongHandler(3, 1)(createReq({ userId: 'user1', body: { title: '' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('prevents duplicate songs by title/artist/year', async () => {
    songs.push({ _id: 's1', title: 'Dupe', artist: 'Band', year: 2020, youTubeId: 'a', playlistCount: 0, listenCount: 0 });
    const res = createRes();
    await getSongHandler(3, 1)(createReq({ userId: 'user1', body: { title: 'Dupe', artist: 'Band', year: 2020, youTubeId: 'b' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('increments listen count for a song', async () => {
    songs.push({ _id: 's1', title: 'Song', artist: 'Artist', year: 2020, youTubeId: 'abc', listenCount: 0, playlistCount: 0, populate: vi.fn().mockReturnThis() });
    const res = createRes();
    await getSongHandler(1)(createReq({ params: { id: 's1' } }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(songs[0].listenCount).toBe(1);
  });

  it('rejects invalid song id when incrementing listens', async () => {
    const res = createRes();
    vi.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
    await getSongHandler(1)(createReq({ params: { id: 'bad' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('searches songs by query string', async () => {
    songs.push({ _id: 's1', title: 'My Track', artist: 'Singer', year: 2021, youTubeId: 'abc', listenCount: 0, playlistCount: 0 });
    const res = createRes();
    await getSongHandler(2)(createReq({ query: { q: 'Track' } }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('updates a song when owner matches', async () => {
    songs.push({ _id: 's1', title: 'Song', artist: 'Artist', year: 2020, youTubeId: 'abc', listenCount: 0, playlistCount: 0, addedBy: 'user1', save: vi.fn(async function () { return this; }), populate: vi.fn().mockReturnThis() });
    const res = createRes();
    await getSongHandler(4, 1)(createReq({ userId: 'user1', params: { id: 's1' }, body: { title: 'Updated Song' } }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(songs[0].title).toBe('Updated Song');
  });

  it('blocks updating a song by another user', async () => {
    songs.push({ _id: 's1', title: 'Song', artist: 'Artist', year: 2020, youTubeId: 'abc', listenCount: 0, playlistCount: 0, addedBy: 'user1' });
    const res = createRes();
    await getSongHandler(4, 1)(createReq({ userId: 'other', params: { id: 's1' }, body: { title: 'Updated Song' } }), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns not found when updating missing song', async () => {
    const res = createRes();
    await getSongHandler(4, 1)(createReq({ userId: 'user1', params: { id: 'missing' }, body: { title: 'Updated Song' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('deletes a song for the owner', async () => {
    songs.push({ _id: 's1', title: 'Song', artist: 'Artist', year: 2020, youTubeId: 'abc', listenCount: 0, playlistCount: 0, addedBy: 'user1' });
    const res = createRes();
    await getSongHandler(5, 1)(createReq({ userId: 'user1', params: { id: 's1' } }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(songs.length).toBe(0);
  });

  it('returns 404 when deleting missing song', async () => {
    const res = createRes();
    await getSongHandler(5, 1)(createReq({ userId: 'user1', params: { id: 'missing' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('blocks song deletion by non-owner', async () => {
    songs.push({ _id: 's1', title: 'Song', artist: 'Artist', year: 2020, youTubeId: 'abc', listenCount: 0, playlistCount: 0, addedBy: 'user1' });
    const res = createRes();
    await getSongHandler(5, 1)(createReq({ userId: 'other', params: { id: 's1' } }), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
