const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    try {
        const token = req.headers['access-token'];

        // Check if the user has a token
        if (!token) return res.status(401).json({auth: false, message: 'You have to sign up or login first.'});

        // Decode token
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);

        // Declare a global req variable using the token which is the user public data
        req.user_id = decoded.id;
        req.username = decoded.username;
        req.friends = decoded.friends;
        
        next();
    } catch (error) {
        res.status(500).json({auth: false, message: error.message});
    }
};

const isLoggedIn = (req, res, next) => {
    try {
        const token = req.headers['access-token'];

        // Check if the user has already logged
        if (token) return res.status(200).json({auth: true, message: 'You are already logged.'});

        next();
    } catch (error) {
        res.status(500).json({auth: false, message: error.message});
    }
};

module.exports = {verifyToken, isLoggedIn};