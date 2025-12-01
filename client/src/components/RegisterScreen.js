import { useContext, useState } from 'react';
import AuthContext from '../auth';
import { GlobalStoreContext } from '../store';
import { Button, Box, IconButton, TextField, Typography, InputAdornment, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ClearIcon from '@mui/icons-material/Clear';

export default function RegisterScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

   
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

        // Validation
        let hasError = false;
        const newErrors = { username: '', email: '', password: '', confirmPassword: '' };

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
            hasError = true;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            hasError = true;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
            hasError = true;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            hasError = true;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            hasError = true;
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            hasError = true;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        // Register user
        auth.registerUser({
            username: formData.username,
            email: formData.email,
            password: formData.password
        }, store);
    };

    const handleHomeClick = () => {
        window.location.href = '/';
    };

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
                        py: 4,
                        px: 4,
                        minHeight: 500
                    }}
                >
                    {/* Person Add Icon */}
                    <Box sx={{ mb: 2 }}>
                        <PersonAddIcon sx={{ fontSize: 48, color: '#666' }} />
                    </Box>

                    {/* Title */}
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            color: '#333',
                            mb: 3,
                            fontWeight: 400,
                            fontFamily: 'serif'
                        }}
                    >
                        Create Account
                    </Typography>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        {/* Username Field */}
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                label="User Name"
                                value={formData.username}
                                onChange={handleInputChange('username')}
                                error={!!errors.username}
                                helperText={errors.username}
                                variant="standard"
                                autoFocus
                                InputProps={{
                                    endAdornment: formData.username && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleClearField('username')}
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

                        {/* Email Field */}
                        <Box sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                error={!!errors.email}
                                helperText={errors.email}
                                variant="standard"
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
                        <Box sx={{ mb: 2 }}>
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

                        {/* Confirm Password Field */}
                        <Box sx={{ mb: 4 }}>
                            <TextField
                                fullWidth
                                label="Password Confirm"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange('confirmPassword')}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                variant="standard"
                                InputProps={{
                                    endAdornment: formData.confirmPassword && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleClearField('confirmPassword')}
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

                        {/* Create Account Button */}
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
                                CREATE ACCOUNT
                            </Button>
                        </Box>

                        {/* Sign In Link */}
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Link 
                                to="/login/"
                                style={{ 
                                    color: '#e020a0',
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                Already have an account? Sign In
                            </Link>
                        </Box>
                    </Box>

                    {/* Copyright */}
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: '#666',
                            textAlign: 'center'
                        }}
                    >
                        Copyright © Playlister 2025
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}