import { useContext, useEffect, useState } from 'react';
import { GlobalStoreContext } from '../store';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Select, 
    MenuItem, 
    FormControl,
    InputAdornment,
    IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ClearIcon from '@mui/icons-material/Clear';
import PlaylistCard from './PlaylistCard';
import MUIDeleteModal from './MUIDeleteModal';

export default function HomeScreen() {
    const { store } = useContext(GlobalStoreContext);
    const [playlistNameFilter, setPlaylistNameFilter] = useState('');
    const [userNameFilter, setUserNameFilter] = useState('');
    const [songTitleFilter, setSongTitleFilter] = useState('');
    const [songArtistFilter, setSongArtistFilter] = useState('');
    const [songYearFilter, setSongYearFilter] = useState('');
    const [sortBy, setSortBy] = useState('listeners-hi-lo');

    useEffect(() => {
        store.loadIdNamePairs();
    }, []);

    const handleClear = () => {
        setPlaylistNameFilter('');
        setUserNameFilter('');
        setSongTitleFilter('');
        setSongArtistFilter('');
        setSongYearFilter('');
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: 'calc(100vh - 120px)',
            backgroundColor: '#f8e0f0',
            p: 3
        }}>
            {/* Left sidebar - Filters */}
            <Box sx={{ width: '33%', pr: 3 }}>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        color: '#9c27b0', 
                        fontWeight: 'bold', 
                        mb: 3 
                    }}
                >
                    Playlists
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        placeholder="by Playlist Name"
                        value={playlistNameFilter}
                        onChange={(e) => setPlaylistNameFilter(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#d8d0e8',
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                    <TextField
                        placeholder="by User Name"
                        value={userNameFilter}
                        onChange={(e) => setUserNameFilter(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#d8d0e8',
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                    <TextField
                        placeholder="by Song Title"
                        value={songTitleFilter}
                        onChange={(e) => setSongTitleFilter(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#d8d0e8',
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                    <TextField
                        placeholder="by Song Artist"
                        value={songArtistFilter}
                        onChange={(e) => setSongArtistFilter(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#d8d0e8',
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                    <TextField
                        placeholder="by Song Year"
                        value={songYearFilter}
                        onChange={(e) => setSongYearFilter(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#d8d0e8',
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        sx={{
                            flex: 1,
                            backgroundColor: '#9c27b0',
                            borderRadius: '20px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#7b1fa2' }
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleClear}
                        sx={{
                            flex: 1,
                            backgroundColor: '#9c27b0',
                            borderRadius: '20px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#7b1fa2' }
                        }}
                    >
                        Clear
                    </Button>
                </Box>
            </Box>

            {/* Right content - Playlists */}
            <Box sx={{ flex: 1, backgroundColor: '#f5f5dc', borderRadius: 2, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, color: '#666' }}>Sort:</Typography>
                        <FormControl size="small">
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{ minWidth: 150 }}
                            >
                                <MenuItem value="listeners-hi-lo">Listeners (Hi-Lo)</MenuItem>
                                <MenuItem value="listeners-lo-hi">Listeners (Lo-Hi)</MenuItem>
                                <MenuItem value="name-a-z">Name (A-Z)</MenuItem>
                                <MenuItem value="name-z-a">Name (Z-A)</MenuItem>
                                <MenuItem value="owner-a-z">Owner (A-Z)</MenuItem>
                                <MenuItem value="owner-z-a">Owner (Z-A)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Typography sx={{ fontWeight: 600, color: '#666' }}>
                        {store.idNamePairs ? store.idNamePairs.length : 0} Playlists
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {store.idNamePairs && store.idNamePairs.map((pair) => (
                        <PlaylistCard key={pair._id} idNamePair={pair} />
                    ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => store.createNewList()}
                        sx={{
                            backgroundColor: '#9c27b0',
                            borderRadius: '20px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#7b1fa2' }
                        }}
                    >
                        New Playlist
                    </Button>
                </Box>
            </Box>

            <MUIDeleteModal />
        </Box>
    );
}
