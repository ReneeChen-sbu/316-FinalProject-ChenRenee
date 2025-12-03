import { useContext, useEffect, useState } from 'react';
import { GlobalStoreContext } from '../store';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Select, 
    MenuItem, 
    FormControl
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
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

    const handleSearch = () => {
        console.log('🔍 Search button clicked');
        console.log('Filters:', {
            playlistNameFilter,
            userNameFilter,
            songTitleFilter,
            songArtistFilter,
            songYearFilter
        });
        
        // Build search query from all filters
        const searchTerms = [];
        if (playlistNameFilter) {
            console.log(`Adding playlist filter: ${playlistNameFilter}`);
            searchTerms.push(`playlist:${playlistNameFilter}`);
        }
        if (userNameFilter) {
            console.log(`Adding user filter: ${userNameFilter}`);
            searchTerms.push(`username:${userNameFilter}`);
        }
        if (songTitleFilter) {
            console.log(`Adding title filter: ${songTitleFilter}`);
            searchTerms.push(`title:${songTitleFilter}`);
        }
        if (songArtistFilter) {
            console.log(`Adding artist filter: ${songArtistFilter}`);
            searchTerms.push(`artist:${songArtistFilter}`);
        }
        if (songYearFilter) {
            console.log(`Adding year filter: ${songYearFilter}`);
            searchTerms.push(`year:${songYearFilter}`);
        }
        
        const query = searchTerms.join(' ');
        console.log('Final search query:', query);
        
        store.searchPlaylists(query);
    };

    const handleClear = () => {
        setPlaylistNameFilter('');
        setUserNameFilter('');
        setSongTitleFilter('');
        setSongArtistFilter('');
        setSongYearFilter('');
        store.clearSearch();
    };

    const sortPlaylists = (playlists) => {
        if (!playlists) return [];
        
        const sorted = [...playlists];
        switch(sortBy) {
            case 'listeners-hi-lo':
                return sorted.sort((a, b) => (b.listens || 0) - (a.listens || 0));
            case 'listeners-lo-hi':
                return sorted.sort((a, b) => (a.listens || 0) - (b.listens || 0));
            case 'name-a-z':
                return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            case 'name-z-a':
                return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            case 'owner-a-z':
                return sorted.sort((a, b) => {
                    const ownerA = a.ownerEmail ? a.ownerEmail.split('@')[0] : '';
                    const ownerB = b.ownerEmail ? b.ownerEmail.split('@')[0] : '';
                    return ownerA.localeCompare(ownerB);
                });
            case 'owner-z-a':
                return sorted.sort((a, b) => {
                    const ownerA = a.ownerEmail ? a.ownerEmail.split('@')[0] : '';
                    const ownerB = b.ownerEmail ? b.ownerEmail.split('@')[0] : '';
                    return ownerB.localeCompare(ownerA);
                });
            default:
                return sorted;
        }
    };

    // Use filtered playlists when searching, otherwise use all playlists
    const displayPlaylists = store.isSearching ? 
        store.filteredPlaylists : 
        store.idNamePairs;
    
    const sortedPlaylists = sortPlaylists(displayPlaylists);

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
                        onClick={handleSearch}
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

                {/* Search Status */}
                {store.isSearching && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8e0f8', borderRadius: 2 }}>
                        <Typography variant="body2" color="#9c27b0">
                            Found {store.filteredPlaylists.length} playlist{store.filteredPlaylists.length !== 1 ? 's' : ''}
                            {store.searchQuery && (
                                <Typography variant="caption" component="div" sx={{ mt: 0.5, color: '#666' }}>
                                    Search: {store.searchQuery}
                                </Typography>
                            )}
                        </Typography>
                    </Box>
                )}
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
                        {sortedPlaylists ? sortedPlaylists.length : 0} Playlist{sortedPlaylists && sortedPlaylists.length !== 1 ? 's' : ''}
                        {store.isSearching && ' (filtered)'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {sortedPlaylists && sortedPlaylists.length > 0 ? (
                        sortedPlaylists.map((pair) => (
                            <PlaylistCard key={pair._id} idNamePair={pair} />
                        ))
                    ) : (
                        <Box sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            border: '1px solid #e0e0e0'
                        }}>
                            <Typography variant="h6" color="text.secondary">
                                {store.isSearching ? 
                                    'No playlists match your search criteria.' : 
                                    'No playlists yet. Create your first playlist!'}
                            </Typography>
                        </Box>
                    )}
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
