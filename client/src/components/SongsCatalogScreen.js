import { useContext, useEffect, useState } from 'react';
import AuthContext from '../auth'; 
import { GlobalStoreContext } from '../store';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Select, 
    MenuItem, 
    FormControl,
    Alert,
    Snackbar,
    IconButton,
    Card,
    CardContent,
    Menu,
    Chip,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MUIEditSongModal from './MUIEditSongModal';
import MUIRemoveSongModal from './MUIRemoveSongModal';
import MUIAddSongModal from './MUIAddSongModal';

export default function SongsCatalogScreen() {
    const { store } = useContext(GlobalStoreContext);
    const { auth } = useContext(AuthContext); 

    const [titleFilter, setTitleFilter] = useState('');
    const [artistFilter, setArtistFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [sortBy, setSortBy] = useState('listens-hi-lo');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });




    // Menu states
    const [songMenuAnchor, setSongMenuAnchor] = useState(null);
    const [selectedSongForMenu, setSelectedSongForMenu] = useState(null);
    const [showPlaylistPanel, setShowPlaylistPanel] = useState(false);
    
    const [selectedSongId, setSelectedSongId] = useState(null);
    const [currentVideoSong, setCurrentVideoSong] = useState(null);
    

    const playlists = (store.idNamePairs || [])
        .filter((pl) => pl.ownerEmail === auth.user?.email)
          .sort((a, b) => {
            const getDate = (item) => new Date(item.lastAccessed || item.updatedAt || 0).getTime();
              return getDate(b) - getDate(a);
          });
    
  
         
    

    // Load songs on component mount
    useEffect(() => {
        store.loadAllSongs();
        store.loadIdNamePairs();
    }, [auth.loggedIn]);

    // Search songs
    const handleSearch = () => {
        const searchTerms = [];
        if (titleFilter) searchTerms.push(`title:${titleFilter}`);
        if (artistFilter) searchTerms.push(`artist:${artistFilter}`);
        if (yearFilter) searchTerms.push(`year:${yearFilter}`);
        
        const query = searchTerms.join(' ');
        store.searchSongs(query);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleClear = () => {
        setTitleFilter('');
        setArtistFilter('');
        setYearFilter('');
        store.clearSongSearch();
        
        setSnackbar({
            open: true,
            message: 'Search filters cleared',
            severity: 'info'
        });
    };

    const handleCreateNewSong = () => {
        store.openNewSongModal();
    };

    const handlePlaySong = (song) => {
        setSelectedSongId(song._id);
        setCurrentVideoSong(song);
    };

    // Open the main song menu
    const handleSongMenuOpen = (event, song) => {
        event.stopPropagation();
        setSelectedSongForMenu(song);
        setSongMenuAnchor(event.currentTarget);
        setShowPlaylistPanel(true);
    };
    
    const handleSongMenuClose = () => {
        setSongMenuAnchor(null);
        setSelectedSongForMenu(null);
        setShowPlaylistPanel(false);
    };
    
    // Handle hovering over "Add to Playlist" to show submenu
    const handleShowPlaylistPanel = (event) => {
        event.stopPropagation();
        setShowPlaylistPanel(true);
    };
    
    // Add song to specific playlist
    const handleAddSongToPlaylist = async (playlist) => {
        if (!selectedSongForMenu) return;
    
        const ok = await store.addSongToPlaylistFromCatalog(
            playlist._id,
            selectedSongForMenu
        );
    
        if (ok) {
            setSnackbar({
                open: true,
                message: `Added "${selectedSongForMenu.title}" to "${playlist.name}"`,
                severity: 'success'
            });
        } else {
            setSnackbar({
                open: true,
                message: `Failed to add "${selectedSongForMenu.title}" to "${playlist.name}"`,
                severity: 'error'
            });
        }
    
        handleSongMenuClose();
    };
    
    
    

    // EDIT SONG
    const handleEditSong = () => {
        if (selectedSongForMenu) {    
            const displaySongs = store.isSongSearching
                ? (store.filteredSongs || [])
                : (store.allSongs || []);
            
            const songIndex = displaySongs.findIndex(song => song._id === selectedSongForMenu._id);
            
            store.showEditSongModal(songIndex, selectedSongForMenu);
        }
        handleSongMenuClose();
    };

    // REMOVE SONG
    const handleRemoveSong = () => {
        if (selectedSongForMenu) {
            // First set the song to remove, then open the modal
            store.setSongToRemove(selectedSongForMenu);
            store.openRemoveSongModal();
        }
        handleSongMenuClose();
    };

    // Sort songs
    const sortSongs = (songs) => {
        if (!songs || !Array.isArray(songs)) return [];
        
        const sorted = [...songs];
        switch (sortBy) {
            case 'listens-hi-lo':
                // Try different property names - your data might have listens, listenCount, or plays
                return sorted.sort((a, b) => {
                    const aListens = a.listens || a.listenCount || a.plays || 0;
                    const bListens = b.listens || b.listenCount || b.plays || 0;
                    return bListens - aListens;
                });
            case 'listens-lo-hi':
                return sorted.sort((a, b) => {
                    const aListens = a.listens || a.listenCount || a.plays || 0;
                    const bListens = b.listens || b.listenCount || b.plays || 0;
                    return aListens - bListens;
                });
            case 'playlists-hi-lo':
                // Try different property names for playlist count
                return sorted.sort((a, b) => {
                    const aPlaylists = a.playlistCount || a.playlists || a.playlistOccurrences || 0;
                    const bPlaylists = b.playlistCount || b.playlists || b.playlistOccurrences || 0;
                    return bPlaylists - aPlaylists;
                });
            case 'playlists-lo-hi':
                return sorted.sort((a, b) => {
                    const aPlaylists = a.playlistCount || a.playlists || a.playlistOccurrences || 0;
                    const bPlaylists = b.playlistCount || b.playlists || b.playlistOccurrences || 0;
                    return aPlaylists - bPlaylists;
                });
            case 'title-a-z':
                return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            case 'title-z-a':
                return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
            case 'artist-a-z':
                return sorted.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''));
            case 'artist-z-a':
                return sorted.sort((a, b) => (b.artist || '').localeCompare(a.artist || ''));
            case 'year-hi-lo':
                return sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
            case 'year-lo-hi':
                return sorted.sort((a, b) => (a.year || 0) - (b.year || 0));
            default:
                return sorted;
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const isSongOwnedByUser = (song) => {
        if (!auth.loggedIn || auth.user?.isGuest) return false;
        
    
        
        
        const isAddedByUser = song.addedBy === auth.user?._id;
        const isOwnerEmailMatch = song.ownerEmail === auth.user?.email;
        const isUserIdInAddedBy = song.addedBy?._id === auth.user?._id; // Handle populated addedBy object
        
        return isAddedByUser || isOwnerEmailMatch || isUserIdInAddedBy;
    };
    

    const displaySongs = store.isSongSearching
        ? (store.filteredSongs || [])
        : (store.allSongs || []);
    
    const sortedSongs = sortSongs(displaySongs);

    const videoSrc = currentVideoSong?.youTubeId
        ? `https://www.youtube.com/embed/${currentVideoSong.youTubeId}`
        : null;

    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: 'calc(100vh - 120px)',
            backgroundColor: '#f8e0f0',
            p: 3
        }}>
            {/* LEFT SIDEBAR */}
            <Box sx={{ width: '33%', pr: 3 }}>
                <Typography variant="h4" sx={{ color: '#e020a0', fontWeight: 800, mb: 3 }}>
                    Songs Catalog
                </Typography>

                {/* Filters */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        placeholder="by Title"
                        value={titleFilter}
                        onChange={(e) => setTitleFilter(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#f3e5f5',
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                    <TextField
                        placeholder="by Artist"
                        value={artistFilter}
                        onChange={(e) => setArtistFilter(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#f3e5f5',
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                    <TextField
                        placeholder="by Year"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#f3e5f5',
                                '& fieldset': { border: 'none' }
                            }
                        }}
                    />
                </Box>

                {/* Search / Clear buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<SearchIcon />}
                        onClick={handleSearch}
                        sx={{
                            flex: 1,
                            backgroundColor: '#5e35b1',
                            borderRadius: '20px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#4527a0' }
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleClear}
                        sx={{
                            flex: 1,
                            backgroundColor: '#5e35b1',
                            borderRadius: '20px',
                            textTransform: 'none',
                            '&:hover': { backgroundColor: '#4527a0' }
                        }}
                    >
                        Clear
                    </Button>
                </Box>

                {/* Search Status */}
                {store.isSongSearching && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f3e5f5', borderRadius: 2 }}>
                        <Typography variant="body2" color="#5e35b1">
                            Found {store.filteredSongs ? store.filteredSongs.length : 0} song
                            {store.filteredSongs && store.filteredSongs.length !== 1 ? 's' : ''}
                            {store.songSearchQuery && (
                                <Typography variant="caption" component="div" sx={{ mt: 0.5, color: '#666' }}>
                                    Search: {store.songSearchQuery}
                                </Typography>
                            )}
                        </Typography>
                    </Box>
                )}

                {/* YouTube player */}
                {videoSrc && (
                    <Box sx={{ mt: 4, borderRadius: 2, overflow: 'hidden', boxShadow: 3, backgroundColor: '#000', aspectRatio: '16 / 9' }}>
                        <iframe
                            key={currentVideoSong._id}
                            width="100%"
                            height="100%"
                            src={videoSrc}
                            title={currentVideoSong.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </Box>
                )}
            </Box>

            {/* RIGHT CONTENT – song cards */}
            <Box sx={{ flex: 1, backgroundColor: '#f5f5dc', borderRadius: 2, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 600, color: '#666' }}>Sort:</Typography>
                        <FormControl size="small">
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                sx={{ minWidth: 180 }}
                            >
                                <MenuItem value="listens-hi-lo">Listens (Hi-Lo)</MenuItem>
                                <MenuItem value="listens-lo-hi">Listens (Lo-Hi)</MenuItem>
                                <MenuItem value="playlists-hi-lo">Playlists (Hi-Lo)</MenuItem>
                                <MenuItem value="playlists-lo-hi">Playlists (Lo-Hi)</MenuItem>
                                <MenuItem value="title-a-z">Title (A-Z)</MenuItem>
                                <MenuItem value="title-z-a">Title (Z-A)</MenuItem>
                                <MenuItem value="artist-a-z">Artist (A-Z)</MenuItem>
                                <MenuItem value="artist-z-a">Artist (Z-A)</MenuItem>
                                <MenuItem value="year-hi-lo">Year (Hi-Lo)</MenuItem>
                                <MenuItem value="year-lo-hi">Year (Lo-Hi)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Typography sx={{ fontWeight: 600, color: '#666' }}>
                        {sortedSongs ? sortedSongs.length : 0} Song
                        {sortedSongs && sortedSongs.length !== 1 ? 's' : ''}
                        {store.isSongSearching && ' (filtered)'}
                    </Typography>
                </Box>

                {/* Song Cards */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    {sortedSongs && sortedSongs.length > 0 ? (
                        sortedSongs.map((song, index) => {
                            const isSelected = selectedSongId === song._id;
                            const isOwned = isSongOwnedByUser(song);

                            // Debug: log the song object to see what properties it has
                            console.log('Song object:', song);

                            // Get the listen count (try different property names)
                            const listenCount = song.listens || song.listenCount || song.plays || 0;
                            
                            // Get the playlist count (try different property names)
                            const playlistCount = song.playlistCount || song.playlists || song.playlistOccurrences || 0;

                            return (
                                <Card 
                                    key={song._id} 
                                    onClick={() => handlePlaySong(song)}
                                    sx={{ 
                                        cursor: 'pointer',
                                        borderRadius: 2,
                                        backgroundColor: isSelected ? '#ffe9b3' : '#fff8d5',
                                        border: isSelected ? '2px solid #f44336' : '1px solid #f0c36d',
                                        position: 'relative',
                                        boxShadow: isSelected ? 4 : 1,
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.15s ease-in-out'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1, pr: 2 }}>
                                                <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: 16, color: '#424242' }}>
                                                    {song.title} by {song.artist} ({song.year})
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                                    <Chip 
                                                        label={`Listens: ${listenCount.toLocaleString()}`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#ffe0b2',
                                                            borderRadius: '12px',
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                    <Chip 
                                                        label={`Playlists: ${playlistCount}`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#dcedc8',
                                                            borderRadius: '12px',
                                                            fontWeight: 500
                                                        }}
                                                    />
                                                    {isOwned && (
                                                        <Chip
                                                            label="My Song"
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#bbdefb',
                                                                borderRadius: '12px',
                                                                fontWeight: 500
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {auth.loggedIn && !auth.user?.isGuest && (
                                                    <IconButton 
                                                        size="small"
                                                        onClick={(e) => handleSongMenuOpen(e, song)}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(103, 58, 183, 0.08)'
                                                            }
                                                        }}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 8, backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                            <Typography variant="h6" color="text.secondary">
                                {store.isSongSearching ? 'No songs match your search criteria.' : 'No songs in catalog yet.'}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* New Song Button */}
                {auth.loggedIn && !auth.user?.isGuest && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={handleCreateNewSong}
                            sx={{
                                backgroundColor: '#5e35b1',
                                borderRadius: '20px',
                                textTransform: 'none',
                                '&:hover': { backgroundColor: '#4527a0' }
                            }}
                        >
                            New Song
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Main song menu with playlist panel */}
            <Menu
                anchorEl={songMenuAnchor}
                open={Boolean(songMenuAnchor)}
                onClose={handleSongMenuClose}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: 'visible',
                        mt: 1,
                        boxShadow: 4,
                        p: 0
                    }
                }}
            >
               <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                  <Box
                     sx={{
                            minWidth: 200,
                           bgcolor: '#d1c4e9',
                           borderTopLeftRadius: 8,
                           borderBottomLeftRadius: 8,
                           overflow: 'hidden'
                       }}
                  >
                        <MenuItem
                            onClick={handleShowPlaylistPanel}
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                bgcolor: showPlaylistPanel ? '#c5b0f5' : '#d1c4e9',
                               color: '#2f1c46',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#c5b0f5'
                                }
                            }}
                        >
                            Add to Playlist

                           <ArrowRightIcon fontSize="small" />
                        </MenuItem>

                           <MenuItem

                                onClick={handleEditSong}

                                sx={{

                                   display: 'flex',

                                   alignItems: 'center',

                                   gap: 1,

                                    color: '#2f1c46',

                                    fontWeight: 600,

                                   '&:hover': { backgroundColor: '#e1bee7' }

                                }}

                            >

                                <EditIcon fontSize="small" />

                                Edit Song

                            </MenuItem>


                            <MenuItem

                                onClick={handleRemoveSong}

                               sx={{

                                    display: 'flex',

                                   alignItems: 'center',

                                    gap: 1,

                                    color: '#2f1c46',

                                    fontWeight: 600,

                                   '&:hover': { backgroundColor: '#ffcdd2' }

                               }}

                            >

                                <DeleteIcon fontSize="small" />

                                Remove from Catalog

                            </MenuItem>

                    </Box>

                   {showPlaylistPanel && (

                        <Box

                            sx={{

                               width: 220,

                                bgcolor: '#e8b4b4',
                                borderTopRightRadius: 8,
                                borderBottomRightRadius: 8,
                                borderLeft: '4px solid #d1c4e9',
                                display: 'flex',
                                flexDirection: 'column'
                            }}

                        >

                            <List dense disablePadding sx={{ py: 1 }}>

                                {playlists.length === 0 ? (
                                    <ListItem sx={{ py: 1.5 }}>
                                        <ListItemText
                                         primary="No Playlists Yet"
                                          sx={{ color: '#4a2f2f', textAlign: 'center' }}
                                       />

                                   </ListItem>
                               ) : (

                                   playlists.map((playlist) => (

                                       <ListItem

                                            key={playlist._id}

                                           button

                                            onClick={() => handleAddSongToPlaylist(playlist)}

                                          sx={{

                                               borderBottom: '1px solid rgba(0,0,0,0.08)',

                                               '&:last-of-type': { borderBottom: 'none' },

                                                '&:hover': { bgcolor: '#f0a4a4' }

                                           }}

                                        >
                                            <ListItemText
                                               primary={playlist.name}
                                               sx={{ color: '#4a2f2f', fontWeight: 700 }}

                                            />

                                       </ListItem>

                                    ))

                               )}

                            </List>

                       </Box>

                    )}

                </Box>
            </Menu>

            {/* Modals */}
            <MUIEditSongModal />
            <MUIRemoveSongModal />
            <MUIAddSongModal />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}