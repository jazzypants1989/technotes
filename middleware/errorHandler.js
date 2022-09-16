const { logEvents } = require('./logger');

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack);

    const status = res.statusCode ? res.statusCode : 500;

    res.status(status).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    })
}

module.exports = errorHandler;