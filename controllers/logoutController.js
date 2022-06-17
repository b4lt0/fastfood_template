const User = require('../models/User');
//TODO write useful comments
//TODO change 200 for 204 and remove msg
const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(200).json({ 'message': 'Hey you didn\'t send us your token.' }); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken: refreshToken }).exec();
    if (!foundUser) {
        //TODO remove httpOnly and secure: false when deploy
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: false });
        return res.status(200).json({ 'message': 'You weren\'t even logged in.' });
    }

    // Delete refreshToken in db
    foundUser.refreshToken = '';
    const result = await foundUser.save();
    console.log(result);
    //TODO remove httpOnly and secure:false when deploy
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: false });
    res.status(200).json({'message': 'OK you\'re out.'});
}

module.exports = { handleLogout }