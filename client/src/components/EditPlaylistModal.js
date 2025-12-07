import React, { useContext, useEffect, useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

import GlobalStoreContext from '../store';

export default function EditPlaylistModal({ open, onClose, playlistId }) {
  const { store } = useContext(GlobalStoreContext);
  const [nameInput, setNameInput] = useState('');

  // When modal opens, make sure the store has this playlist loaded
  useEffect(() => {
    if (open && playlistId) {
      store.setCurrentList(playlistId, { navigate: false }); 
    }
  }, [open, playlistId, store]);
  
  const playlist = store.currentList;
  const songs = playlist?.songs || [];

  // Sync local name field whenever currentList changes
  useEffect(() => {
    if (playlist?.name) {
      setNameInput(playlist.name);
    }
  }, [playlist]);

  const handleChangeName = (e) => {
    setNameInput(e.target.value);
  };

  const handleNameBlur = () => {
    if (!playlist || !nameInput.trim()) return;
    if (nameInput.trim() === playlist.name) return;
    store.changeListName(playlist._id ?? playlist.id, nameInput.trim());
  };

  const handleAddSong = () => {
    if (!playlist) return;
    store.addNewSong(); // uses transaction + updateCurrentList in your store
  };

  const handleEditSong = (index) => {
    if (!playlist) return;
    const song = playlist.songs[index];
    store.showEditSongModal(index, song); // re-use existing edit-song modal
  };

  const handleDeleteSong = (index) => {
    if (!playlist) return;
    const song = playlist.songs[index];
    store.addRemoveSongTransaction(song, index);
  };

  const handleUndo = () => store.undo();
  const handleRedo = () => store.redo();

  const handleClose = () => {
    store.closeCurrentList();
    onClose();
  };

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
          backgroundColor: '#f5f5dc', // cream
        },
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          backgroundColor: '#4caf50',
          color: 'white',
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Edit Playlist
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <Box
        sx={{
          backgroundColor: '#c8f7c5',
          p: 2,
          minHeight: 420,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top: title bar and add-song button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            value={nameInput}
            onChange={handleChangeName}
            onBlur={handleNameBlur}
            placeholder="Playlist name"
            sx={{
              backgroundColor: '#f5f5f5',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Button
            onClick={handleAddSong}
            sx={{
              ml: 2,
              backgroundColor: '#7e57c2',
              color: 'white',
              borderRadius: 999,
              px: 2.5,
              textTransform: 'none',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              '&:hover': { backgroundColor: '#5e35b1' },
            }}
          >
            <AddIcon fontSize="small" />
            <MusicNoteIcon fontSize="small" />
          </Button>
        </Box>

        {/* Song list */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: '#fdf5d5',
            borderRadius: 2,
            p: 2,
            boxShadow: 1,
            overflowY: 'auto',
          }}
        >
          {!playlist && (
            <Typography color="text.secondary">
              Loading playlist...
            </Typography>
          )}

          {playlist && songs.length === 0 && (
            <Typography color="text.secondary" fontStyle="italic">
              No songs in this playlist yet.
            </Typography>
          )}

          {playlist &&
            songs.map((song, index) => (
              <Box
                key={song._id || index}
                sx={{
                  mb: 1.5,
                  p: 1.2,
                  borderRadius: 1.5,
                  backgroundColor: '#fffbdd',
                  border: '1px solid #e0e0a0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
                  {index + 1}. {song.title} by {song.artist} ({song.year})
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditSong(index)}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 1,
                      '&:hover': { backgroundColor: '#f0f0f0' },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>

                  {/* You can later replace this with a “move” UI / drag handle;
                      right now we just keep the icon slots similar to screenshot */}
                  {/* <IconButton ...> move </IconButton> */}

                  <IconButton
                    size="small"
                    onClick={() => handleDeleteSong(index)}
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 1,
                      '&:hover': { backgroundColor: '#ffe6e6' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
        </Box>

        {/* Bottom bar: Undo / Redo / Close */}
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={handleUndo}
              startIcon={<UndoIcon />}
              sx={{
                backgroundColor: '#7e57c2',
                color: 'white',
                borderRadius: 20,
                px: 3,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#5e35b1' },
              }}
            >
              Undo
            </Button>
            <Button
              onClick={handleRedo}
              startIcon={<RedoIcon />}
              sx={{
                backgroundColor: '#7e57c2',
                color: 'white',
                borderRadius: 20,
                px: 3,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#5e35b1' },
              }}
            >
              Redo
            </Button>
          </Box>

          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              backgroundColor: '#4caf50',
              borderRadius: 999,
              textTransform: 'none',
              px: 4,
              '&:hover': { backgroundColor: '#43a047' },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
