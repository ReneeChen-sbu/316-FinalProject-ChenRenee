import React, { useContext, useState, useEffect } from 'react';
import { useHistory} from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

import GlobalStoreContext from '../store';
import MUIEditSongModal from './MUIEditSongModal';  


export default function EditPlaylistModal({ open, onClose }) {
  const { store } = useContext(GlobalStoreContext);
  const playlist = store.currentList;
  const history = useHistory();

  // Only show when parent says `open` and there is a currentList
  const isOpen = open && !!playlist;

  const [playlistName, setPlaylistName] = useState('');

  useEffect(() => {
    if (store.currentList) {
      setPlaylistName(store.currentList.name || '');
    }
  }, [store.currentList?._id, store.currentList?.name, isOpen]);

  if (!isOpen || !playlist) return null;

  const songs = playlist.songs || [];

  //Playlist title handlers

  const saveTitleIfNeeded = () => {
    if (!playlist) return;
    const trimmed = playlistName.trim();
    if (!trimmed || trimmed === playlist.name) return;

    // Use existing helper that talks to the backend
    const id = playlist._id ?? playlist.id;
    store.changeListName(id, trimmed);
  };

  const handleTitleChange = (e) => {
    setPlaylistName(e.target.value);
  };

  const handleTitleBlur = () => {
    saveTitleIfNeeded();
  };

  

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveTitleIfNeeded();
      e.target.blur();
    }
  };
  
  const handleClearTitle = () => {
    setPlaylistName('');
  };

  const handleClose = () => {
    console.log("Closing EditPlaylistModal");
    saveTitleIfNeeded();
    
    if (store.currentList) {
        console.log("Saving playlist before closing");
        store.updateCurrentList();
    }

    setTimeout(() => {
        if (onClose) onClose();
    }, 300);
};

  // Song handlers 

  const handleAddSong = () => {
    console.log("Current songs before adding:", playlist.songs);
    console.log("Type of songs:", typeof playlist.songs);
    
    if (!store.canAddNewSong()) return;
    store.addNewSong();
};

const handleEditSong = (index) => {
    console.log("Edit song clicked at index:", index);
    const song = songs[index];
    if (!song) {
        console.error("No song found at index:", index);
        return;
    }
    
    console.log("Song to edit:", song);
    
    // This should trigger the global edit song modal
    store.showEditSongModal(index, song);
    
    // For debugging, check if modal opened
    console.log("After showEditSongModal, isEditSongModalOpen:", store.isEditSongModalOpen());
};

  const handleDuplicateSong = (index) => {
    const song = songs[index];
    if (!song) return;
    store.addCreateSongTransaction(
      index + 1,
      song.title,
      song.artist,
      song.year,
      song.youTubeId
    );
  };

  const handleRemoveSong = (index) => {
    const song = songs[index];
    if (!song) return;
    store.addRemoveSongTransaction(song, index);
  };

  const handleUndo = () => {
    if (store.canUndo()) store.undo();
  };

  const handleRedo = () => {
    if (store.canRedo()) store.redo();
  };

  // UI

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500,
      }}
    >
      <Box
        sx={{
          width: '80%',
          maxWidth: 900,
          height: '80%',
          backgroundColor: '#b2ffb2',
          borderRadius: 2,
          boxShadow: 6,
          display: 'flex',
          flexDirection: 'column',
          border: '4px solid #2e7d32',
        }}
      >
        {/* Top green bar */}
        <Box
          sx={{
            backgroundColor: '#2e7d32',
            color: 'white',
            px: 2,
            py: 1,
            fontWeight: 700,
            fontSize: 18,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Edit Playlist</span>
          <Typography variant="caption" sx={{ color: '#e0f7fa' }}>
            {songs.length} song{songs.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Title row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            value={playlistName}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            InputProps={{
              sx: {
                backgroundColor: '#f5f5f5',
                fontSize: 22,
                fontWeight: 700,
              },
              endAdornment: playlistName && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClearTitle}
                    edge="end"
                    size="small"
                    sx={{ mr: -1 }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            placeholder="Enter playlist name..."
          />

          {/* Top-right buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => history.push('/songs')}
              sx={{
                borderRadius: '999px',
                px: 3,
                py: 1,
                backgroundColor: '#7e57c2',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#673ab7' },
              }}
              startIcon={<LibraryMusicIcon />}
            >
            </Button>
          </Box>
        </Box>

        {/* Songs list */}
        <Box
          sx={{
            flex: 1,
            mx: 3,
            mb: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: 'white',
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          {songs.map((song, index) => (
            <Box
              key={song._id || `song-${index}`}
              sx={{
                mb: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: '#fff9c4',
                border: '1px solid #e0e0a0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  backgroundColor: '#fff59d',
                },
              }}
            >
              {/* Left: song text */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#333',
                    mb: 0.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {index + 1}. {song.title || 'Untitled Song'}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    color: '#666',
                    wordBreak: 'break-word',
                  }}
                >
                  {song.artist || 'Unknown Artist'}
                  {song.year ? ` (${song.year})` : ''}
                  {song.youTubeId && ` • YouTube: ${song.youTubeId}`}
                </Typography>
              </Box>

              {/* Right: icons (edit, copy, X) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => handleEditSong(index)}
                  sx={{
                    color: '#424242',
                    '&:hover': { backgroundColor: '#e3f2fd' },
                  }}
                  title="Edit Song"
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => handleDuplicateSong(index)}
                  sx={{
                    color: '#424242',
                    '&:hover': { backgroundColor: '#f3e5f5' },
                  }}
                  title="Duplicate Song"
                >
                  <ContentCopyIcon />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={() => handleRemoveSong(index)}
                  sx={{
                    color: '#e53935',
                    '&:hover': { backgroundColor: '#ffebee' },
                  }}
                  title="Delete Song"
                >
                  <ClearIcon />
                </IconButton>
              </Box>
            </Box>
          ))}

          {songs.length === 0 && (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: '#777',
                fontStyle: 'italic',
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, color: '#666' }}>
                No songs yet
              </Typography>
              <Typography variant="body1">
                Click &quot;Add Song&quot; to add your first song!
              </Typography>
            </Box>
          )}
        </Box>

        {/* Bottom buttons: Undo / Redo / Close */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            pb: 2,
            backgroundColor: '#b2ffb2',
            borderTop: '2px solid #81c784',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleUndo}
              disabled={!store.canUndo()}
              startIcon={<UndoIcon />}
              sx={{
                borderRadius: '999px',
                backgroundColor: '#673ab7',
                color: 'white',
                textTransform: 'none',
                '&:disabled': {
                  backgroundColor: '#b39ddb',
                  color: '#eeeeee',
                },
                '&:hover': { backgroundColor: '#5e35b1' },
              }}
            >
              Undo
            </Button>

            <Button
              onClick={handleRedo}
              disabled={!store.canRedo()}
              startIcon={<RedoIcon />}
              sx={{
                borderRadius: '999px',
                backgroundColor: '#673ab7',
                color: 'white',
                textTransform: 'none',
                '&:disabled': {
                  backgroundColor: '#b39ddb',
                  color: '#eeeeee',
                },
                '&:hover': { backgroundColor: '#5e35b1' },
              }}
            >
              Redo
            </Button>
          </Box>

          <Button
            onClick={handleClose}
            sx={{
              borderRadius: '999px',
              px: 4,
              backgroundColor: '#2e7d32',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1b5e20' },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
      {<MUIEditSongModal />}
    </Box>
  );
}