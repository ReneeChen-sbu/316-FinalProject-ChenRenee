import { useContext } from 'react';
import { GlobalStoreContext } from '../store';
import { Modal, Box, Button, Typography, Alert } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

export default function MUIRemoveSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const isOpen = store.isRemoveSongModalOpen;
    const songToRemove = store.songToRemove;

    const handleClose = () => {
        store.closeRemoveSongModal();
    };

    const handleRemove = async () => {
        if (songToRemove) {
            await store.removeSong(songToRemove._id);
            handleClose();
        }
    };

    if (!songToRemove) return null;

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" gutterBottom>
                    Remove Song?
                </Typography>
                
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Are you sure you want to remove "{songToRemove.title}" from the catalog?
                    Doing so will remove it from all playlists.
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error"
                        onClick={handleRemove}
                    >
                        Remove Song
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}