import { useContext } from 'react';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';
import { Button, Box, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { Link } from 'react-router-dom';

export default function SplashScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    
    const handleGuestButton = () => {
        auth.loginAsGuest();
    }

    return (
        <Box 
            sx={{
                width: '100%',
                height: '100vh',
                backgroundColor: '#f8e0f0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 4,
            }}
        >
            {/* Main Container */}
            <Box 
                sx={{
                    width: '100%',
                    maxWidth: 1000,
                    maxHeight:1000,
                    backgroundColor: '#f8e0f0',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3,
                    justifyContent: 'center',
                    alignItems:'center'
                }}
            >
                {/* Header Bar: Magenta */}
                <Box 
                    sx={{
                        backgroundColor: '#e020a0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1
                    }}
                >
                    <IconButton sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}>
                        <HomeIcon />
                    </IconButton>
                    <IconButton sx={{ color: 'white' }}>
                        <AccountCircleIcon fontSize="large" />
                    </IconButton>
                </Box>

                {/* Content Area: Cream/Beige */}
                <Box 
                    sx={{
                        backgroundColor: '#f5f5dc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 8,
                        px: 4,
                        minHeight: 400
                    }}
                >
                    {/* Title */}
                    <Box 
                        sx={{ 
                            fontSize: '3.5rem', 
                            fontWeight: 400,
                            color: '#555',
                            mb: 3,
                            fontFamily: 'serif'
                        }}
                    >
                        The Playlister
                    </Box>

                    {/* Music Note Logo */}
                    <Box sx={{ mb: 6 }}>
                        <QueueMusicIcon sx={{ fontSize: 220, color: '#333' }} />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button
                            onClick={handleGuestButton}
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#333',
                                color: 'white',
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                fontSize: '0.9rem',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: '#555'
                                }
                            }}
                        >
                            Continue as Guest
                        </Button>

                        <Button
                            component={Link}
                            to="/login/"
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#333',
                                color: 'white',
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                fontSize: '0.9rem',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: '#555'
                                }
                            }}
                        >
                            Login
                        </Button>

                        <Button
                            component={Link}
                            to="/register/"
                            variant="contained"
                            sx={{ 
                                backgroundColor: '#333',
                                color: 'white',
                                textTransform: 'none',
                                px: 3,
                                py: 1,
                                fontSize: '0.9rem',
                                borderRadius: 1,
                                '&:hover': {
                                    backgroundColor: '#555'
                                }
                            }}
                        >
                            Create Account
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}