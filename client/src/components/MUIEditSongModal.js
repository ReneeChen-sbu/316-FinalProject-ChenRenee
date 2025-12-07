import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import GlobalStoreContext from '../store';

export default function MUIEditSongModal() {
  const { store } = useContext(GlobalStoreContext);


  console.log("MUIEditSongModal rendering");
  console.log("isEditSongModalOpen:", store.isEditSongModalOpen());
  console.log("currentSong:", store.currentSong);
  console.log("currentSongIndex:", store.currentSongIndex);

  const isOpen = store.isEditSongModalOpen();
  const currentSong = store.currentSong;
  const currentIndex = store.currentSongIndex;

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('');
  const [youTubeId, setYouTubeId] = useState('');

  useEffect(() => {
    if (currentSong && isOpen) {
      setTitle(currentSong.title || '');
      setArtist(currentSong.artist || '');
      setYear(currentSong.year || '');
      setYouTubeId(currentSong.youTubeId || '');
    }
  }, [currentSong, isOpen]);

  if (!isOpen) {
    console.log("MUIEditSongModal: Not open, returning null");
    return null;
  }

  console.log("MUIEditSongModal: Rendering modal");

  const handleConfirm = () => {
    const newSongData = {
      title: title.trim() || 'Untitled',
      artist: artist.trim() || 'Unknown',
      year: Number(year) || new Date().getFullYear(),
      youTubeId: youTubeId.trim() || 'dQw4w9WgXcQ'
    };

    store.addUpdateSongTransaction(currentIndex, newSongData);
    store.hideModals();
  };

  const handleCancel = () => {
    store.hideModals();
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1400
      }}
    >
      <Box
        sx={{
          width: 400,
          bgcolor: 'white',
          borderRadius: 2,
          p: 3,
          boxShadow: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Edit Song
        </Typography>

        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        <TextField
          label="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          fullWidth
        />
        <TextField
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          fullWidth
        />
        <TextField
          label="YouTube ID"
          value={youTubeId}
          onChange={(e) => setYouTubeId(e.target.value)}
          fullWidth
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Box>
  );
}