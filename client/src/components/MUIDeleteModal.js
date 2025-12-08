import { useContext } from 'react';
import GlobalStoreContext from '../store';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height: 350, 
    bgcolor: '#c8e6c9', 
    border: '2px solid #000000',
    boxShadow: 24,
    p: 0, 
    borderRadius: 0, 
    display: 'flex',
    flexDirection: 'column',
};

// Green color palette
const greenColors = {
    primary: '#4caf50', // Main green
    dark: '#388e3c', // Darker green for hover
    light: '#c8e6c9', // Light green
};

export default function MUIDeleteModal() {
    const { store } = useContext(GlobalStoreContext);
    
    // Use the store's modal state
    const isOpen = store.currentModal === 'DELETE_LIST';
    const playlistToDelete = store.listMarkedForDeletion;
    
    function handleConfirmDelete() {
        // Delete the marked playlist
        if (playlistToDelete && store.listIdMarkedForDeletion) {
            store.deleteMarkedList();
        }
    }
    
    function handleCancelDelete() {
        store.hideModals();
    }
    
    // If no playlist to delete or modal not open, don't render
    if (!isOpen || !playlistToDelete) {
        return null;
    }
    
    return (
        <Modal 
            open={isOpen}
            onClose={handleCancelDelete}
            aria-labelledby="delete-playlist-modal"
            aria-describedby="confirm-playlist-deletion"
        >
            <Box sx={modalStyle}>
                {/* Title Section with Green Background and Separator Line */}
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
                        Delete playlist?
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
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    {/* Message */}
                    <Box>
                        <Typography sx={{ 
                            mb: 2,
                            fontSize: '1.5rem',
                            color: '#333',
                            lineHeight: 1.5,
                            textAlign: 'center'
                        }}>
                            Are you sure you want to delete the <strong>"{playlistToDelete.name}"</strong> playlist?
                        </Typography>
                        
                        <Typography sx={{ 
                            fontSize: '0.9rem',
                            color: '#666',
                            lineHeight: 1.5,
                            textAlign: 'center'
                        }}>
                            Doing so means it will be permanently removed.
                        </Typography>
                    </Box>
                    
                    {/* Buttons */}
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item>
                            <Button
                                variant="contained"
                                onClick={handleConfirmDelete}
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
                                Delete Playlist
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                onClick={handleCancelDelete}
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
                                        backgroundColor: greenColors.dark,
                                   
                                    }
                                }}
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