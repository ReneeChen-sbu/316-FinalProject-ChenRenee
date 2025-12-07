import { useState, useContext } from 'react';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';
import { Box, Button, Avatar, IconButton, Typography, Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import PlayPlaylistModal from './PlayPlaylistModal';
import EditPlaylistModal from './EditPlaylistModal';   
import MUIEditSongModal from './MUIEditSongModal';


export default function PlaylistCard({ idNamePair }) {
  const { store } = useContext(GlobalStoreContext);
  const { auth } = useContext(AuthContext);
  const [expanded, setExpanded] = useState(false);

  const [playOpen, setPlayOpen] = useState(false);  
  const [editOpen, setEditOpen] = useState(false);   

  console.log('PlaylistCard received:', idNamePair);

  const handleDelete = (e) => {
    e.stopPropagation();
    store.markListForDeletion(idNamePair._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    console.log('Edit clicked for playlist:', idNamePair._id);
    store.setCurrentList(idNamePair._id, { navigate: false });
    setEditOpen(true);
  };
  

  const handleCopy = async (e) => {
    e.stopPropagation();
    const result = await store.copyPlaylist(idNamePair._id);
    if (!result.success) {
      console.error('Failed to copy playlist:', result.error);
    }
  };
  

  const handlePlay = (e) => {
    e.stopPropagation();
    console.log('Play playlist', idNamePair._id);
    setPlayOpen(true);
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const playlistName = idNamePair?.name || idNamePair?.title || 'Untitled Playlist';

  const ownerEmail = idNamePair?.ownerEmail || idNamePair?.email || idNamePair?.owner || '';
  const ownerName =
  idNamePair?.userName ||
  idNamePair?.ownerName ||
  idNamePair?.ownerUserName ||
  (ownerEmail ? ownerEmail.split('@')[0] : 'Unknown User');

  const isOwner = auth.loggedIn && auth.user?.email === ownerEmail;




  const listenerCount =
    idNamePair?.listens || idNamePair?.listenerCount || idNamePair?.playCount || 0;

  const songs = idNamePair?.songs || idNamePair?.items || idNamePair?.tracks || [];

  // Function to format time in mm:ss format
  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mock duration for songs (you should replace this with actual duration from your data)
  const getSongDuration = (song, index) => {
    // If you have duration in your song data, use it
    if (song.duration) return formatTime(song.duration);
    
    // Mock durations based on the image (Our House, Take Me Home, Our House)
    const mockDurations = [3 * 60 + 46, 6 * 60 + 9, 3 * 60 + 1]; // 3:46, 6:09, 3:01
    return formatTime(mockDurations[index % mockDurations.length]);
  };

  return (
    <>
      {/* CARD CONTENT */}
      <Box
        sx={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          mb: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                backgroundColor: '#4fc3f7',
                fontSize: '24px',
              }}
            >
              🤖
            </Avatar>

            <Box>
              <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                {playlistName}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666' }}>
                {ownerName}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isOwner && (
            <>
            <Button
              size="small"
              onClick={handleDelete}
              sx={{
                backgroundColor: '#e53935',
                color: 'white',
                borderRadius: '4px',
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                fontSize: '12px',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#c62828' },
              }}
            >
              Delete
            </Button>

            <Button
              size="small"
              onClick={handleEdit}
              sx={{
                backgroundColor: '#1976d2',
                color: 'white',
                borderRadius: '4px',
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                fontSize: '12px',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              Edit
            </Button>
            </>
          )}

            {auth.loggedIn && (
            <Button
              size="small"
              onClick={handleCopy}
              sx={{
                backgroundColor: '#00897b',
                color: 'white',
                borderRadius: '4px',
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                fontSize: '12px',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#00796b' },
              }}
            >
              Copy
            </Button>
            )}

            <Button
              size="small"
              onClick={handlePlay}
              sx={{
                backgroundColor: '#e020a0',
                color: 'white',
                borderRadius: '4px',
                px: 1.5,
                py: 0.5,
                minWidth: 'auto',
                fontSize: '12px',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#c01080' },
              }}
            >
              Play
            </Button>

            <IconButton size="small" onClick={handleToggleExpand} sx={{ ml: 0.5 }}>
              {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ px: 1.5, pb: 1 }}>
          <Typography sx={{ fontSize: '13px', color: '#00bcd4', fontWeight: 500 }}>
            {listenerCount} {listenerCount === 1 ? 'Listener' : 'Listeners'}
          </Typography>
        </Box>

        <Collapse in={expanded}>
          <Box
            sx={{
              borderTop: '1px solid #e0e0e0',
              p: 1.5,
              backgroundColor: '#fafafa',
            }}
          >
            {songs.length > 0 ? (
              songs.map((song, index) => {
                const songTitle = song?.title || song?.name || 'Untitled Song';
                const songArtist = song?.artist || song?.artistName || 'Unknown Artist';
                const songYear = song?.year || song?.releaseYear || '';
                const songDuration = getSongDuration(song, index);

                return (
                  <Box 
                    key={song._id || `song-${index}`}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.75,
                      borderBottom: index < songs.length - 1 ? '1px solid #e0e0e0' : 'none'
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: '14px', color: '#333', fontWeight: 500 }}>
                        {index + 1}. {songTitle} by {songArtist}{' '}
                        {songYear ? `(${songYear})` : ''}
                      </Typography>
                    </Box>
                    <Typography sx={{ 
                      fontSize: '14px', 
                      color: '#666',
                      fontFamily: 'monospace',
                      fontWeight: 500
                    }}>
                      {songDuration}
                    </Typography>
                  </Box>
                );
              })
            ) : (
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#999',
                  fontStyle: 'italic',
                  py: 0.5,
                }}
              >
                No songs in this playlist yet
              </Typography>
            )}
            
            {/* Total time at the bottom */}
            {songs.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1,
                pt: 1,
                borderTop: '1px solid #e0e0e0'
              }}>
                
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* PLAY MODAL */}
      <PlayPlaylistModal
        open={playOpen}
        onClose={() => setPlayOpen(false)}
        playlist={idNamePair}
        initialIndex={0}
      />

      {/* EDIT MODAL */}
      <EditPlaylistModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        playlistId={idNamePair._id}
      />
       <MUIEditSongModal />
    </>
  );
}
