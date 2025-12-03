import { useContext, useState, useEffect } from 'react';
import AuthContext from '../auth';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    IconButton, 
    InputAdornment,
    Avatar
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CancelIcon from '@mui/icons-material/Cancel';

export default function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        newPassword: '',
        passwordConfirm: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (auth.user) {
            console.log('User data for editing:', auth.user);
    
            setFormData(prev => ({
                ...prev,
                userName: auth.user.userName || '',  
                email: auth.user.email || '',
                newPassword: '', // Clear password fields
                passwordConfirm: ''
            }));
        }
    }, [auth.user]);

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
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const newErrors = {};
        
        // User name validation
        if (!formData.userName.trim()) {
            newErrors.userName = 'User name is required';
        }
        
        // Password validation (only if trying to change password)
        if (formData.newPassword || formData.passwordConfirm) {
            if (formData.newPassword && formData.newPassword.length < 8) {
                newErrors.newPassword = 'Password must be at least 8 characters';
            }
            
            if (formData.newPassword !== formData.passwordConfirm) {
                newErrors.passwordConfirm = 'Passwords do not match';
            }
        }
    
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    
        try {
            const updateData = {
                userName: formData.userName.trim()
                // Email is NOT sent (cannot be changed per requirements)
            };
    
            // Only include new password if provided
            if (formData.newPassword) {
                updateData.newPassword = formData.newPassword;
            }
    
            console.log('Sending update data:', updateData);
            await auth.updateUserProfile(updateData);
            history.push('/home');
    
        } catch (error) {
            console.error('Update error:', error);
            const errorMessage = error.message || 'Update failed. Please try again.';
            alert(`Update failed: ${errorMessage}`);
        }
    };
    
    const handleHomeClick = () => {
        history.push('/home');
    };

    const handleCancel = () => {
        history.push('/home');
    };

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            backgroundColor: '#d8d0e0',
            borderRadius: 1,
            '& fieldset': { border: 'none' },
        },
        '& .MuiInputLabel-root': {
            color: '#666',
        }
    };

    return (
        <Box 
            sx={{
                width: '100%',
                minHeight: '100vh',
                backgroundColor: '#f8e0f0',
                display: 'flex',
                flexDirection: 'column'
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
                        color: 'black', 
                        backgroundColor: 'white', 
                        borderRadius: '50%',
                        '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                >
                    <HomeIcon />
                </IconButton>
                <Avatar 
                    sx={{ 
                        width: 40, 
                        height: 40,
                        backgroundColor: '#ffd700',
                        border: '2px solid white'
                    }}
                >
                    <AccountCircleIcon />
                </Avatar>
            </Box>

            {/* Content Area - Cream/Beige */}
            <Box 
                sx={{
                    flex: 1,
                    backgroundColor: '#f5f5dc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 6,
                    px: 4
                }}
            >
                {/* Lock Icon */}
                <Box sx={{ mb: 1 }}>
                    <LockOutlinedIcon sx={{ fontSize: 48, color: '#333' }} />
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
                    Edit Account
                </Typography>

                {/* Form with Avatar */}
                <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    sx={{ 
                        width: '100%', 
                        maxWidth: 600,
                        display: 'flex',
                        gap: 3
                    }}
                >
                    {/* Avatar Section */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
                        <Avatar 
                            sx={{ 
                                width: 60, 
                                height: 60,
                                backgroundColor: '#ffd700',
                                mb: 1
                            }}
                        >
                            <AccountCircleIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Button
                            variant="contained"
                            size="small"
                            sx={{
                                backgroundColor: '#333',
                                color: 'white',
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                px: 2,
                                py: 0.5,
                                minWidth: 'auto',
                                '&:hover': { backgroundColor: '#555' }
                            }}
                        >
                            Select
                        </Button>
                    </Box>

                    {/* Form Fields */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* User Name Field */}
                        <TextField
                            fullWidth
                            label="User Name"
                            value={formData.userName}
                            onChange={handleInputChange('userName')}
                            error={!!errors.userName}
                            helperText={errors.userName}
                            variant="outlined"
                            size="small"
                            sx={textFieldStyle}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearField('userName')}
                                            sx={{ color: '#666' }}
                                        >
                                            <CancelIcon sx={{ fontSize: 20 }} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {/* Email Field - DISABLED (cannot be changed) */}
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            disabled // Disable email field
                            variant="outlined"
                            size="small"
                            sx={{
                                ...textFieldStyle,
                                '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: '#666',
                                }
                            }}
                            helperText="Email cannot be changed"
                        />

                        {/* New Password Field */}
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange('newPassword')}
                            error={!!errors.newPassword}
                            helperText={errors.newPassword || 'Leave blank to keep current password'}
                            variant="outlined"
                            size="small"
                            sx={textFieldStyle}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearField('newPassword')}
                                            sx={{ color: '#666' }}
                                        >
                                            <CancelIcon sx={{ fontSize: 20 }} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    
                        {/* Confirm Password Field */}
                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type="password"
                            value={formData.passwordConfirm}
                            onChange={handleInputChange('passwordConfirm')}
                            error={!!errors.passwordConfirm}
                            helperText={errors.passwordConfirm}
                            variant="outlined"
                            size="small"
                            sx={textFieldStyle}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearField('passwordConfirm')}
                                            sx={{ color: '#666' }}
                                        >
                                            <CancelIcon sx={{ fontSize: 20 }} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {/* Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{ 
                                    flex: 1,
                                    backgroundColor: '#333',
                                    color: 'white',
                                    textTransform: 'none',
                                    py: 1,
                                    fontSize: '1rem',
                                    borderRadius: 1,
                                    '&:hover': { backgroundColor: '#555' }
                                }}
                            >
                                Complete
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleCancel}
                                sx={{ 
                                    flex: 1,
                                    backgroundColor: '#333',
                                    color: 'white',
                                    textTransform: 'none',
                                    py: 1,
                                    fontSize: '1rem',
                                    borderRadius: 1,
                                    '&:hover': { backgroundColor: '#555' }
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Copyright */}
                <Typography 
                    variant="body2" 
                    sx={{ 
                        mt: 'auto',
                        pt: 4,
                        color: '#666',
                        textAlign: 'center'
                    }}
                >
                    Copyright © Playlister 2025
                </Typography>
            </Box>
        </Box>
    );
}

