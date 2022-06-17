const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({'message':'This is not a correctly formed authorization header'});
    //Bearer token
    console.debug('token: '+ authHeader);
    const token = authHeader.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (error, decoded) => {
            if(error) return res.send(403).json({'messaage':'aaargh this token isn\'t valid'});
            req.user = decoded.UserInfo.username;
            req.role = decoded.UserInfo.role;
            next();
        }
    );
}

module.exports = verifyJWT;