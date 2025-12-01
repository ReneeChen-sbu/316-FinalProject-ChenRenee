import './App.css';
import { React } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { AuthContextProvider } from './auth';
import { GlobalStoreContextProvider } from './store'
import {
    AppBanner,
    HomeWrapper,
    LoginScreen,
    RegisterScreen,
    Statusbar,
    WorkspaceScreen,
    SplashScreen
} from './components'

const App = () => {   
    return (
        <BrowserRouter>
            <AuthContextProvider>
                <GlobalStoreContextProvider>              
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
                </GlobalStoreContextProvider>
            </AuthContextProvider>
        </BrowserRouter>
    )
}

export default App