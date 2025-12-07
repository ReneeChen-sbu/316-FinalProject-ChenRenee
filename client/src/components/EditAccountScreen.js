import { useContext, useState, useEffect, useRef } from 'react';
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
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        newPassword: '',
        passwordConfirm: ''
    });
    
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarBase64, setAvatarBase64] = useState(null); // Store as Base64
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (auth.user) {
            console.log('User data for editing:', auth.user);
    
            setFormData(prev => ({
                ...prev,
                userName: auth.user.userName || '',  
                email: auth.user.email || '',
                newPassword: '',
                passwordConfirm: ''
            }));

            // Set initial avatar if user has one
            if (auth.user.avatar) {
                setAvatarPreview(auth.user.avatar);
                setAvatarBase64(auth.user.avatar);
            } else if (auth.user.avatarUrl) {
                // If using URL instead of Base64
                setAvatarPreview(auth.user.avatarUrl);
            }
        }
    }, [auth.user]);

    // Convert file to Base64
    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleAvatarSelect = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (max 2MB for Base64 storage)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            alert('Image file size must be less than 2MB for Base64 storage');
            return;
        }

        try {
            // Convert file to Base64
            const base64 = await convertToBase64(file);
            
            // Store Base64 string
            setAvatarBase64(base64);
            
            // Use Base64 string directly for preview
            setAvatarPreview(base64);
            
            console.log('Image converted to Base64, length:', base64.length);
            
        } catch (error) {
            console.error('Error converting image to Base64:', error);
            alert('Failed to process image. Please try another image.');
        }
    };

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
        
        if (!formData.userName.trim()) {
            newErrors.userName = 'User name is required';
        }
        
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
            };
    
            if (formData.newPassword) {
                updateData.newPassword = formData.newPassword;
            }

            // Send avatar as Base64 string
            if (avatarBase64) {
                updateData.avatar = avatarBase64;
                console.log('Sending Base64 avatar, length:', avatarBase64.length);
            }
    
            console.log('Sending update data:', { 
                ...updateData, 
                avatar: avatarBase64 ? `Base64 string (${avatarBase64.length} chars)` : 'none' 
            });
            
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
            {/* Header Bar */}
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
                    src={avatarPreview}
                    sx={{ 
                        width: 40, 
                        height: 40,
                        backgroundColor: avatarPreview ? 'transparent' : '#ffd700',
                        border: '2px solid white'
                    }}
                >
                    {!avatarPreview && <AccountCircleIcon />}
                </Avatar>
            </Box>

            {/* Content Area */}
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
                    {/* Hidden file input */}
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    {/* Avatar Section */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
                        <Avatar 
                            src={avatarPreview}
                            sx={{ 
                                width: 60, 
                                height: 60,
                                backgroundColor: avatarPreview ? 'transparent' : '#ffd700',
                                mb: 1,
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8
                                }
                            }}
                            onClick={handleAvatarSelect}
                        >
                            {!avatarPreview && <AccountCircleIcon sx={{ fontSize: 40 }} />}
                        </Avatar>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleAvatarSelect}
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

                        {/* Email Field - DISABLED */}
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            disabled
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
