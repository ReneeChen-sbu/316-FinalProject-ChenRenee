import { useState, useContext } from 'react';
import GlobalStoreContext from '../store';
import { Box, Button, Avatar, IconButton, Typography, Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function PlaylistCard({ idNamePair }) {
  const { store } = useContext(GlobalStoreContext);
  const [expanded, setExpanded] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    store.markListForDeletion(idNamePair._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    store.setCurrentList(idNamePair._id);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    console.log('Copy playlist', idNamePair._id);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    console.log('Play playlist', idNamePair._id);
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

   // Use actual data from idNamePair
   const ownerName = idNamePair.ownerEmail ? idNamePair.ownerEmail.split('@')[0] : 'Unknown';
   const listenerCount = idNamePair.listens || 0;
   const songs = idNamePair.songs || [];

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        mb: 2,
        overflow: 'hidden',
      }}
    >
      {/* Main card content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
        }}
      >
        {/* Left side: Avatar and info */}
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
            <Typography
              sx={{
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#333',
              }}
            >
              {idNamePair.name}
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: '#666',
              }}
            >
              {ownerName}
            </Typography>
          </Box>
        </Box>

        {/* Right side: Buttons and expand arrow */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

          <IconButton
            size="small"
            onClick={handleToggleExpand}
            sx={{ ml: 0.5 }}
          >
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Listener count */}
      <Box sx={{ px: 1.5, pb: 1 }}>
        <Typography
          sx={{
            fontSize: '13px',
            color: '#00bcd4',
            fontWeight: 500,
          }}
        >
          {listenerCount} Listeners
        </Typography>
      </Box>

      {/* Expanded songs list */}
      <Collapse in={expanded}>
        <Box
          sx={{
            borderTop: '1px solid #e0e0e0',
            p: 1.5,
            backgroundColor: '#fafafa',
          }}
        >
          {songs.map((song, index) => (
            <Typography
              key={song._id || index}
              sx={{
                fontSize: '14px',
                color: '#333',
                py: 0.5,
              }}
            >
              {index + 1}. {song.title} by {song.artist} ({song.year})
            </Typography>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
