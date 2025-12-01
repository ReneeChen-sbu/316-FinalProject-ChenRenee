const jwt = require("jsonwebtoken")

function authManager() {

    const verify = (req, res, next) => {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ loggedIn:false, user:null, errorMessage:"Unauthorized" })
            }

            const verified = jwt.verify(token, process.env.JWT_SECRET)

            req.userId = verified.id
            req.userEmail = verified.email

            next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({ loggedIn:false, user:null, errorMessage:"Unauthorized" })
        }
    }

    const verifyUser = (req) => {
        try {
            const token = req.cookies.token;
            if (!token) return null;
            const verified = jwt.verify(token, process.env.JWT_SECRET);
            return {
                id: verified.id,
                email: verified.email
            }
        }
        catch(err) {
            return null;
        }
    }

    const signToken = function(userData) {
        return jwt.sign(
            {
                id: userData._id?.toString() || userData.id?.toString(),
                email: userData.email
            },
            process.env.JWT_SECRET
        );
    }

    return { verify, verifyUser, signToken }
}

const auth = authManager();
module.exports = auth;
