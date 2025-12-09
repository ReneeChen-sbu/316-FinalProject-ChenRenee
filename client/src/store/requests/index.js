const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

async function fetchJSON(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';

    let data = {};
    if (contentType.includes('application/json')) {
        data = text ? JSON.parse(text) : {};
    } else {
        throw new Error(
            `Server returned non-JSON response (status ${response.status}). Check URL/path.`
        );
    }

    if (!response.ok) {
        throw new Error(data.errorMessage || response.statusText);
    }

    return data;
}

// Existing playlist functions
async function getPlaylistPairs() {
    return fetchJSON('/api/playlists/pairs', {
        method: 'GET',
    });
}

async function getGuestPlaylists() {
    return fetchJSON('/api/playlists/guest', {
        method: 'GET',
    });
}

async function deletePlaylistById(id) {
    return fetchJSON(`/api/playlists/${id}`, {
        method: 'DELETE',
    });
}

async function getPlaylistById(id) {
    return fetchJSON(`/api/playlists/${id}`, {
        method: 'GET',
    });
}

async function updatePlaylistById(id, playlist) {
    return fetchJSON(`/api/playlists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(playlist),
    });
}

async function createPlaylist(name, songs = []) {
    return fetchJSON('/api/playlists', {
        method: 'POST',
        body: JSON.stringify({ name, songs }),
    });
}

async function copyPlaylist(playlistId) {
    return fetchJSON(`/api/playlists/${playlistId}/copy`, {
        method: 'POST',
    });
}



async function incrementPlaylistListenerCount(playlistId) {
   return fetchJSON(`/api/playlists/${playlistId}/listen`, {
   method: 'POST',
    });
}


async function incrementSongListenCount(songId) {
   return fetchJSON(`/api/songs/${songId}/listen`, {
     method: 'POST',
 });
}
   


async function getAllSongs() {
    return fetchJSON('/api/songs', {
        method: 'GET',
    });
}

async function searchSongs(query) {
    return fetchJSON(`/api/songs/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
    });
}

async function createSong(songData) {
    return fetchJSON('/api/songs', {
        method: 'POST',
        body: JSON.stringify(songData),
    });
}

async function updateSong(songId, songData) {
    return fetchJSON(`/api/songs/${songId}`, {
        method: 'PUT',
        body: JSON.stringify(songData),
    });
}

async function deleteSong(songId) {
    return fetchJSON(`/api/songs/${songId}`, {
        method: 'DELETE',
    });
}

// Add song to playlist
async function addSongToPlaylist(playlistId, songId) {
    return fetchJSON(`/api/playlists/${playlistId}/songs/${songId}`, {
        method: 'POST',
    });
}


// Remove song from playlist
async function removeSongFromPlaylist(playlistId, songId) {
    return fetchJSON(`/api/playlists/${playlistId}/songs/${songId}`, {
        method: 'DELETE',
    });
}

export default {
    getPlaylistPairs,
    getGuestPlaylists,
    deletePlaylistById,
    getPlaylistById,
    updatePlaylistById,
    createPlaylist,
    copyPlaylist,
    incrementPlaylistListenerCount,
    incrementSongListenCount,
    getAllSongs,
    searchSongs,
    createSong,
    updateSong,
    deleteSong,
    addSongToPlaylist,
    removeSongFromPlaylist
};