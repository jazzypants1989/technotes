const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc    Login
// @route   POST auth
// @access  Public
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Type all the things, my man.' });
    }

    const user = await User.findOne({ username });

    if (!user || !user.active) {
        return res.status(400).json({ message: 'You either never made an account or you are not allowed around these parts, it seems.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'You are not very good at typing your password.' });
    }

    const accessToken = jwt.sign({ 
        "UserInfo": {
            "username": user.username,
            "roles": user.roles
        }
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '20m' }
    )

    const refreshToken = jwt.sign({
        "username": user.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '1d' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // Send the access token containing user name and roles to the client
    res.json({ accessToken });
};

// @desc    Refresh token
// @route   GET auth/refresh
// @access  Public
const refresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'You need to log back in. You have no cookies. I require delicious cookies.' });

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'You are not allowed to be here. You have no cookies. I require delicious cookies. Only the best.' });

            const user = await User.findOne({ username: decoded.username });

            if (!user) return res.status(403).json({ message: 'You have a cookie somehow, but you still are not supposed to be here. Go away.' });

            const accessToken = jwt.sign({ 
                "UserInfo": {
                    "username": user.username,
                    "roles": user.roles
                }
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1m' }
            )

            res.json({ accessToken });
        })
    )
};

// @desc    Logout
// @route   POST auth/logout
// @access  Public

const logout = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    res.clearCookie('jwt', 
    { 
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({ message: 'Byyyeeee!!!' });
};

module.exports = {
    login,
    refresh,
    logout
}