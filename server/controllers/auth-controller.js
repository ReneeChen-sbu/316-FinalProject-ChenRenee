const auth = require('../auth');
const User = require('../models/user-model');
const Playlist = require('../models/playlist-model');
const MongoDatabaseManager = require('../db/mongodb/index');
const db = new MongoDatabaseManager();
const bcrypt = require('bcryptjs');

getLoggedIn = async (req, res) => {
    try {
        const verified = auth.verifyUser(req);
        if (!verified) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "Not logged in"
            });
        }

        const user = await db.getUserById(verified.id);

        if (!user) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "User not found"
            });
        }

        return res.status(200).json({
            loggedIn: true,
            user: {
                _id: user._id,
                userName: user.userName || user.firstName || user.email,
                email: user.email,
                avatar: user.avatar || null, // ADD THIS
                isGuest: user.isGuest || false
            }
        });

    } catch (err) {
        console.log("getLoggedIn error: " + err);
        res.status(500).json({
            loggedIn: false,
            user: null,
            errorMessage: "Server error"
        });
    }
};

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await db.getUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                });
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(
            password,
            existingUser.passwordHash || existingUser.password_hash
        );

        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                });
        }

        // LOGIN THE USER
        const token = auth.signToken({
            id: existingUser._id || existingUser.id,
            email: existingUser.email
        });
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        }).status(200).json({
            success: true,
            user: {
                userName: existingUser.userName || existingUser.firstName || existingUser.email,
                email: existingUser.email
            }
        });

    } catch (error) {
        console.error('Login error in controller:', error);
        res.status(500).json({ error: error.message });
    }
};

logoutUser = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/"
    }).status(200).json({ success: true });
};

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { userName, email, password, passwordVerify } = req.body;
        console.log("create user:", userName, email, password, passwordVerify);

        if (!userName || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }

        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                });
        }

        const existingUser = await db.getUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        // IMPORTANT: use userName, not firstName
        const savedUser = await db.createUser({
            userName,
            email,
            passwordHash
        });

        console.log("new user saved:", savedUser._id);

        const token = auth.signToken({
            id: savedUser._id || savedUser.id,
            email: savedUser.email
        });

        console.log("token:", token);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        }).status(200).json({
            success: true,
            user: {
                userName: savedUser.userName,
                email: savedUser.email
            }
        });

        console.log("token sent");

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
};

updateUserProfile = async (req, res) => {
    try {
        
        const { userName, newPassword, avatar } = req.body;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: 'Not authenticated'
            });
        }

        const updateData = {};

        // Update username if provided
        if (userName !== undefined) {
            updateData.userName = userName.trim();
            console.log('Updating username to:', updateData.userName);
        }

        // Update password if provided
        if (newPassword) {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            updateData.passwordHash = await bcrypt.hash(newPassword, salt);
            console.log('Updating password');
        }

        // Handle avatar (Base64 string)
        if (avatar !== undefined) {
            if (avatar === null || avatar === '') {
                // Clear avatar
                updateData.avatar = null;
                console.log('Clearing avatar');
            } else if (avatar.startsWith('data:image/')) {
                // It's a valid Base64 image
                updateData.avatar = avatar;
                console.log('Setting avatar (Base64 string length):', avatar.length);
            } else {
                console.log('Invalid avatar format, skipping');
            }
        }

        console.log('Final update data for DB:', updateData);

        // Update user in database using your db manager
        const updatedUser = await db.updateUser(userId, updateData);
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                errorMessage: 'User not found'
            });
        }

        console.log('User updated successfully in DB');

        // Return user data (excluding password hash)
        const userResponse = {
            _id: updatedUser._id,
            userName: updatedUser.userName,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            isGuest: updatedUser.isGuest || false
        };

        res.status(200).json({
            success: true,
            user: userResponse,
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            errorMessage: 'Failed to update profile: ' + error.message
        });
    }
};

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile
};
