const JWT = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Something is wrong with your cookies. They are not delicious enough.' });
            req.user = decoded.UserInfo.username;
            req.roles = decoded.UserInfo.roles;
            next()
        }
    )
};

module.exports = verifyJWT;