const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{
      title: { type: String, required: true },
      artist: { type: String, required: true },
      year: { type: Number, required: true },
      youTubeId: { type: String, required: true }
  }],
  listenerCount: { type: Number, default: 0 },
  published: { type: Boolean, default: true }
}, { timestamps: true });