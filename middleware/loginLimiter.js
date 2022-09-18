const ratelimit = require('express-rate-limit');
const { logEvents } = require('../middleware/logger');

const loginLimiter = ratelimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // 5 attempts
    message: 'Too many login attempts. Wait one minute and then stop mashing the keyboard.',
    handler: (req, res, next, options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

module.exports = loginLimiter