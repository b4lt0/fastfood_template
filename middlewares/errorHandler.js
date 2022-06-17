const {logEvents} = require('./logEvents.js');

//logs server errors and send it back to client with status 500
/*TODO make better use of it because showing errors on the client can help
    attackers understand how the architecture works and what actions that
    generates errors can be exploited.
 */
const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name}: ${err.message}`, 'errLog.txt');
    console.error(err.stack)
    res.status(500).send(err.message);
}

module.exports = errorHandler;