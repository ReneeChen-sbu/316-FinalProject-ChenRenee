const auth = require('../auth')
//const User = require('../models/user-model')
//new manager access 
const db = require('../db');
const bcrypt = require('bcryptjs')

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
                firstName: user.firstName || user.first_name,
                lastName: user.lastName || user.last_name,
                email: user.email
            }
        });

    } catch (err) {
        console.log("err: " + err);
        res.status(500).json(false);
    }
}



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
                })
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
                })
        }

        // LOGIN THE USER
        const token = auth.signToken({id: existingUser._id || existingUser.id,
            email: existingUser.email});
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "lax",
            path: "/"
          }).status(200).json({
            success: true,
            user: {
              firstName: existingUser.firstName || existingUser.first_name,
              lastName: existingUser.lastName || existingUser.last_name,
              email: existingUser.email
            }
          });
          

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

logoutUser = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/"
      }).status(200).json({ success:true });
      
};

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { firstName, lastName, email, password, passwordVerify } = req.body;
        console.log("create user: " + firstName + " " + lastName + " " + email + " " + password + " " + passwordVerify);
        if (!firstName || !lastName || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                })
        }
        console.log("password and password verify match");
        const existingUser = await db.getUserByEmail(email);
        console.log("existingUser: " + existingUser);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                })
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        const savedUser = await db.createUser({firstName, lastName, email, passwordHash});

        console.log("new user saved: " + savedUser._id);

        // LOGIN THE USER
        const token = auth.signToken({
            id: savedUser._id || savedUser.id,
            email: savedUser.email
        });
        
        console.log("token:" + token);

        await res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        }).status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName || savedUser.first_name,
                lastName: savedUser.lastName || savedUser.last_name,  
                email: savedUser.email              
            }
        })

        console.log("token sent");

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
}

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}