import { useContext, useState, useEffect } from 'react';
import { GlobalStoreContext } from '../store';
import { Box, TextField, Button, Typography, Alert, Divider, Grid } from '@mui/material';

// Green color palette to match MUIEditSongModal
const greenColors = {
    primary: '#4caf50',
    dark: '#388e3c',
    light: '#c8e6c9',
};

export default function MUIAddSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [year, setYear] = useState('');
    const [youTubeId, setYouTubeId] = useState('');
    const [error, setError] = useState('');

    // Use local state to prevent infinite loops
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const shouldOpen = store.currentModal === 'ADD_SONG' || store.isAddSongModalOpen;
        console.log("MUIAddSongModal useEffect:", {
            shouldOpen,
            currentModal: store.currentModal,
            isAddSongModalOpen: store.isAddSongModalOpen
        });
        
        if (shouldOpen !== isModalOpen) {
            setIsModalOpen(shouldOpen);
            
            if (!shouldOpen) {
                // Reset form when closing
                resetForm();
            }
        }
    }, [store.currentModal, store.isAddSongModalOpen]);

    const resetForm = () => {
        setTitle('');
        setArtist('');
        setYear('');
        setYouTubeId('');
        setError('');
    };

    const handleClose = () => {
        if (store.hideModals) {
            store.hideModals();
        } else if (store.closeAddSongModal) {
            store.closeAddSongModal();
        }
        resetForm();
    };

    const handleConfirm = async () => {
        const songData = {
            title: title.trim(),
            artist: artist.trim(),
            year: Number(year) || new Date().getFullYear(),
            youTubeId: youTubeId.trim()
        };
    
        try {
            const song = await store.addSongToCatalog(songData);
            if (song) {
                // close modal etc
                store.closeAddSongModal && store.closeAddSongModal();
            }
        } catch (err) {
            console.error("Error in AddSongModal confirm:", err);
            
        }
    };
 

    const isFormValid = title.trim() && artist.trim() && year && youTubeId.trim();

    // Don't render if modal is closed
    if (!isModalOpen) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'fixed',
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
                zIndex: 1300
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
                    Add New Song
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
                {/* Error Alert */}
                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 2,
                            '& .MuiAlert-icon': { color: '#d32f2f' }
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Form Fields */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        size="small"
                        required
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
                        required
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
                        type="number"
                        required
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
                        label="YouTube Video ID"
                        value={youTubeId}
                        onChange={(e) => setYouTubeId(e.target.value)}
                        fullWidth
                        size="small"
                        required
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
                            onClick={handleClose}
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
                            disabled={!isFormValid}
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
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: '#cccccc',
                                    color: '#666666'
                                }
                            }}
                        >
                            Confirm
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
