import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Button,
  Avatar,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';

export default function PlayPlaylistModal({ open, onClose, playlist, initialIndex = 0 }) {
  console.log('PlayPlaylistModal received playlist:', {
    name: playlist?.name,
    ownerEmail: playlist?.ownerEmail,
    ownerAvatar: playlist?.ownerAvatar,
    hasOwnerAvatar: !!playlist?.ownerAvatar,
    ownerAvatarValue: playlist?.ownerAvatar?.substring(0, 30),
    owner: playlist?.owner,
    allProps: playlist
  });

  const songs = playlist?.songs || [];
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setIsPlaying(false);
    }
  }, [open, initialIndex]);

  if (!playlist) return null;

  const currentSong = songs[currentIndex];

  // Get owner information from playlist
  const ownerName = playlist.ownerName || 
                   (playlist.ownerEmail ? playlist.ownerEmail.split('@')[0] : 'Unknown User');
  
  // Get owner avatar - check different possible sources
  // IMPORTANT: Check the exact property names your backend is sending
  const ownerAvatar = playlist.ownerAvatar || 
                     (playlist.owner && playlist.owner.avatar) || 
                     playlist.avatar || 
                     null;
  
  console.log('Avatar debug:', {
    ownerAvatar,
    playlistOwnerAvatar: playlist.ownerAvatar,
    playlistOwner: playlist.owner,
    playlistOwnerAvatarType: typeof playlist.ownerAvatar,
    playlistOwnerAvatarLength: playlist.ownerAvatar?.length
  });

  // Get playlist name
  const playlistName = playlist.name || 'Untitled Playlist';

  // Get initial for avatar if no image
  const ownerInitial = ownerName && ownerName.length > 0 
    ? ownerName[0].toUpperCase() 
    : 'U';

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    // toggle between play/pause
    setIsPlaying((prev) => !prev);
  };

  const handleClose = () => {
    setIsPlaying(false);
    onClose();
  };

  // IMPORTANT: src depends on isPlaying and song index.
  // Changing either will reload the iframe and apply autoplay.
  const videoSrc =
    currentSong && currentSong.youTubeId
      ? `https://www.youtube.com/embed/${currentSong.youTubeId}?autoplay=${
          isPlaying ? 1 : 0
        }`
      : '';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: '#f5f5dc',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#4caf50',
          color: 'white',
          px: 3,
          py: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Play Playlist
        </Typography>
      </Box>

      {/* Body layout: left = song list, right = video + controls */}
      <Box
        sx={{
          backgroundColor: '#c8f7c5',
          p: 2,
          display: 'flex',
          gap: 2,
          minHeight: 400,
        }}
      >
        {/* LEFT: Playlist info + songs */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: '#fdf5d5',
            borderRadius: 2,
            p: 2,
            boxShadow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
            <Avatar
              src={ownerAvatar || undefined}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: ownerAvatar ? 'transparent' : '#4fc3f7',
              }}
            >
              {!ownerAvatar && ownerInitial}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 'bold', fontSize: 16 }}>
                {playlistName}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#666' }}>
                {ownerName}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', mt: 1 }}>
            {songs.map((song, idx) => (
              <Box
                key={song._id || idx}
                sx={{
                  mb: 1,
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 1.5,
                  backgroundColor:
                    idx === currentIndex ? '#ffe082' : '#fffbdd',
                  border:
                    idx === currentIndex
                      ? '2px solid #f9a825'
                      : '1px solid #e0e0a0',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(true);
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {idx + 1}. {song.title} by {song.artist}{' '}
                  {song.year ? `(${song.year})` : ''}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* RIGHT: Video + controls */}
        <Box
          sx={{
            flexBasis: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
        >
          <Box
            sx={{
              flex: 1,
              backgroundColor: '#ffffff',
              borderRadius: 2,
              overflow: 'hidden',
              mb: 2,
            }}
          >
            {currentSong ? (
              <iframe
                key={`${currentIndex}-${isPlaying}`}
                width="100%"
                height="100%"
                src={videoSrc}
                title="YouTube player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                }}
              >
                <Typography>No song selected</Typography>
              </Box>
            )}
          </Box>

          {/* Controls */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              sx={{
                minWidth: 70,
                backgroundColor: '#b0bec5',
                color: 'black',
                '&:hover': { backgroundColor: '#90a4ae' },
              }}
            >
              <SkipPreviousIcon />
            </Button>
            <Button
              onClick={handlePlayPause}
              disabled={!currentSong}
              sx={{
                minWidth: 70,
                backgroundColor: '#b0bec5',
                color: 'black',
                '&:hover': { backgroundColor: '#90a4ae' },
              }}
            >
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === songs.length - 1}
              sx={{
                minWidth: 70,
                backgroundColor: '#b0bec5',
                color: 'black',
                '&:hover': { backgroundColor: '#90a4ae' },
              }}
            >
              <SkipNextIcon />
            </Button>
          </Box>

          {/* Close button bottom-right */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              onClick={handleClose}
              sx={{
                backgroundColor: '#4caf50',
                color: 'white',
                borderRadius: 999,
                px: 4,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#43a047' },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}