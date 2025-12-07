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

}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

const CurrentModal = {
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
        isSearching: false 
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
    
            console.log("Playlist name changed successfully");
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
            console.log("createNewList response: ", response);
            
            if (response && response.success) {
                tps.clearAllTransactions();
                let newList = response.playlist;
                
                // Update the state with the new playlist
                storeReducer({
                    type: GlobalStoreActionType.CREATE_NEW_LIST,
                    payload: newList
                });
                
                console.log("Created new playlist without navigation:", newList);
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
          console.log("loadIdNamePairs called", {
            isLoggedIn: auth.loggedIn,
            user: auth.user,
            isGuest: auth.user?.isGuest,
            userEmail: auth.user?.email
          });
      
          let response;
      
          if (auth.loggedIn && !auth.user?.isGuest) {
            response = await storeRequestSender.getPlaylistPairs();  // my + public
          } else {
            response = await storeRequestSender.getGuestPlaylists(); // public only
          }
          
      
          if (response.success) {
            console.log('idNamePairs from server:', response.idNamePairs);
      
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
                console.log("Playlist deleted, staying on current page");
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
        console.log("DEBUG: showEditSongModal called");
        console.log("Song index:", songIndex);
        console.log("Song to edit:", songToEdit);
        console.log("Current modal before:", store.currentModal);
        
        storeReducer({
            type: GlobalStoreActionType.EDIT_SONG,
            payload: {currentSongIndex: songIndex, currentSong: songToEdit}
        });
        
        console.log("Current modal after:", store.currentModal);
        console.log("Should be EDIT_SONG:", store.currentModal === CurrentModal.EDIT_SONG);
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
        console.log("DEBUG: setCurrentList called with id:", id);
    
        const { navigate = false } = options; // CHANGE: default to false
    
        const isValidObjectId = (id) => {
            if (typeof id !== 'string') return false;
            return /^[0-9a-fA-F]{24}$/.test(id);
        };
    
        if (id === "guest" || id === "guest@playlister.com" || !isValidObjectId(id)) {
            console.log("DEBUG: Skipping setCurrentList - invalid ObjectId:", id);
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
                } else {
                    console.log("DEBUG: Failed to get playlist:", response.errorMessage);
                }
            } catch (error) {
                console.error("DEBUG: Error in setCurrentList:", error);
            }
        }
        asyncSetCurrentList(id);
    };
    
    store.getPlaylistSize = function() {
        return store.currentList.songs.length;
    }
    store.addNewSong = function() {
        let index = this.getPlaylistSize();
        this.addCreateSongTransaction(index, "Untitled", "?", new Date().getFullYear(), "dQw4w9WgXcQ");
    }
    // THIS FUNCTION CREATES A NEW SONG IN THE CURRENT LIST
    // USING THE PROVIDED DATA AND PUTS THIS SONG AT INDEX
    store.createSong = function(index, song) {
        let list = store.currentList;
        
        // Make sure songs is an array
        if (!Array.isArray(list.songs)) {
            console.error("songs is not an array! Current value:", list.songs);
            list.songs = [];
        }
        
        list.songs.splice(index, 0, song);
        console.log("After adding song, songs array:", list.songs);
        
        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }

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
    store.addNewSong = () => {
        let playlistSize = store.getPlaylistSize();
        store.addCreateSongTransaction(
            playlistSize, "Untitled", "?", new Date().getFullYear(), "dQw4w9WgXcQ");
    }
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
    
    store.updateCurrentList = function () {
    console.log("DEBUG: updateCurrentList called");
    console.log("Current list songs:", store.currentList?.songs);
    console.log("Songs type:", typeof store.currentList?.songs);
    
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
        
        console.log("DEBUG: Sending to server:", listCopy);
        
        try {
            const response = await storeRequestSender.updatePlaylistById(listId, listCopy);
            if (response.success) {
                console.log("Server update successful");
                
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
        
        console.log('Searching with query:', query);
        console.log('Available playlists:', store.idNamePairs);
        
        // First, make sure we have full playlist data with songs
        // If idNamePairs don't have songs, we need to fetch them
        if (!store.idNamePairs || store.idNamePairs.length === 0) {
            console.log('No playlists to search');
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
        console.log('Parsed search terms:', terms);
        
        const filtered = store.idNamePairs.filter(playlist => {
            // Check if playlist has songs (for debugging)
            const hasSongs = playlist.songs && Array.isArray(playlist.songs);
            console.log(`Playlist "${playlist.name}":`, {
                name: playlist.name,
                ownerEmail: playlist.ownerEmail,
                hasSongs: hasSongs,
                songCount: hasSongs ? playlist.songs.length : 0
            });
            
            // Check each search term
            return terms.every(term => {
                // Handle prefix-based searches
                if (term.startsWith('playlist:')) {
                    const searchTerm = term.substring(9); // Remove 'playlist:'
                    const playlistName = playlist.name || '';
                    const matches = playlistName.toLowerCase().includes(searchTerm);
                    console.log(`  Checking playlist name "${playlistName}" for "${searchTerm}": ${matches}`);
                    return matches;
                }
                
                if (term.startsWith('username:')) {
                    const searchTerm = term.substring(9); // Remove 'username:'
                    const ownerEmail = playlist.ownerEmail || '';
                    const username = ownerEmail.split('@')[0] || '';
                    const matches = username.toLowerCase().includes(searchTerm);
                    console.log(`  Checking username "${username}" for "${searchTerm}": ${matches}`);
                    return matches;
                }
                
                if (term.startsWith('title:')) {
                    const searchTerm = term.substring(6); // Remove 'title:'
                    const songs = playlist.songs || [];
                    const matches = songs.some(song => 
                        song.title && song.title.toLowerCase().includes(searchTerm)
                    );
                    console.log(`  Checking song titles for "${searchTerm}": ${matches}`);
                    return matches;
                }
                
                if (term.startsWith('artist:')) {
                    const searchTerm = term.substring(7); // Remove 'artist:'
                    const songs = playlist.songs || [];
                    const matches = songs.some(song => 
                        song.artist && song.artist.toLowerCase().includes(searchTerm)
                    );
                    console.log(`  Checking song artists for "${searchTerm}": ${matches}`);
                    return matches;
                }
                
                if (term.startsWith('year:')) {
                    const searchTerm = term.substring(5); // Remove 'year:'
                    const songs = playlist.songs || [];
                    const matches = songs.some(song => 
                        String(song.year || '').includes(searchTerm)
                    );
                    console.log(`  Checking song years for "${searchTerm}": ${matches}`);
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
                
                console.log(`  General search for "${searchTerm}": ${matches}`);
                return matches;
            });
        });
        
        console.log(`Filtered ${store.idNamePairs.length} playlists to ${filtered.length} results`);
        
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

    store.loadGuestPlaylists = async function () {
        try {
            const response = await storeRequestSender.getGuestPlaylists();
            if (response.success) {
                console.log('Guest idNamePairs from server:', response.idNamePairs);
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: response.idNamePairs
                });
            } else {
                console.log('FAILED TO GET GUEST PLAYLISTS');
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
        console.log("updatePlaylistDirectly called for id:", id);
        console.log("Updated playlist data:", updatedPlaylist);
        
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
            console.log("Playlist updated successfully on server");
            
            // Refresh the playlist pairs
            await store.loadIdNamePairs();
            return true;
          } else {
            console.error("Failed to update playlist on server:", response.errorMessage);
            return false;
          }
        } catch (error) {
          console.error("Error updating playlist:", error);
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