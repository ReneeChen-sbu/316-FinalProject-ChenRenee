import { useContext, useState, useEffect } from 'react';
import { GlobalStoreContext } from '../store';
import { Modal, Box, TextField, Button, Typography, Alert } from '@mui/material';

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

export default function MUIAddSongModal() {
    const { store } = useContext(GlobalStoreContext);
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [year, setYear] = useState('');
    const [youtubeId, setYoutubeId] = useState('');
    const [error, setError] = useState('');

    const isOpen = store.isAddSongModalOpen;

    const resetForm = () => {
        setTitle('');
        setArtist('');
        setYear('');
        setYoutubeId('');
        setError('');
    };

    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const handleClose = () => {
        store.closeAddSongModal();
        resetForm();
    };

    const handleComplete = async () => {
        // Validation
        if (!title.trim()) {
            setError('Title is required');
            return;
        }
        if (!artist.trim()) {
            setError('Artist is required');
            return;
        }
        if (!year || isNaN(year) || parseInt(year) < 1900 || parseInt(year) > new Date().getFullYear()) {
            setError('Please enter a valid year');
            return;
        }
        if (!youtubeId.trim()) {
            setError('YouTube ID is required');
            return;
        }

        try {
            await store.addNewSong({
                title: title.trim(),
                artist: artist.trim(),
                year: parseInt(year),
                youtubeId: youtubeId.trim()
            });
            handleClose();
        } catch (err) {
            setError(err.message || 'Failed to add song');
        }
    };

    const isFormValid = title.trim() && artist.trim() && year && youtubeId.trim();

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" gutterBottom>
                    Add New Song
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    margin="normal"
                    required
                />
                
                <TextField
                    fullWidth
                    label="Artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    margin="normal"
                    required
                />
                
                <TextField
                    fullWidth
                    label="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    margin="normal"
                    type="number"
                    required
                />
                
                <TextField
                    fullWidth
                    label="YouTube Video ID"
                    value={youtubeId}
                    onChange={(e) => setYoutubeId(e.target.value)}
                    margin="normal"
                    required
                    helperText="Enter the YouTube video ID (e.g., dQw4w9WgXcQ)"
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleComplete}
                        disabled={!isFormValid}
                    >
                        Complete
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}
