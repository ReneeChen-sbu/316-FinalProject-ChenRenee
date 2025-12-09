import { useContext } from 'react';
import { GlobalStoreContext } from '../store';
import { Modal, Box, Button, Typography, Grid, Divider } from '@mui/material';

// Exact same colors as your delete modal
const greenColors = {
    dark: '#2e7d32',
    primary: '#4caf50'
};

// Exact same modal style as your delete modal
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450, // Same width as delete modal
    bgcolor: 'background.paper',
    border: '2px solid #000000', // Same border
    boxShadow: 24,
    p: 0, // No padding on main box
    borderRadius: 0, // No border radius
};

// Exact same button style as your delete modal
const buttonStyle = {
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
};

export default function MUIRemoveSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const isOpen = store.isRemoveSongModalOpen;
    const songToRemove = store.songToRemove;

    const handleClose = () => {
        store.closeRemoveSongModal();
    };

    const handleRemove = async () => {
       if (!songToRemove) return;
       const songId = songToRemove._id || songToRemove.songId;
       if (!songId) return;
       await store.removeSongFromCatalog(songId);
       handleClose();

    };

    if (!songToRemove) return null;

    return (
        <Modal 
            open={isOpen}
            onClose={handleClose}
            aria-labelledby="remove-song-modal"
            aria-describedby="confirm-song-removal"
        >
            <Box sx={modalStyle}>
         
                <Box sx={{
                    backgroundColor: greenColors.dark,
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'left',
                    height: 20, // Same height
                }}>
                    <Typography 
                        variant="h5" 
                        component="h2" 
                        sx={{ 
                            fontWeight: 'bold',
                            fontSize: '1.5rem',
                            textAlign: 'center',
                            width: '100%'
                        }}
                    >
                        Remove Song?
                    </Typography>
                </Box>
                
             
                <Divider sx={{ 
                    borderColor: greenColors.primary, 
                    borderWidth: 1,
                    m: 0
                }} />
                
   
                <Box sx={{ 
                    p: 3,
                    border: '2px solid #000000',
                    borderTop: 'none'
                }}>

                    <Typography sx={{ 
                        mb: 2,
                        fontSize: '1.5rem',
                        color: '#333',
                        lineHeight: 1.5,
                        textAlign: 'center'
                    }}>
                        Are you sure you want to remove <strong>"{songToRemove.title}"</strong> from the catalog?
                    </Typography>
                    
                    <Typography sx={{ 
                        fontSize: '0.9rem',
                        color: '#666',
                        lineHeight: 1.5,
                        textAlign: 'center',
                        mb: 3
                    }}>
                        Doing so will permanently remove it from all playlists.
                    </Typography>
                    
       
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item>
                            <Button
                                variant="contained"
                                onClick={handleRemove}
                                sx={buttonStyle}
                            >
                                Remove Song
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                onClick={handleClose}
                                sx={buttonStyle}
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Modal>
    );
}
