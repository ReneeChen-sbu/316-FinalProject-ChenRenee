import { useContext, useState, useEffect } from 'react';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';
import { Button, Box, IconButton, TextField, Typography, InputAdornment, Modal } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ClearIcon from '@mui/icons-material/Clear';


export default function LoginScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (auth.errorMessage && !showErrorModal) {
            setErrorMessage(auth.errorMessage);
            setShowErrorModal(true);
        }
    }, [auth.errorMessage, showErrorModal]);

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleClearField = (field) => () => {
        setFormData(prev => ({
            ...prev,
            [field]: ''
        }));
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!formData.email || !formData.password) {
            if (!formData.email) {
                setErrors(prev => ({ ...prev, email: 'Email is required' }));
            }
            if (!formData.password) {
                setErrors(prev => ({ ...prev, password: 'Password is required' }));
            }
            return;
        }

        auth.loginUser(formData.email, formData.password);

    };

    const handleHomeClick = () => {
        window.location.href = '/';
    };

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
        setErrorMessage('');
    };

    if (auth.errorMessage && !showErrorModal) {
        setErrorMessage(auth.errorMessage);
        setShowErrorModal(true);
    }

    return (
        <Box 
            sx={{
                width: '100%',
                height: '100vh',
                backgroundColor: '#f8e0f0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 4
            }}
        >
            {/* Main Container */}
            <Box 
                sx={{
                    width: '100%',
                    maxWidth: 450,
                    backgroundColor: '#f8e0f0',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3
                }}
            >
                {/* Header Bar - Magenta */}
                <Box 
                    sx={{
                        backgroundColor: '#e020a0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        py: 1
                    }}
                >
                    <IconButton 
                        onClick={handleHomeClick}
                        sx={{ 
                            color: 'white', 
                            backgroundColor: 'rgba(255,255,255,0.2)', 
                            borderRadius: '50%' 
                        }}
                    >
                        <HomeIcon />
                    </IconButton>
                    <IconButton sx={{ color: 'white' }}>
                        <AccountCircleIcon fontSize="large" />
                    </IconButton>
                </Box>

                {/* Content Area - Cream/Beige */}
                <Box 
                    sx={{
                        backgroundColor: '#f5f5dc',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 6,
                        px: 4,
                        minHeight: 400
                    }}
                >
                    {/* Lock Icon */}
                    <Box sx={{ mb: 2 }}>
                        <LockOutlinedIcon sx={{ fontSize: 48, color: '#666' }} />
                    </Box>

                    {/* Title */}
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            color: '#333',
                            mb: 4,
                            fontWeight: 400,
                            fontFamily: 'serif'
                        }}
                    >
                        Sign In
                    </Typography>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        {/* Email Field */}
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                error={!!errors.email}
                                helperText={errors.email}
                                variant="standard"
                                autoFocus
                                InputProps={{
                                    endAdornment: formData.email && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleClearField('email')}
                                                sx={{ 
                                                    backgroundColor: '#999',
                                                    color: 'white',
                                                    width: 20,
                                                    height: 20,
                                                    '&:hover': { backgroundColor: '#777' }
                                                }}
                                            >
                                                <ClearIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        {/* Password Field */}
                        <Box sx={{ mb: 4 }}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                error={!!errors.password}
                                helperText={errors.password}
                                variant="standard"
                                InputProps={{
                                    endAdornment: formData.password && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleClearField('password')}
                                                sx={{ 
                                                    backgroundColor: '#999',
                                                    color: 'white',
                                                    width: 20,
                                                    height: 20,
                                                    '&:hover': { backgroundColor: '#777' }
                                                }}
                                            >
                                                <ClearIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>

                        {/* Sign In Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                            <Button
                                type="submit"
                    
                                variant="contained"
                                sx={{ 
                                    backgroundColor: '#333',
                                    color: 'white',
                                    textTransform: 'none',
                                    px: 6,
                                    py: 1,
                                    fontSize: '1rem',
                                    borderRadius: 1,
                                    '&:hover': {
                                        backgroundColor: '#555'
                                    }
                                }}
                            >
                                SIGN IN
                            </Button>
                        </Box>

                        {/* Sign Up Link */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Link 
                                to="/register/"
                                style={{ 
                                    color: '#e020a0',
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                Don't have an account? Sign Up
                            </Link>
                        </Box>
                    </Box>

                    {/* Copyright */}
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            mt: 4, 
                            color: '#666',
                            textAlign: 'center'
                        }}
                    >
                        Copyright © Playlister 2025
                    </Typography>
                </Box>
            </Box>

            {/* Error Modal */}
            <Modal
                open={showErrorModal}
                onClose={handleCloseErrorModal}
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 350,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 0,
                    overflow: 'hidden'
                }}>
                    {/* Modal Header */}
                    <Box sx={{ 
                        backgroundColor: '#f44336', 
                        color: 'white', 
                        p: 2 
                    }}>
                        <Typography variant="h6">
                            Login Failed
                        </Typography>
                    </Box>
                    
                    {/* Modal Content */}
                    <Box sx={{ p: 3 }}>
                        <Typography sx={{ mb: 3 }}>
                            {errorMessage || 'Wrong email or password provided.'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                onClick={handleCloseErrorModal}
                                variant="contained"
                                sx={{
                                    backgroundColor: '#333',
                                    color: 'white',
                                    '&:hover': { backgroundColor: '#555' }
                                }}
                            >
                                OK
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}