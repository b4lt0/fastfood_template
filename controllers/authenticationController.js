const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleLogin = async (req, res) => {
    const {user, pwd} = req.body;

    if (!user || !pwd) return res.status(400).json({'message': 'Username and password are required.'});

    const foundUser = await User.findOne({username: user}).exec();
    if (!foundUser) return res.status(401); //Unauthorized

    // evaluate password
    const match = await bcrypt.compare(pwd, foundUser.password);
    if (match) {
        const role = Object.values(foundUser.role);
        // create JWTs
        const accessToken = jwt.sign(
            {
                "UserInfo": {
                    "username": foundUser.username,
                    "role": role
                }
            },
            //TODO how long should it last?
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: '10000s'}
        );
        const refreshToken = jwt.sign(
            {"username": foundUser.username},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );
        // Saving refreshToken with current user
        foundUser.refreshToken = refreshToken;
        const result = await foundUser.save();
        console.debug('auth ' + result);

        //TODO add param secure:true (disabled for testing) (e quante bestemmie per capire che era questo il problema)
        res.cookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000});
        res.json({accessToken});
    } else {
        res.sendStatus(401);
    }
}

module.exports = {handleLogin};