const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRouter = require('./routes/auth-router');
const playlistRouter = require('./routes/playlist-router');
const MongoDatabaseManager = require('./db/mongodb');
const db = new MongoDatabaseManager();
const songRoutes = require('./routes/song-routes');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

db.connect(); // connect to Mongo

app.use('/auth', authRouter);
app.use('/api/playlists', playlistRouter);
app.use('/api/songs', songRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
