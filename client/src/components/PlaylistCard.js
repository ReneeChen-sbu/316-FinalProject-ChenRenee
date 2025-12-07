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


  if (!idNamePair) {
    console.warn('PlaylistCard rendered with undefined idNamePair');
    return null;
  }

  // Destructure AFTER the guard so we never touch _id on undefined
  const {
    _id: playlistId,
    name,
    title,
    ownerEmail,
    email,
    owner,
    userName,
    ownerName,
    ownerUserName,
    ownerAvatar,
    listens,
    listenerCount,
    playCount,
    songs,
    items,
    tracks,
  } = idNamePair;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!playlistId) return;
    store.markListForDeletion(playlistId);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (!playlistId) return;
    console.log('Edit clicked for playlist:', playlistId);
    store.setCurrentList(playlistId, { navigate: false });
    setEditOpen(true);
  };

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!playlistId) return;
    const result = await store.copyPlaylist(playlistId);
    if (!result?.success) {
      console.error('Failed to copy playlist:', result?.error);
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!playlistId) return;
    console.log('Play playlist', playlistId);
    setPlayOpen(true);
  };

  const handleToggleExpand = () => setExpanded((prev) => !prev);

  const playlistName = name || title || 'Untitled Playlist';

  const resolvedOwnerEmail = ownerEmail || email || owner || '';
  const resolvedOwnerName =
    userName ||
    ownerName ||
    ownerUserName ||
    (resolvedOwnerEmail ? resolvedOwnerEmail.split('@')[0] : 'Unknown User');

  const isOwner = auth.loggedIn && auth.user?.email === resolvedOwnerEmail;
  const canCopy = auth.loggedIn && !auth.user?.isGuest;

  const resolvedListenerCount = listens || listenerCount || playCount || 0;

  const resolvedSongs = songs || items || tracks || [];

  const avatarSrc = isOwner ? auth.user?.avatar || ownerAvatar : ownerAvatar;

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSongDuration = (song, index) => {
    if (song?.duration) return formatTime(song.duration);
    const mockDurations = [3 * 60 + 46, 6 * 60 + 9, 3 * 60 + 1]; // 3:46, 6:09, 3:01
    return formatTime(mockDurations[index % mockDurations.length]);
  };

  const ownerInitial =
    resolvedOwnerName && resolvedOwnerName.length > 0
      ? resolvedOwnerName[0].toUpperCase()
      : 'U';

  console.log('PlaylistCard received:', idNamePair);

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
           src={avatarSrc || undefined}
           sx={{
             width: 48,
             height: 48,
             backgroundColor: avatarSrc ? 'transparent' : '#4fc3f7',
             fontSize: '24px',
           }}
         >
           {!avatarSrc && ownerInitial}
         </Avatar>

            <Box>
              <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                {playlistName}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#666' }}>
                {resolvedOwnerName}
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

            {canCopy && (
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
            {resolvedListenerCount}{' '}
            {resolvedListenerCount === 1 ? 'Listener' : 'Listeners'}
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
            {resolvedSongs.length > 0 ? (
              resolvedSongs.map((song, index) => {
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
                      borderBottom:
                        index < resolvedSongs.length - 1
                          ? '1px solid #e0e0e0'
                          : 'none',
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{ fontSize: '14px', color: '#333', fontWeight: 500 }}
                      >
                        {index + 1}. {songTitle} by {songArtist}{' '}
                        {songYear ? `(${songYear})` : ''}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        color: '#666',
                        fontFamily: 'monospace',
                        fontWeight: 500,
                      }}
                    >
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
      {playlistId && (
        <EditPlaylistModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          playlistId={playlistId}
        />
      )}

      <MUIEditSongModal />
    </>
  );
}
