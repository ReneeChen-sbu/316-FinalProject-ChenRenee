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

        return res.status(200).json({
            loggedIn: true,
            user: {
                // canonical display name
                userName: user.userName || user.firstName || user.email,
                email: user.email
            }
        });

    } catch (err) {
        console.log("err: " + err);
        res.status(500).json(false);
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
        console.log('UPDATE PROFILE ROUTE HIT - UPDATING DATABASE');
        const { userName, email, currentPassword, newPassword } = req.body;
        const userId = req.userId;

        console.log('User ID:', userId);
        console.log('Request body:', req.body);

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                errorMessage: 'User not found'
            });
        }

        // Update display name
        if (userName !== undefined && userName !== user.userName) {
            console.log(`Updating userName from "${user.userName}" to "${userName}"`);
            user.userName = userName;
        }

        // Update email (if changed)
        if (email && email !== user.email) {
            console.log(`Checking if email "${email}" is available...`);
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId.toString()) {
                return res.status(400).json({
                    success: false,
                    errorMessage: 'Email already in use'
                });
            }
            console.log(`Email available, updating from "${user.email}" to "${email}"`);
            user.email = email;
        }

        // Update password (if requested)
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    errorMessage: 'Current password is required to change password'
                });
            }

            console.log('Verifying current password...');
            const passwordCorrect = await bcrypt.compare(
                currentPassword,
                user.passwordHash
            );

            if (!passwordCorrect) {
                return res.status(400).json({
                    success: false,
                    errorMessage: 'Current password is incorrect'
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    errorMessage: 'New password must be at least 8 characters'
                });
            }

            console.log('Hashing new password...');
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            user.passwordHash = await bcrypt.hash(newPassword, salt);
        }

        user.updatedAt = new Date();
        console.log('Saving user to database...');
        await user.save();

        console.log('User saved. New data:', {
            userName: user.userName,
            email: user.email,
            updatedAt: user.updatedAt
        });

        res.json({
            success: true,
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email
            },
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            errorMessage: 'Server error: ' + error.message
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
