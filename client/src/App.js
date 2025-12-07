import './App.css';
import { React, useContext } from 'react'  // ADD useContext import
import { BrowserRouter, Route, Switch, useLocation } from 'react-router-dom'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'

// Import components
import AppBanner from './components/AppBanner';
import HomeScreen from './components/HomeScreen';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import WorkspaceScreen from './components/WorkspaceScreen';
import SplashScreen from './components/SplashScreen';
import EditAccountScreen from './components/EditAccountScreen';


import AuthContext from './auth';

function AppContent() {
    const location = useLocation();
    const { auth } = useContext(AuthContext);

    
    
    return (
        <Switch>
            {/* Public routes */}
            <Route path="/" exact>
                <SplashScreen showFullScreen={true} />  
            </Route>
            <Route path="/login/" exact>
                <LoginScreen />
            </Route>
            <Route path="/register/" exact>
                <RegisterScreen />
            </Route>
            
            {/* Protected routes - require login */}
            <Route path="/home" exact>
                {auth.loggedIn ? (
                    <>
                        <AppBanner />
                        <HomeScreen />
                    </>
                ) : (
                    <SplashScreen showFullScreen={false} />  
                )}
            </Route>
            
            <Route path="/edit-account" exact>
                {auth.loggedIn ? (
                    <EditAccountScreen />
                ) : (
                    <SplashScreen showFullScreen={false} /> 
                )}
            </Route>
        </Switch>
    );
}

const App = () => {   
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <GlobalStoreContextProvider>              
                    <AppContent />
                </GlobalStoreContextProvider>
            </AuthContextProvider>
        </BrowserRouter>
    )
}

export default App;