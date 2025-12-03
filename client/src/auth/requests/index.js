/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    use AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

//using fetch
const baseURL = 'http://localhost:4000/auth';

// Helper function for Fetch with JSON and credentials
async function fetchJSON(path, options = {}) {
    const response = await fetch(`${baseURL}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
}



// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

//api requests
export function getLoggedIn () {
    return fetchJSON('/loggedIn', { method: 'GET' });

}

export function loginUser(email, password) {
    return fetchJSON('/login', {
        method: 'POST',
        body: JSON.stringify({email, password})
    });
}

export async function logoutUser() {
    const response = await fetch(`${baseURL}/logout/`, {
        method: 'GET',
        credentials: 'include'
    });
    return { success: true };
}

export function registerUser(firstName, lastName, email, password, passwordVerify) {
    return fetchJSON('/register', {
        method: 'POST',
        body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            passwordVerify
        })
    });
}

export function updateUserProfile(userData) {
    return fetchJSON('/update-profile', {  
        method: 'PUT',
        body: JSON.stringify(userData)
    });
}


const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile 
}

export default apis
