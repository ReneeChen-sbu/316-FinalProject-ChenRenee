import { Button } from "@mui/material";
import { maxHeight } from "@mui/system";
import { useContext, useState } from 'react';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store'
import HomeScreen from './HomeScreen'

export default function SplashScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [GuestState,setGuestState] = useState(false);

    const handleRegisterButton = () =>{
        window.location.href += 'register'
    }

    const handleLoginButton = () =>{
        window.location.href += 'login'
    }

    const handleGuestButton = () =>{
        setGuestState(true)
    }

   if(GuestState == false)
   {
    return (
        <div id="splash-screen">
            <div style={{fontSize:80,textAlign:"center",marginBottom:'10%'}}>
                The Playlister
            </div>
            <div>
                <div style={{fontSize:40,textAlign:'center'}} id = "splash-bottom">
                    
                </div>
            </div>
            <div id= "splash-button-style">
                <Button style={{right:'3%',fontSize:'25px',borderRadius:'10px', backgroundColor: "#000000"}} onClick = {handleRegisterButton}>
                Continue as the Guest
                </Button>

                <Button style={{right:'0%',fontSize:'25px',borderRadius:'10px', backgroundColor: "#000000"}} onClick = {handleLoginButton}>
                    Login
                </Button>

                <Button style={{left:'3%',fontSize:'25px',borderRadius:'10px', backgroundColor: "#000000"}} onClick = {handleGuestButton}>
                    Create Account
                </Button>
            </div>
           
        </div>
    )
   }else{
        auth.loggedIn = true
        return <HomeScreen />
   }
}