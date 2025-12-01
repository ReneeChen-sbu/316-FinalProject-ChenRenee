import { useContext, useState, useRef } from 'react';
import AuthContext from '../auth';
import { Button, Box, IconButton, TextField, Typography, InputAdornment, Avatar } from '@mui/material';
import { Link, useHistory } from 'react-router-dom'; // Changed from useNavigate to useHistory
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ClearIcon from '@mui/icons-material/Clear';
import PersonIcon from '@mui/icons-material/Person';

export default function RegisterScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory(); // Changed from useNavigate to useHistory
    const profileImageInputRef = useRef(null);

    // Profile picture dimensions
    const PROFILE_WIDTH = 100;
    const PROFILE_HEIGHT = 100;

    // Form state with different field names
    const [registrationInfo, setRegistrationInfo] = useState({
        userName: '',
        emailAddress: '',
        password: '',
        confirmPassword: ''
    });

    // Profile picture state
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    // Validation messages
    const [validationMessages, setValidationMessages] = useState({
        userName: '',
        emailAddress: '',
        password: '',
        confirmPassword: '',
        profilePicture: ''
    });

    const handleFieldUpdate = (fieldName) => (event) => {
        const fieldValue = event.target.value;
        setRegistrationInfo(prev => ({
            ...prev,
            [fieldName]: fieldValue
        }));
        
        // Remove validation message when user types
        if (validationMessages[fieldName]) {
            setValidationMessages(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }

        // Run validation on the field
        checkFieldValidity(fieldName, fieldValue);
    };

    const handleFieldClear = (fieldName) => () => {
        setRegistrationInfo(prev => ({
            ...prev,
            [fieldName]: ''
        }));
        setValidationMessages(prev => ({
            ...prev,
            [fieldName]: ''
        }));
    };

    const checkFieldValidity = (fieldName, fieldValue) => {
        let message = '';

        switch (fieldName) {
            case 'userName':
                if (fieldValue && fieldValue.trim() === '') {
                    message = 'Please enter a valid user name';
                }
                break;
            case 'emailAddress':
                if (fieldValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
                    message = 'Please enter a valid email format';
                }
                break;
            case 'password':
                // Minimum 8 characters for passwords
                if (fieldValue && fieldValue.length < 8) {
                    message = 'password must be at least 8 characters';
                }
                // Also verify password confirmation if filled
                if (registrationInfo.confirmPassword && fieldValue !== registrationInfo.confirmPassword) {
                    setValidationMessages(prev => ({
                        ...prev,
                        confirmPassword: 'Passwords do not match'
                    }));
                } else if (registrationInfo.confirmPassword) {
                    setValidationMessages(prev => ({
                        ...prev,
                        confirmPassword: ''
                    }));
                }
                break;
            case 'confirmPassword':
                if (fieldValue && fieldValue !== registrationInfo.password) {
                    message = 'Passwords do not match';
                }
                break;
            default:
                break;
        }

        if (message) {
            setValidationMessages(prev => ({
                ...prev,
                [fieldName]: message
            }));
        }
    };

    const handleProfileSelection = () => {
        profileImageInputRef.current?.click();
    };

    const handleProfileImageUpdate = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            // Verify it's an image file
            if (!selectedFile.type.startsWith('image/')) {
                setValidationMessages(prev => ({
                    ...prev,
                    profilePicture: 'Please choose an image file'
                }));
                return;
            }

            // Create image to verify dimensions
            const imageElement = new Image();
            const fileReader = new FileReader();

            fileReader.onload = (readEvent) => {
                imageElement.onload = () => {
                    // Check specific dimensions
                    if (imageElement.width !== PROFILE_WIDTH || imageElement.height !== PROFILE_HEIGHT) {
                        setValidationMessages(prev => ({
                            ...prev,
                            profilePicture: `Image must be precisely ${PROFILE_WIDTH}x${PROFILE_HEIGHT} pixels`
                        }));
                        return;
                    }

                    // Valid image - store as base64
                    setProfilePicture(readEvent.target.result);
                    setProfilePreview(readEvent.target.result);
                    setValidationMessages(prev => ({
                        ...prev,
                        profilePicture: ''
                    }));
                };
                imageElement.src = readEvent.target.result;
            };

            fileReader.readAsDataURL(selectedFile);
        }
    };

    // Check if all registration requirements are met
    const canRegister = () => {
        // All required fields must have content
        if (!registrationInfo.userName.trim() || !registrationInfo.emailAddress || 
            !registrationInfo.password || !registrationInfo.confirmPassword) {
            return false;
        }

        // No validation messages should exist
        if (Object.values(validationMessages).some(msg => msg !== '')) {
            return false;
        }

        // Passwords must meet length requirement
        if (registrationInfo.password.length < 8) {
            return false;
        }

        // Both passwords must match
        if (registrationInfo.password !== registrationInfo.confirmPassword) {
            return false;
        }

        return true;
    };

    const handleRegistrationSubmit = async (event) => {
        event.preventDefault();

        if (!canRegister()) {
            return;
        }

        // Process registration
        const registrationResult = await auth.createNewAccount(
            registrationInfo.userName.trim(),
            registrationInfo.emailAddress,
            registrationInfo.password,
            registrationInfo.confirmPassword,
            profilePicture
        );

        if (registrationResult.successful) {
            // Redirect to login after successful registration
            history.push('/login/'); // Changed from navigate to history.push
        } else {
            // Display registration error
            if (registrationResult.errorMessage) {
                if (registrationResult.errorMessage.includes('email')) {
                    setValidationMessages(prev => ({
                        ...prev,
                        emailAddress: registrationResult.errorMessage
                    }));
                } else {
                    // Error shown on email field
                    setValidationMessages(prev => ({
                        ...prev,
                        emailAddress: registrationResult.errorMessage
                    }));
                }
            }
        }
    };

    const handleReturnHome = () => {
        history.push('/'); // Changed from navigate to history.push
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
                    maxWidth: 500,
                    backgroundColor: '#f8e0f0',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3
                }}
            >
                {/* Header Bar: Magenta */}
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
                        onClick={handleReturnHome}
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

                {/* Content Area: Cream/Beige */}
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
                    <Box component="form" onSubmit={handleRegistrationSubmit} sx={{ width: '100%' }}>
                        {/* Profile Picture + User Name Row */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                            {/* Profile Picture Selector */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar
                                    src={profilePreview}
                                    sx={{ 
                                        width: 56, 
                                        height: 56, 
                                        backgroundColor: '#ddd',
                                        mb: 0.5
                                    }}
                                >
                                    {!profilePreview && <PersonIcon />}
                                </Avatar>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleProfileSelection}
                                    sx={{ 
                                        fontSize: '0.7rem',
                                        py: 0.25,
                                        px: 1,
                                        minWidth: 'auto',
                                        color: '#333',
                                        borderColor: '#333',
                                        borderRadius: 1
                                    }}
                                >
                                    Select
                                </Button>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        mt: 0.5, 
                                        color: '#666',
                                        textAlign: 'center',
                                        fontSize: '0.65rem'
                                    }}
                                >
                                    {PROFILE_WIDTH}x{PROFILE_HEIGHT}px
                                </Typography>
                                <input
                                    type="file"
                                    ref={profileImageInputRef}
                                    onChange={handleProfileImageUpdate}
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                />
                                {validationMessages.profilePicture && (
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            mt: 0.5, 
                                            textAlign: 'center', 
                                            maxWidth: 80,
                                            color: '#d32f2f'
                                        }}
                                    >
                                        {validationMessages.profilePicture}
                                    </Typography>
                                )}
                            </Box>

                            {/* User Name Field */}
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    fullWidth
                                    label="User Name"
                                    value={registrationInfo.userName}
                                    onChange={handleFieldUpdate('userName')}
                                    error={!!validationMessages.userName}
                                    helperText={validationMessages.userName}
                                    variant="standard"
                                    InputProps={{
                                        endAdornment: registrationInfo.userName && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={handleFieldClear('userName')}
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
                        </Box>

                        {/* Email Address Field */}
                        <Box sx={{ mb: 2, ml: 9 }}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={registrationInfo.emailAddress}
                                onChange={handleFieldUpdate('emailAddress')}
                                error={!!validationMessages.emailAddress}
                                helperText={validationMessages.emailAddress}
                                variant="standard"
                                InputProps={{
                                    endAdornment: registrationInfo.emailAddress && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleFieldClear('emailAddress')}
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

                        {/* Password Key Field */}
                        <Box sx={{ mb: 2, ml: 9 }}>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                value={registrationInfo.password}
                                onChange={handleFieldUpdate('password')}
                                error={!!validationMessages.password}
                                helperText={validationMessages.password || 'Minimum 8 characters'}
                                variant="standard"
                                InputProps={{
                                    endAdornment: registrationInfo.password && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleFieldClear('password')}
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
                        <Box sx={{ mb: 3, ml: 9 }}>
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                value={registrationInfo.confirmPassword}
                                onChange={handleFieldUpdate('confirmPassword')}
                                error={!!validationMessages.confirmPassword}
                                helperText={validationMessages.confirmPassword}
                                variant="standard"
                                InputProps={{
                                    endAdornment: registrationInfo.confirmPassword && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                onClick={handleFieldClear('confirmPassword')}
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
                                disabled={!canRegister()}
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
                                    },
                                    '&:disabled': {
                                        backgroundColor: '#ccc',
                                        color: '#888'
                                    }
                                }}
                            >
                                Create Account
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