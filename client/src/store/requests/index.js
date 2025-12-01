/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/


// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES
// client/src/store/requests/index.js

const baseURL = 'http://localhost:4000/api/store';

//helper:
async function fetchJSON(path, options = {}) {
    const response = await fetch(`${baseURL}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    let data = null;
    try {
        data = await response.json();
     } catch (err) {
        // server returned no body
        data = {};
     }
     if (!response.ok) throw new Error(data.error || 'Request failed');
     return data;
}

//requests

export function createPlaylist(newListName, newSongs, userEmail) {
    return fetchJSON(`/playlist`, {
        method: 'POST',
        body: JSON.stringify({
            name: newListName,
            songs: newSongs,
            ownerEmail: userEmail
        })
    });
}

export function deletePlaylistById(id) {
    return fetchJSON(`/playlist/${id}`, {
        method: 'DELETE'
    });
}

export function getPlaylistById(id) {
    return fetchJSON(`/playlist/${id}`, {
        method: 'GET'
    });
}

export function getPlaylistPairs() {
    return fetchJSON(`/playlistpairs`, {
        method: 'GET'
    });
}

export function updatePlaylistById(id, playlist) {
    return fetchJSON(`/playlist/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ playlist })
    });
}

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
};
export default apis;
