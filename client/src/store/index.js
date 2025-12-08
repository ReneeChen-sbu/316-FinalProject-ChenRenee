import { createContext, useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import {jsTPS} from "jstps"
import storeRequestSender from './requests'
import CreateSong_Transaction from '../transactions/CreateSong_Transaction'
import MoveSong_Transaction from '../transactions/MoveSong_Transaction'
import RemoveSong_Transaction from '../transactions/RemoveSong_Transaction'
import UpdateSong_Transaction from '../transactions/UpdateSong_Transaction'
import AuthContext from '../auth'

/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THIS IS THE CONTEXT WE'LL USE TO SHARE OUR STORE
export const GlobalStoreContext = createContext({});


// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    MARK_LIST_FOR_DELETION: "MARK_LIST_FOR_DELETION",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    EDIT_SONG: "EDIT_SONG",
    REMOVE_SONG: "REMOVE_SONG",
    HIDE_MODALS: "HIDE_MODALS",
    LOGOUT: "LOGOUT",
    SET_SEARCH_QUERY: "SET_SEARCH_QUERY",
    CLEAR_SEARCH: "CLEAR_SEARCH",
    FILTER_PLAYLISTS: "FILTER_PLAYLISTS",
    LOAD_ALL_SONGS: "LOAD_ALL_SONGS",
    SET_SONG_SEARCH_QUERY: "SET_SONG_SEARCH_QUERY",
    CLEAR_SONG_SEARCH: "CLEAR_SONG_SEARCH",
    FILTER_SONGS: "FILTER_SONGS",
    SET_SONG_TO_EDIT: "SET_SONG_TO_EDIT",
    SET_SONG_TO_REMOVE: "SET_SONG_TO_REMOVE",
    SET_SONG_TO_ADD_TO_PLAYLIST: "SET_SONG_TO_ADD_TO_PLAYLIST",
    OPEN_ADD_SONG_MODAL: "OPEN_ADD_SONG_MODAL",
    CLOSE_ADD_SONG_MODAL: "CLOSE_ADD_SONG_MODAL",
    OPEN_REMOVE_SONG_MODAL: "OPEN_REMOVE_SONG_MODAL",
    CLOSE_REMOVE_SONG_MODAL: "CLOSE_REMOVE_SONG_MODAL",
    OPEN_ADD_TO_PLAYLIST_MODAL: "OPEN_ADD_TO_PLAYLIST_MODAL",
    CLOSE_ADD_TO_PLAYLIST_MODAL: "CLOSE_ADD_TO_PLAYLIST_MODAL"

}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

