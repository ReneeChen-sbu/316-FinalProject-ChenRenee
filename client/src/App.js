import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Switch, useLocation } from 'react-router-dom'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'

// Import ONLY the components you actually use in App.js
import AppBanner from './components/AppBanner';
import HomeWrapper from './components/HomeWrapper';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import Statusbar from './components/Statusbar';
import WorkspaceScreen from './components/WorkspaceScreen';
import SplashScreen from './components/SplashScreen';
import EditAccountScreen from './components/EditAccountScreen';

// Create a wrapper component that uses useLocation
function AppContent() {
    const location = useLocation();
    console.log('Current location:', location.pathname);
    
    return (
        <Switch>
            {/* Routes WITHOUT AppBanner and Statusbar */}
            <Route path="/" exact>
                <SplashScreen />
            </Route>
            <Route path="/login/" exact>
                <LoginScreen />
            </Route>
            <Route path="/register/" exact>
                <RegisterScreen />
            </Route>
            <Route path="/edit-account" exact>
                <EditAccountScreen />
            </Route>
            
            {/* Routes WITH AppBanner and Statusbar */}
            <Route path="/home" exact>
                <AppBanner />
                <HomeWrapper />
                <Statusbar />
            </Route>
            <Route path="/playlist/:id" exact>
                <AppBanner />
                <WorkspaceScreen />
                <Statusbar />
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

export default App