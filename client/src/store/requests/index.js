const baseURL = 'http://localhost:4000/api/playlists';

async function fetchJSON(path, options = {}) {
    const fullURL = `${baseURL}${path}`;
    console.log("DEBUG fetchJSON START:");
    console.log("  Full URL:", fullURL);
    console.log("  Path:", path);
    console.log("  Options:", options);
    
    try {
        const response = await fetch(fullURL, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            ...options
        });

        console.log("DEBUG fetchJSON Response:");
        console.log("  Status:", response.status);
        console.log("  Status Text:", response.statusText);
        console.log("  OK?", response.ok);
        
        let data = null;
        try {
            const text = await response.text();
            console.log("  Raw response text:", text.substring(0, 500)); // First 500 chars
            
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
// In store/requests/index.js - getGuestPlaylists function
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
    return fetchJSON(`/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ playlist })
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
