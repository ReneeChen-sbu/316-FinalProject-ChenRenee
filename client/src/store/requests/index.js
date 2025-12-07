const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

async function fetchJSON(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    console.log('DEBUG fetchJSON: requesting', url);
  
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
  
    console.log('DEBUG fetchJSON response status:', response.status);
    console.log('DEBUG fetchJSON content-type:', contentType);
    console.log('DEBUG fetchJSON raw text (first 200 chars):', text.slice(0, 200));
  
    let data = {};
    if (contentType.includes('application/json')) {
      data = text ? JSON.parse(text) : {};
    } else {
      // This is *exactly* your "<!DOCTYPE..." situation
      console.error('Expected JSON but got non-JSON response body.');
      throw new Error(
        `Server returned non-JSON response (status ${response.status}). Check URL/path.`
      );
    }
  
    if (!response.ok) {
      throw new Error(data.errorMessage || response.statusText);
    }
  
    return data;
  }
  

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
  
  export default {
    getPlaylistPairs,
    getGuestPlaylists,
    deletePlaylistById,
    getPlaylistById,
    updatePlaylistById,
    createPlaylist,
    copyPlaylist,
  };
  