import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import authRequestSender from './requests'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

// THESE ARE ALL THE TYPES OF UPDATES TO OUR AUTH STATE THAT CAN BE PROCESSED
export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER",
     UPDATE_USER_PROFILE: "UPDATE_USER_PROFILE"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        errorMessage: null
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: null
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    errorMessage: null
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    errorMessage: payload.errorMessage
                })
            }
            case AuthActionType.UPDATE_USER_PROFILE: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    errorMessage: payload.errorMessage
                });
            }
            default:
                return auth;
        }
    }

    auth.updateUserProfile = async function(userData) {
        try {
            console.log('Updating user profile:', userData);
            
            const data = await authRequestSender.updateUserProfile(userData);
            
            authReducer({
                type: AuthActionType.UPDATE_USER_PROFILE,
                payload: {
                    user: data.user,
                    loggedIn: true,
                    errorMessage: null
                }
            });
            
            return data;
        } catch (error) {
            console.error('Update profile error:', error);
            authReducer({
                type: AuthActionType.UPDATE_USER_PROFILE,
                payload: {
                    user: auth.user,
                    loggedIn: true,
                    errorMessage: error.message || "Update failed"
                }
            });
            throw error;
        }
    };

    auth.getLoggedIn = async function () {
        try {
            const data = await authRequestSender.getLoggedIn(); // this IS already JSON
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: data.loggedIn,
                    user: data.user
                }
            });
        } catch(err) {
            // not logged in case just reset
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: false,
                    user: null
                }
            });
        }
    }
    

    auth.registerUser = async function(userName, email, password, passwordVerify) {
        console.log("REGISTERING USER");
        try{   
            const data = await authRequestSender.registerUser(userName, email, password, passwordVerify);
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: data.user,
                    loggedIn: true,
                    errorMessage: null
                }
            });
            history.push("/login");
            auth.loginUser(email, password);

        } catch (error) {
            console.error("Register failed:", error);
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: auth.user,
                    loggedIn: false,
                    errorMessage: error.message || "Registration failed"
                }
            });
        }
    }

    auth.loginUser = async function(email, password) {
        try {
            const data = await authRequestSender.loginUser(email, password);
            // 'data' is already the parsed JSON, not wrapped like Axios
            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: data.user,
                    loggedIn: true,
                    errorMessage: null
                }
            });
            history.push("/home");
        } catch (error) {
            console.error("Login failed:", error);
            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: auth.user,
                    loggedIn: false,
                    errorMessage: error.message || "Login failed"
                }
            });
        }
    };

    auth.logoutUser = async function() {
        try {
            await authRequestSender.logoutUser(); // if no error = success
            authReducer({
                type: AuthActionType.LOGOUT_USER,
                payload: null
            });
            history.push("/");
        } catch (err) {
            console.error("logout failed", err);
        }
    }
    


    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };