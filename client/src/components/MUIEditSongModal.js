import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Divider } from '@mui/material';
import GlobalStoreContext from '../store';

// Green color palette
const greenColors = {
    primary: '#4caf50',
    dark: '#388e3c',
    light: '#c8e6c9',
};

export default function MUIEditSongModal() {
    const { store } = useContext(GlobalStoreContext);

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
        return null;
    }

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
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: '#c8e6c9',
                    border: '2px solid #000000',
                    boxShadow: 24,
                    p: 0,
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Title Section with Green Background */}
                <Box sx={{
                    backgroundColor: greenColors.dark,
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'left',
                    height: 20,
                }}>
                    <Typography
                        variant="h5"
                        component="h2"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '1.5rem',
                            textAlign: 'center'
                        }}
                    >
                        Edit Song
                    </Typography>
                </Box>

                {/* Separator Line */}
                <Divider sx={{ borderColor: greenColors.primary, borderWidth: 1 }} />

                {/* Content Area */}
                <Box sx={{
                    flex: 1,
                    p: 3,
                    display: 'flex',
                    border: '2px solid #000000',
                    borderTop: 'none',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 2
                }}>
                    {/* Form Fields */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                            size="small"
                            sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#000000',
                                        borderWidth: '1px'
                                    }
                                }
                            }}
                        />
                        <TextField
                            label="Artist"
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            fullWidth
                            size="small"
                            sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#000000',
                                        borderWidth: '1px'
                                    }
                                }
                            }}
                        />
                        <TextField
                            label="Year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            fullWidth
                            size="small"
                            sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#000000',
                                        borderWidth: '1px'
                                    }
                                }
                            }}
                        />
                        <TextField
                            label="YouTube ID"
                            value={youTubeId}
                            onChange={(e) => setYouTubeId(e.target.value)}
                            fullWidth
                            size="small"
                            sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#000000',
                                        borderWidth: '1px'
                                    }
                                }
                            }}
                        />
                    </Box>

                    {/* Buttons */}
                    <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                        <Grid item>
                            <Button
                                variant="contained"
                                onClick={handleCancel}
                                sx={{
                                    backgroundColor: '#333',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontSize: '0.9rem',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 3,
                                    minWidth: 120,
                                    '&:hover': {
                                        backgroundColor: greenColors.dark
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                onClick={handleConfirm}
                                sx={{
                                    backgroundColor: '#333',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontSize: '0.9rem',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 3,
                                    minWidth: 120,
                                    '&:hover': {
                                        backgroundColor: greenColors.dark
                                    }
                                }}
                            >
                                Confirm
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}