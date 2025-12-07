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
        
        console.log('DEBUG getLoggedIn user from DB:', {
            id: user?._id,
            userName: user?.userName,
            avatar: user?.avatar?.substring(0, 30), // Check avatar field
            avatarImage: user?.avatarImage, // Check avatarImage field
            allFields: Object.keys(user || {})
        });

        return res.status(200).json({
            loggedIn: true,
            user: {
                userName: user.userName,
                email: user.email,
                avatar: user.avatar, // Make sure this is the Base64 string
                isGuest: user.isGuest || false
            }
        });

    } catch (err) {
        console.log("getLoggedIn error: " + err);
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
        console.log("existingUser: ", existingUser);
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
        console.log("Generated token:", token);


        return res
            .cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/"
            })
            .status(200)
            .json({
                success: true,
                token: token, // Send token in response body
                user: {
                    _id: existingUser._id,
                    userName: existingUser.userName,
                    email: existingUser.email,
                    avatar: existingUser.avatar || null,
                    isGuest: existingUser.isGuest || false
                }
            });

    } catch (error) {
        console.error('Login error in controller:', error);
        return res.status(500).json({ error: error.message });
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
      const { userName, email, password, passwordVerify, avatar } = req.body;
      console.log("create user:", userName, email, password, passwordVerify, !!avatar);
  
   
      if (!userName || !email || !password || !passwordVerify) {
        return res.status(400).json({ errorMessage: "Please enter all required fields." });
      }
      if (password.length < 8) {
        return res.status(400).json({
          errorMessage: "Please enter a password of at least 8 characters."
        });
      }
      if (password !== passwordVerify) {
        return res.status(400).json({
          errorMessage: "Please enter the same password twice."
        });
      }
  
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          errorMessage: "An account with this email address already exists."
        });
      }
  
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const passwordHash = await bcrypt.hash(password, salt);
  

      let avatarToSave = null;
      if (avatar && typeof avatar === 'string' && avatar.startsWith('data:image/')) {
        avatarToSave = avatar;
      }
  
      const savedUser = await db.createUser({
        userName,
        email,
        passwordHash,
        avatar: avatarToSave
      });
  
      const token = auth.signToken({
        id: savedUser._id || savedUser.id,
        email: savedUser.email
      });
  
      await res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/"
        })
        .status(200)
        .json({
          success: true,
          user: {
            _id: savedUser._id,
            userName: savedUser.userName,
            email: savedUser.email,
            avatar: savedUser.avatar || null,
            isGuest: savedUser.isGuest || false
          }
        });
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