export const CurrentModal = {
    NONE : "NONE",
    DELETE_LIST : "DELETE_LIST",
    EDIT_SONG : "EDIT_SONG",
    ERROR : "ERROR"
}

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
function GlobalStoreContextProvider(props) {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        currentModal : CurrentModal.NONE,
        idNamePairs: [],
        currentList: null,
        currentSongIndex : -1,
        currentSong : null,
        newListCounter: 0,
        listNameActive: false,
        listIdMarkedForDeletion: null,
        listMarkedForDeletion: null,
        searchQuery: "", 
        filteredPlaylists: [], 
        isSearching: false,
        allSongs: [],
        filteredSongs: [],
        isSongSearching: false,
        songSearchQuery: "",
        songToEdit: null,
        songToRemove: null,
        songToAddToPlaylist: null,
        isAddSongModalOpen: false,
        isRemoveSongModalOpen: false,
        isAddToPlaylistModalOpen: false
    });
    const history = useHistory();



    // SINCE WE'VE WRAPPED THE STORE IN THE AUTH CONTEXT WE CAN ACCESS THE USER HERE
    const { auth } = useContext(AuthContext);


    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    ...store,
                    currentModal : CurrentModal.NONE,
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.playlist,
                    currentSongIndex: -1,
                    currentSong: null,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                });
            }
            
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                })
            }
            // CREATE A NEW LIST
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                
                // Make sure we're adding to existing playlists, not replacing
                const newPairs = [...store.idNamePairs];
                
                // Check if the playlist already exists in the array
                const exists = newPairs.some(pair => 
                    pair._id === payload._id || pair._id === payload.id
                );
                
                if (!exists) {
                    newPairs.push({
                        _id: payload._id ?? payload.id,
                        name: payload.name,
                        ownerEmail: payload.ownerEmail,
                        songs: payload.songs || []
                    });
                }
                
               
                
                return setStore({
                    currentModal: CurrentModal.NONE,
                    idNamePairs: newPairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter + 1,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null,
                    searchQuery: store.searchQuery,
                    filteredPlaylists: store.filteredPlaylists,
                    isSearching: store.isSearching
                });
            }

            
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: payload,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                });
            }
            // PREPARE TO DELETE A LIST
            case GlobalStoreActionType.MARK_LIST_FOR_DELETION: {
                return setStore({
                    currentModal : CurrentModal.DELETE_LIST,
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: payload.id,
                    listMarkedForDeletion: payload.playlist
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: true,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                });
            }
            // 
            case GlobalStoreActionType.EDIT_SONG: {
                return setStore({
                    currentModal : CurrentModal.EDIT_SONG,
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    currentSongIndex: payload.currentSongIndex,
                    currentSong: payload.currentSong,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                });
            }
            case GlobalStoreActionType.REMOVE_SONG: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    currentSongIndex: payload.currentSongIndex,
                    currentSong: payload.currentSong,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                });
            }
            case GlobalStoreActionType.HIDE_MODALS: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: store.newListCounter,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                });
            }
            case GlobalStoreActionType.LOGOUT: {
                return setStore({
                    currentModal : CurrentModal.NONE,
                    idNamePairs: [],
                    currentList: null,
                    currentSongIndex: -1,
                    currentSong: null,
                    newListCounter: 0,
                    listNameActive: false,
                    listIdMarkedForDeletion: null,
                    listMarkedForDeletion: null
                });
            }

            case GlobalStoreActionType.SET_SEARCH_QUERY: {
                return setStore({
                    ...store,
                    searchQuery: payload.query,
                    isSearching: !!payload.query.trim()
                });
            }
            case GlobalStoreActionType.CLEAR_SEARCH: {
                return setStore({
                    ...store,
                    searchQuery: "",
                    filteredPlaylists: [],
                    isSearching: false
                });
            }
            case GlobalStoreActionType.FILTER_PLAYLISTS: {
                return setStore({
                    ...store,
                    filteredPlaylists: payload.filteredPlaylists,
                    isSearching: true
                });
            }
            case GlobalStoreActionType.LOAD_ALL_SONGS: {
                return setStore({
                    ...store,
                    allSongs: payload,
                    filteredSongs: []
                });
            }
            case GlobalStoreActionType.SET_SONG_SEARCH_QUERY: {
                return setStore({
                    ...store,
                    songSearchQuery: payload.query,
                    isSongSearching: !!payload.query.trim()
                });
            }
            case GlobalStoreActionType.CLEAR_SONG_SEARCH: {
                return setStore({
                    ...store,
                    songSearchQuery: "",
                    filteredSongs: [],
                    isSongSearching: false
                });
            }
            case GlobalStoreActionType.FILTER_SONGS: {
                return setStore({
                    ...store,
                    filteredSongs: payload.filteredSongs,
                    isSongSearching: true
                });
            }
            case GlobalStoreActionType.SET_SONG_TO_EDIT: {
                return setStore({
                    ...store,
                    songToEdit: payload
                });
            }
            case GlobalStoreActionType.SET_SONG_TO_REMOVE: {
                return setStore({
                    ...store,
                    songToRemove: payload
                });
            }
            case GlobalStoreActionType.SET_SONG_TO_ADD_TO_PLAYLIST: {
                return setStore({
                    ...store,
                    songToAddToPlaylist: payload
                });
            }
            case GlobalStoreActionType.OPEN_ADD_SONG_MODAL: {
                return setStore({
                    ...store,
                    isAddSongModalOpen: true
                });
            }
            case GlobalStoreActionType.CLOSE_ADD_SONG_MODAL: {
                return setStore({
                    ...store,
                    isAddSongModalOpen: false,
                    songToEdit: null
                });
            }
            case GlobalStoreActionType.OPEN_REMOVE_SONG_MODAL: {
                return setStore({
                    ...store,
                    isRemoveSongModalOpen: true
                });
            }
            case GlobalStoreActionType.CLOSE_REMOVE_SONG_MODAL: {
                return setStore({
                    ...store,
                    isRemoveSongModalOpen: false,
                    songToRemove: null
                });
            }
            

            default:
                return store;
        }
    }

    store.tryAcessingOtherAccountPlaylist = function(){
        let id = "635f203d2e072037af2e6284";
        async function asyncSetCurrentList(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.success) {
                let playlist = response.playlist;
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: playlist
                });
            }
        }
        asyncSetCurrentList(id);
        history.push("/playlist/635f203d2e072037af2e6284");
    }

    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.

    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
     
    
        async function asyncChangeListName(id) {
            // 1. Get the full playlist
            let response = await storeRequestSender.getPlaylistById(id);
            if (!response.success) {
                console.error("Failed to get playlist for rename:", response.errorMessage);
                return;
            }
    
            let playlist = response.playlist;
            playlist.name = newName;
    
            // 2. Save to server
            const listId = playlist._id ?? playlist.id;
            const updateRes = await storeRequestSender.updatePlaylistById(listId, playlist);
    
            if (!updateRes.success) {
                console.error("Failed to update playlist name on server:", updateRes.errorMessage);
                return;
            }
    
            // 3. Update idNamePairs locally (DON’T refetch all pairs)
            const updatedPairs = store.idNamePairs.map(pair => {
                const pairId = pair._id ?? pair.id;
                if (pairId === listId) {
                    return {
                        ...pair,
                        name: newName
                    };
                }
                return pair;
            });
    
            // 4. Push new state
            storeReducer({
                type: GlobalStoreActionType.CHANGE_LIST_NAME,
                payload: {
                    idNamePairs: updatedPairs,
                    playlist: playlist
                }
            });
        }
    
        asyncChangeListName(id);
    };
    
        // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
        store.closeCurrentList = function () {
            storeReducer({
                type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
                payload: {}
            });
            tps.clearAllTransactions();
        }
        

    // THIS FUNCTION CREATES A NEW LIST
    store.createNewList = async function () {
        let newListName = "Untitled" + store.newListCounter;

        
        try {
            const response = await storeRequestSender.createPlaylist(newListName, [], auth.user?.email);
            
            if (response && response.success) {
                tps.clearAllTransactions();
                let newList = response.playlist;
                
                // Update the state with the new playlist
                storeReducer({
                    type: GlobalStoreActionType.CREATE_NEW_LIST,
                    payload: newList
                });
                
                return { success: true, playlist: newList };
            }
            else {
                console.error("FAILED TO CREATE A NEW LIST", response);
                return { 
                    success: false, 
                    error: response?.errorMessage || "Unknown error" 
                };
            }
        } catch (error) {
            console.error("Error in createNewList:", error);
            return { 
                success: false, 
                error: error.message || "Network error" 
            };
        }
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = async function () {
        try {
          let response;
      
          if (auth.loggedIn && !auth.user?.isGuest) {
            response = await storeRequestSender.getPlaylistPairs();  // my + public
          } else {
            response = await storeRequestSender.getGuestPlaylists(); // public only
          }
          
      
          if (response.success) {
            storeReducer({
              type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
              payload: response.idNamePairs
            });
          } else {
            console.error("Failed to load idNamePairs:", response.errorMessage);
          }
        } catch (error) {
          console.error("Error loading playlist pairs:", error);
        }
      };
      
      

    // THE FOLLOWING 5 FUNCTIONS ARE FOR COORDINATING THE DELETION
    // OF A LIST, WHICH INCLUDES USING A VERIFICATION MODAL. THE
    // FUNCTIONS ARE markListForDeletion, deleteList, deleteMarkedList,
    // showDeleteListModal, and hideDeleteListModal
    store.markListForDeletion = function (id) {
        async function getListToDelete(id) {
            let response = await storeRequestSender.getPlaylistById(id);
            if (response.success) {
                let playlist = response.playlist;
                storeReducer({
                    type: GlobalStoreActionType.MARK_LIST_FOR_DELETION,
                    payload: {id: id, playlist: playlist}
                });
            }
        }
        getListToDelete(id);
    }
    store.deleteList = function (id) {
        async function processDelete(id) {
            let response = await storeRequestSender.deletePlaylistById(id);
            
            
            if (response.success) {
                // Just reload the playlists without navigating
                await store.loadIdNamePairs();
            }
        }
        processDelete(id);
    }
    store.deleteMarkedList = function() {
        // Store the ID before hiding modal
        const listIdToDelete = store.listIdMarkedForDeletion;
        
        // Hide modal first
        store.hideModals();
        
        // Then delete
        if (listIdToDelete) {
            store.deleteList(listIdToDelete);
        }
    }

    store.copyPlaylist = async function (playlistId) {
        try {
          const response = await storeRequestSender.copyPlaylist(playlistId);
      
          if (!response.success) {
            console.error('Copy playlist failed:', response.errorMessage);
            return { success: false, error: response.errorMessage };
          }
      
          // Make sure the new playlist shows up in the list
          await store.loadIdNamePairs();
      
          return { success: true, playlist: response.playlist };
        } catch (err) {
          console.error('Error copying playlist:', err);
          return { success: false, error: err.message };
        }
      };
      
    
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST

    store.showEditSongModal = (songIndex, songToEdit) => {
        storeReducer({
            type: GlobalStoreActionType.EDIT_SONG,
            payload: {currentSongIndex: songIndex, currentSong: songToEdit}
        });
    };

    store.hideModals = () => {
        auth.errorMessage = null;
        storeReducer({
            type: GlobalStoreActionType.HIDE_MODALS,
            payload: {}
        });    
    }
    store.isDeleteListModalOpen = () => {
        return store.currentModal === CurrentModal.DELETE_LIST;
    }
    store.isEditSongModalOpen = () => {
        return store.currentModal === CurrentModal.EDIT_SONG;
    }
    store.isErrorModalOpen = () => {
        return store.currentModal === CurrentModal.ERROR;
    }

    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.setCurrentList = function (id, options = {}) {
        const { navigate = false } = options; // CHANGE: default to false
    
        const isValidObjectId = (id) => {
            if (typeof id !== 'string') return false;
            return /^[0-9a-fA-F]{24}$/.test(id);
        };
    
        if (id === "guest" || id === "guest@playlister.com" || !isValidObjectId(id)) {
            return;
        }
    
        async function asyncSetCurrentList(id) {
            try {
                let response = await storeRequestSender.getPlaylistById(id);
                if (response.success) {
                    let playlist = response.playlist;
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: playlist
                    });
    
                    if (navigate) {
                        history.push("/playlist/" + id);
                    }
                } 
            } catch (error) {
                console.error("DEBUG: Error in setCurrentList:", error);
            }
        }
        asyncSetCurrentList(id);
    };
    
    store.getPlaylistSize = function () {
        if (!store.currentList || !Array.isArray(store.currentList.songs)) {
            return 0;
        }
        return store.currentList.songs.length;
    };

    
    // Load all songs
    store.loadAllSongs = async function () {
        try {
            const response = await storeRequestSender.getAllSongs();
            if (response.success) {
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ALL_SONGS,
                    payload: response.songs || []
                });
            }
        } catch (error) {
            console.error('Error loading songs:', error);
        }
    };
    
    // Search songs
    store.searchSongs = function(query) {
        if (!query.trim()) {
            store.clearSongSearch();
            return;
        }
        
        const terms = query.toLowerCase().trim().split(' ');
        const filtered = store.allSongs.filter(song => {
            return terms.every(term => {
                if (term.startsWith('title:')) {
                    const searchTerm = term.substring(6);
                    return song.title.toLowerCase().includes(searchTerm);
                }
                if (term.startsWith('artist:')) {
                    const searchTerm = term.substring(7);
                    return song.artist.toLowerCase().includes(searchTerm);
                }
                if (term.startsWith('year:')) {
                    const searchTerm = term.substring(5);
                    return String(song.year).includes(searchTerm);
                }
                
                // General search
                const searchTerm = term;
                return (
                    song.title.toLowerCase().includes(searchTerm) ||
                    song.artist.toLowerCase().includes(searchTerm) ||
                    String(song.year).includes(searchTerm)
                );
            });
        });
        
        storeReducer({
            type: GlobalStoreActionType.SET_SONG_SEARCH_QUERY,
            payload: { query }
        });
        
        storeReducer({
            type: GlobalStoreActionType.FILTER_SONGS,
            payload: { filteredSongs: filtered }
        });
    };
    
    store.clearSongSearch = function() {
        storeReducer({
            type: GlobalStoreActionType.CLEAR_SONG_SEARCH,
            payload: {}
        });
    };
    
    // Song modal methods
    store.openNewSongModal = function() {
        storeReducer({
            type: GlobalStoreActionType.OPEN_ADD_SONG_MODAL,
            payload: {}
        });
    };
    
    store.closeAddSongModal = function() {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_ADD_SONG_MODAL,
            payload: {}
        });
    };
    
    store.openRemoveSongModal = function() {
        storeReducer({
            type: GlobalStoreActionType.OPEN_REMOVE_SONG_MODAL,
            payload: {}
        });
    };
    
    store.closeRemoveSongModal = function() {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_REMOVE_SONG_MODAL,
            payload: {}
        });
    };
    
    store.setSongToEdit = function(song) {
        storeReducer({
            type: GlobalStoreActionType.SET_SONG_TO_EDIT,
            payload: song
        });
    };
    
    store.setSongToRemove = function(song) {
        storeReducer({
            type: GlobalStoreActionType.SET_SONG_TO_REMOVE,
            payload: song
        });
    };
    
    store.setSongToAddToPlaylist = function(song) {
        storeReducer({
            type: GlobalStoreActionType.SET_SONG_TO_ADD_TO_PLAYLIST,
            payload: song
        });
    };
    
    //create a brand-new song in the global catalog
    store.addSongToCatalog = async function (songData) {
        try {
            const response = await storeRequestSender.createSong(songData);
            if (response.success) {
                // Reload catalog so it shows up immediately
                await store.loadAllSongs();
                return response.song;
            } else {
                return null;
            }
        } catch (err) {
            throw err;
        }
    };

    
    
    // Update existing song
    store.updateSongInCatalog = async function(songId, songData) {
        try {
            const response = await storeRequestSender.updateSong(songId, songData);
            if (response.success) {
                await store.loadAllSongs();
                return true;
            }
        } catch (error) {
            console.error('Error updating song:', error);
            throw error;
        }
    };
    
    // Remove song from catalog
    store.removeSongFromCatalog = async function(songId) {
        try {
            const response = await storeRequestSender.deleteSong(songId);
            if (response.success) {
                await store.loadAllSongs();
                return true;
            }
        } catch (error) {
            console.error('Error removing song:', error);
            throw error;
        }
    };
        // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
        // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
        store.moveSong = function(start, end) {
            let list = store.currentList;
    
            // WE NEED TO UPDATE THE STATE FOR THE APP
            if (start < end) {
                let temp = list.songs[start];
                for (let i = start; i < end; i++) {
                    list.songs[i] = list.songs[i + 1];
                }
                list.songs[end] = temp;
            }
            else if (start > end) {
                let temp = list.songs[start];
                for (let i = start; i > end; i--) {
                    list.songs[i] = list.songs[i - 1];
                }
                list.songs[end] = temp;
            }
    
            // NOW MAKE IT OFFICIAL
            store.updateCurrentList();
        }
        // THIS FUNCTION REMOVES THE SONG AT THE index LOCATION
        // FROM THE CURRENT LIST
        store.removeSong = function(index) {
            let list = store.currentList;      
            list.songs.splice(index, 1); 
    
            // NOW MAKE IT OFFICIAL
            store.updateCurrentList();
        }
    
        // THIS FUNCTION UPDATES THE TEXT IN THE ITEM AT index TO text
        store.updateSong = function(index, songData) {
            let list = store.currentList;
            let song = list.songs[index];
            song.title = songData.title;
            song.artist = songData.artist;
            song.year = songData.year;
            song.youTubeId = songData.youTubeId;
    
            // NOW MAKE IT OFFICIAL
            store.updateCurrentList();
        }
    
        // Insert a song into the current playlist at position index
        store.createSong = function (index, songData) {
            if (!store.currentList) {
                console.warn("createSong called with no currentList");
                return;
            }
        
            let list = store.currentList;
        
            // Insert song into the songs array
            if (!Array.isArray(list.songs)) {
                list.songs = [];
            }
            list.songs.splice(index, 0, {
                title: songData.title,
                artist: songData.artist,
                year: songData.year,
                youTubeId: songData.youTubeId
            });
        
            // Persist to server
            store.updateCurrentList();
        };
    
    
        // PLAYLIST add-song (with transactions)
        store.addNewSongToPlaylist = () => {
            if (!store.currentList) {
                console.warn("addNewSongToPlaylist called but no currentList is open");
                return;
            }
            let playlistSize = store.getPlaylistSize();
            store.addCreateSongTransaction(
                playlistSize,
                "Untitled",
                "?",
                new Date().getFullYear(),
                "dQw4w9WgXcQ"
            );
        };

        // THIS FUNCDTION ADDS A CreateSong_Transaction TO THE TRANSACTION STACK
        store.addCreateSongTransaction = (index, title, artist, year, youTubeId) => {
            // ADD A SONG ITEM AND ITS NUMBER
            let song = {
                title: title,
                artist: artist,
                year: year,
                youTubeId: youTubeId
            };
            let transaction = new CreateSong_Transaction(store, index, song);
            tps.processTransaction(transaction);
        }    
        store.addMoveSongTransaction = function (start, end) {
            let transaction = new MoveSong_Transaction(store, start, end);
            tps.processTransaction(transaction);
        }
        // THIS FUNCTION ADDS A RemoveSong_Transaction TO THE TRANSACTION STACK
        store.addRemoveSongTransaction = (song, index) => {
            //let index = store.currentSongIndex;
            //let song = store.currentList.songs[index];
            let transaction = new RemoveSong_Transaction(store, index, song);
            tps.processTransaction(transaction);
        }
        store.addUpdateSongTransaction = function (index, newSongData) {
            let song = store.currentList.songs[index];
            if (!song) return;
        
            let oldSongData = {
                title: song.title,
                artist: song.artist,
                year: song.year,
                youTubeId: song.youTubeId
            };
        
            let transaction = new UpdateSong_Transaction(this, index, oldSongData, newSongData);
            tps.processTransaction(transaction);   // this will call store.updateSong internally
        };

        store.addSongToPlaylistFromCatalog = async function (playlistId, song) {
            try {
                console.log('DEBUG: Adding song to playlist', { 
                    playlistId, 
                    songTitle: song.title,
                    songId: song._id 
                });
                
                // First get the current playlist
                const playlistResponse = await storeRequestSender.getPlaylistById(playlistId);
                if (!playlistResponse.success) {
                    console.error('DEBUG: Failed to get playlist:', playlistResponse.errorMessage);
                    return false;
                }
                
                const playlist = playlistResponse.playlist;
                console.log('DEBUG: Got playlist:', { 
                    name: playlist.name, 
                    currentSongs: playlist.songs ? playlist.songs.length : 0 
                });
                
                // Create song data for the playlist (basic structure)
                const songToAdd = {
                    title: song.title,
                    artist: song.artist,
                    year: song.year,
                    youTubeId: song.youTubeId
                };
                
                // Add to songs array
                const currentSongs = Array.isArray(playlist.songs) ? playlist.songs : [];
                
                // Check if song already exists (prevent duplicates)
                const songExists = currentSongs.some(existingSong => 
                    existingSong.title === song.title && 
                    existingSong.artist === song.artist
                );
                
                if (songExists) {
                    console.log('DEBUG: Song already exists in playlist');
                    return false;
                }
                
                const updatedSongs = [...currentSongs, songToAdd];
                
                //  Update playlist on server
                console.log('DEBUG: Updating playlist with new song...');
                const updateResponse = await storeRequestSender.updatePlaylistById(
                    playlistId,
                    { 
                        ...playlist, 
                        songs: updatedSongs 
                    }
                );
                
                if (updateResponse.success) {
                    console.log('DEBUG: Successfully added song to playlist');
                    
                    // Refresh the playlist data
                    await store.loadIdNamePairs();
                    
                    // If this is the current open playlist, refresh it too
                    if (store.currentList && store.currentList._id === playlistId) {
                        store.setCurrentList(playlistId);
                    }
                    
                    return true;
                } else {
                    console.error('DEBUG: Failed to update playlist:', updateResponse.errorMessage);
                    return false;
                }
                
            } catch (error) {
                console.error('DEBUG: Error in addSongToPlaylistFromCatalog:', error);
                return false;
            }
        };
    

        store.updateCurrentList = function () {
        
        async function asyncUpdateCurrentList() {
            if (!store.currentList) {
                console.warn("updateCurrentList called with no currentList");
                return;
            }
    
            const listId = store.currentList._id ?? store.currentList.id;
            
            // Create a clean copy with proper songs array
            const listCopy = {
                ...store.currentList,
                songs: Array.isArray(store.currentList.songs) 
                    ? [...store.currentList.songs] 
                    : []
            };
            
            
            try {
                const response = await storeRequestSender.updatePlaylistById(listId, listCopy);
                if (response.success) {
                    // Update local state with server response
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: response.playlist || listCopy
                    });
                } else {
                    console.error("updatePlaylistById failed:", response.errorMessage);
                }
            } catch (err) {
                console.error("Error calling updatePlaylistById:", err);
            }
        }
    
        asyncUpdateCurrentList();
    };
        
        store.undo = function () {
            tps.undoTransaction();
        }
        store.redo = function () {
            tps.doTransaction();
        }
        store.canAddNewSong = function() {
            return (store.currentList !== null);
        }
        store.canUndo = function() {
            return ((store.currentList !== null) && tps.hasTransactionToUndo());
        }
        store.canRedo = function() {
            return ((store.currentList !== null) && tps.hasTransactionToDo());
        }
        store.canClose = function() {
            return (store.currentList !== null);
        }
    
        // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
        store.setIsListNameEditActive = function () {
            storeReducer({
                type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
                payload: null
            });
        }
    
        store.searchPlaylists = function(query) {
            if (!query.trim()) {
                storeReducer({
                    type: GlobalStoreActionType.CLEAR_SEARCH,
                    payload: {}
                });
                return;
            }
            
        
            // First, make sure we have full playlist data with songs
            // If idNamePairs don't have songs, we need to fetch them
            if (!store.idNamePairs || store.idNamePairs.length === 0) {
                storeReducer({
                    type: GlobalStoreActionType.SET_SEARCH_QUERY,
                    payload: { query }
                });
                storeReducer({
                    type: GlobalStoreActionType.FILTER_PLAYLISTS,
                    payload: { filteredPlaylists: [] }
                });
                return;
            }
            
            // Parse the query for prefix-based search
            const terms = query.toLowerCase().trim().split(' ');       
            const filtered = store.idNamePairs.filter(playlist => {
                // Check if playlist has songs (for debugging)
                const hasSongs = playlist.songs && Array.isArray(playlist.songs);
                
                // Check each search term
                return terms.every(term => {
                    // Handle prefix-based searches
                    if (term.startsWith('playlist:')) {
                        const searchTerm = term.substring(9); // Remove 'playlist:'
                        const playlistName = playlist.name || '';
                        const matches = playlistName.toLowerCase().includes(searchTerm);
                        return matches;
                    }
                    
                    if (term.startsWith('username:')) {
                        const searchTerm = term.substring(9); // Remove 'username:'
                        const ownerEmail = playlist.ownerEmail || '';
                        const username = ownerEmail.split('@')[0] || '';
                        const matches = username.toLowerCase().includes(searchTerm);
                        return matches;
                    }
                    
                    if (term.startsWith('title:')) {
                        const searchTerm = term.substring(6); // Remove 'title:'
                        const songs = playlist.songs || [];
                        const matches = songs.some(song => 
                            song.title && song.title.toLowerCase().includes(searchTerm)
                        );
                        return matches;
                    }
                    
                    if (term.startsWith('artist:')) {
                        const searchTerm = term.substring(7); // Remove 'artist:'
                        const songs = playlist.songs || [];
                        const matches = songs.some(song => 
                            song.artist && song.artist.toLowerCase().includes(searchTerm)
                        );
                        return matches;
                    }
                    
                    if (term.startsWith('year:')) {
                        const searchTerm = term.substring(5); // Remove 'year:'
                        const songs = playlist.songs || [];
                        const matches = songs.some(song => 
                            String(song.year || '').includes(searchTerm)
                        );
                        return matches;
                    }
                    
                    // If no prefix, search all fields
                    const searchTerm = term;
                    const playlistName = playlist.name || '';
                    const ownerEmail = playlist.ownerEmail || '';
                    const username = ownerEmail.split('@')[0] || '';
                    const songs = playlist.songs || [];
                    
                    const matches = 
                        playlistName.toLowerCase().includes(searchTerm) ||
                        username.toLowerCase().includes(searchTerm) ||
                        songs.some(song => 
                            (song.title && song.title.toLowerCase().includes(searchTerm)) ||
                            (song.artist && song.artist.toLowerCase().includes(searchTerm)) ||
                            String(song.year || '').includes(searchTerm)
                        );
                    return matches;
                });
            });
            
            storeReducer({
                type: GlobalStoreActionType.SET_SEARCH_QUERY,
                payload: { query }
            });
            
            storeReducer({
                type: GlobalStoreActionType.FILTER_PLAYLISTS,
                payload: { filteredPlaylists: filtered }
            });
        };
            
          
        
        store.clearSearch = function() {
            storeReducer({
                type: GlobalStoreActionType.CLEAR_SEARCH,
                payload: {}
            });
        };
    
        store.addSongToPlaylistFromCatalog = async function (playlistId, song) {
            try {
                // Call backend to attach the song to that playlist
                const response = await storeRequestSender.addSongToPlaylist(
                    playlistId,
                    song._id
                );
        
                if (response.success) {
                    // Optionally refresh idNamePairs so counts and songs update
                    await store.loadIdNamePairs();
                    return true;
                } else {
                    console.error('Failed to add song to playlist:', response.errorMessage);
                    return false;
                }
            } catch (err) {
                console.error('Error adding song to playlist:', err);
                return false;
            }
        };
        
    
    
    
        store.loadGuestPlaylists = async function () {
            try {
                const response = await storeRequestSender.getGuestPlaylists();
                if (response.success) {
                    storeReducer({
                        type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                        payload: response.idNamePairs
                    });
                } 
            } catch (error) {
                console.error('Error loading guest playlists:', error);
            }
        };
        
        // Helper to get playlists to display (either filtered or all)
        store.getDisplayPlaylists = function() {
            return store.isSearching ? store.filteredPlaylists : store.idNamePairs;
        };
    
        store.updatePlaylistDirectly = async function (id, updatedPlaylist) {
            try {
              // First update locally
              const list = store.currentList;
              if (list && (list._id === id || list.id === id)) {
                // Update the current list
                Object.assign(list, updatedPlaylist);
                
                // Update the store state
                storeReducer({
                  type: GlobalStoreActionType.SET_CURRENT_LIST,
                  payload: list
                });
              }
              
              // Then update on server
              const response = await storeRequestSender.updatePlaylistById(id, updatedPlaylist);
              if (response.success) {
                // Refresh the playlist pairs
                await store.loadIdNamePairs();
                return true;
              } else {
                return false;
              }
            } catch (error) {
              return false;
            }
          };
        
    
    
        function KeyPress(event) {
            if (!store.modalOpen && event.ctrlKey){
                if(event.key === 'z'){
                    store.undo();
                } 
                if(event.key === 'y'){
                    store.redo();
                }
            }
        }
      
        document.onkeydown = (event) => KeyPress(event);
    
        return (
            <GlobalStoreContext.Provider value={{
                store
            }}>
                {props.children}
            </GlobalStoreContext.Provider>
        );
    }
    
    export default GlobalStoreContext;
    export { GlobalStoreContextProvider };

    