const baseURL = 'http://localhost:4000/api/playlists';

async function fetchJSON(path, options = {}) {
    const fullURL = `${baseURL}${path}`;
    console.log("DEBUG fetchJSON START:");
    console.log("  Full URL:", fullURL);
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log("  Token exists?", !!token);
    if (token) {
        console.log("  Token length:", token.length);
        console.log("  Token (first 20 chars):", token.substring(0, 20) + "...");
    }
    
    // Prepare headers
    const headers = {
        'Content-Type': 'application/json'
    };
    
    // Add Authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log("  Adding Authorization header with token");
    }
    
    try {
        const response = await fetch(fullURL, {
            credentials: 'include',
            headers: headers,
            ...options
        });

        console.log("DEBUG fetchJSON Response:");
        console.log("  Status:", response.status);
        console.log("  Status Text:", response.statusText);
        console.log("  Headers:", Object.fromEntries(response.headers.entries()));
        
        let data = null;
        try {
            const text = await response.text();
            console.log("  Raw response text:", text.substring(0, 500));
            
            if (text) {
                data = JSON.parse(text);
                console.log("  Parsed JSON:", data);
            } else {
                console.log("  Empty response body");
                data = {};
            }
        } catch (jsonErr) {
            console.error("  Failed to parse JSON:", jsonErr);
            data = {};
        }

        if (!response.ok) {
            const errorMsg = data.errorMessage || data.error || 'Request failed';
            console.error("DEBUG fetchJSON Error:", errorMsg);
            throw new Error(errorMsg);
        }
        
        console.log("DEBUG fetchJSON Success");
        return data;
    } catch (error) {
        console.error("DEBUG fetchJSON Catch block error:", error);
        throw error;
    }
}

// CREATE playlist
export function createPlaylist(newListName, newSongs, userEmail) {
    return fetchJSON('/', {
        method: 'POST',
        body: JSON.stringify({
            name: newListName,
            songs: newSongs || [],
            ownerEmail: userEmail
        })
    });
}

// DELETE playlist
export function deletePlaylistById(id) {
    return fetchJSON(`/${id}`, {
        method: 'DELETE'
    });
}

// GET playlist by id
export function getPlaylistById(id) {
    return fetchJSON(`/${id}`, {
        method: 'GET'
    });
}

// GET id–name pairs for logged-in user
export function getPlaylistPairs() {
    return fetchJSON('/pairs', {
        method: 'GET'
    });
}

// GET – guest/public playlists
export function getGuestPlaylists() {
    console.log("DEBUG getGuestPlaylists called");
    console.log("  Base URL:", baseURL);
    console.log("  Full endpoint:", `${baseURL}/guest`);
    
    return fetchJSON('/guest', {
        method: 'GET'
    });
}

// UPDATE playlist
export function updatePlaylistById(id, playlist) {
    console.log("DEBUG: updatePlaylistById called with id:", id);
    console.log("DEBUG: Original playlist data:", playlist);
    
    // Create a clean copy with proper songs array
    const playlistToSend = {
        ...playlist,
        songs: playlist.songs || []
    };
    
    // Make sure songs is not a string
    if (typeof playlistToSend.songs === 'string') {
        try {
            playlistToSend.songs = JSON.parse(playlistToSend.songs);
        } catch (e) {
            console.error("Failed to parse songs string:", e);
            playlistToSend.songs = [];
        }
    }
    
    console.log("DEBUG: Sending playlist data:", playlistToSend);
    console.log("DEBUG: songs type:", typeof playlistToSend.songs);
    console.log("DEBUG: songs is array?", Array.isArray(playlistToSend.songs));
    
    return fetchJSON(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify(playlistToSend)
    });
}

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    getGuestPlaylists,
    updatePlaylistById
};

export default apis;
