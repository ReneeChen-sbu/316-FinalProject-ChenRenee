const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth-controller');
const auth = require('../auth');

// auth routes
router.get('/loggedIn', AuthController.getLoggedIn);
router.post('/register', AuthController.registerUser);
router.post('/login', AuthController.loginUser);
router.get('/logout', AuthController.logoutUser);

// update profile (must be logged in)
router.put('/update-profile', auth.requireAuth, AuthController.updateUserProfile);

module.exports = router;
