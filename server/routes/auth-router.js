const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth-controller')
const auth = require('../auth')



router.post('/register', AuthController.registerUser)
router.post('/login', AuthController.loginUser)
router.get('/logout', AuthController.logoutUser)
router.get('/loggedIn', AuthController.getLoggedIn)
router.put('/update-profile', auth.verify, AuthController.updateUserProfile) 

router.get('/test-update', (req, res) => {
    console.log('Test update route hit!');
    res.json({ 
        success: true, 
        message: 'Update route test works!' 
    });
});

router.get('/test-route', (req, res) => {
    console.log('Test route hit!');
    res.json({ message: 'Test route works!' });
});

module.exports = router