import { useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import AuthContext from '../auth';
import { Box, Button, IconButton, Avatar, Menu, MenuItem, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useState } from 'react';

export default function AppBanner() {
  const { auth } = useContext(AuthContext);
  const history = useHistory();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  // Don't show banner on splash/login/register screens
  if (['/login', '/register', '/'].includes(location.pathname)) {
    return null;
  }

  const isPlaylistsView = location.pathname === '/home' || location.pathname.startsWith('/playlist');
  const isSongsView = location.pathname === '/songs';

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    auth.logoutUser();
  };

  const handleHome = () => {
    history.push('/home');
  };

  const getUserInitials = () => {
    if (auth.user && auth.user.userName) {
      return auth.user.userName.charAt(0).toUpperCase();
    }
    return '';
};


  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        backgroundColor: '#e020a0', // Magenta banner color
        position: 'relative',
      }}
    >
      {/* Left side - Home button and tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          onClick={handleHome}
          sx={{
            backgroundColor: 'white',
            width: 40,
            height: 40,
            '&:hover': { backgroundColor: '#f0f0f0' },
          }}
        >
          <HomeIcon sx={{ color: '#333' }} />
        </IconButton>

        {auth.loggedIn && (
          <>
            <Button
              onClick={() => history.push('/home')}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 0.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor: isPlaylistsView ? '#333' : 'transparent',
                color: 'white',
                '&:hover': {
                  backgroundColor: isPlaylistsView ? '#444' : 'rgba(255,255,255,0.2)',
                },
              }}
            >
              Playlists
            </Button>

            <Button
              onClick={() => history.push('/songs')}
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 0.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                backgroundColor: isSongsView ? '#2196F3' : 'transparent',
                color: 'white',
                '&:hover': {
                  backgroundColor: isSongsView ? '#1976D2' : 'rgba(255,255,255,0.2)',
                },
              }}
            >
              Song Catalog
            </Button>
          </>
        )}
      </Box>

      {/*Title */}
      <Typography
        variant="h5"
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontSize: '40px'
        
        
        }}
      >
        The Playlister
      </Typography>

      {/* Right side - User avatar */}
      <IconButton onClick={handleMenuOpen}>
        <Avatar
          sx={{
            backgroundColor: '#f5a623',
            width: 40,
            height: 40,
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {auth.loggedIn ? getUserInitials() : '👤'}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {auth.loggedIn ? (
          [
            <MenuItem key="account" onClick={() => { handleMenuClose(); history.push('/edit-account'); }}>
              Edit Account
            </MenuItem>,
            <MenuItem key="logout" onClick={handleLogout}>
              Logout
            </MenuItem>
          ]
        ) : (
          [
            <MenuItem key="login" onClick={() => { handleMenuClose(); history.push('/login'); }}>
              Login
            </MenuItem>,
            <MenuItem key="register" onClick={() => { handleMenuClose(); history.push('/register'); }}>
              Create Account
            </MenuItem>
          ]
        )}
      </Menu>
    </Box>
  );
}
