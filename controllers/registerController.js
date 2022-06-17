const User = require('../models/User');
const bcrypt = require('bcrypt');

const handleSignUp = async (req, res) => {
    const {user, pwd } = req.body;

    //checjk if the client contains both username and pwd
    if (!user || !pwd) return res.status(400).json({ 'message': 'We need both your username and password.' });

    // check for duplicate usernames in the db
    const duplicate = await User.findOne({username: user}).exec();
    if (duplicate) return res.status(409).json({ 'conflict': 'This username already exists, choose another one.' });

    try {
        //encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);
        //store the new user
        const result = await User.create({
            "username": user,
            // "roles": _ , we don't really need it because of the default value
            "password": hashedPwd
        });
        console.debug('signup ' + result);
        res.status(201).json({ 'success': `${user} created!` });
    } catch (err) {
        res.status(500).json({ 'message': err.message });
    }
}

module.exports = {handleSignUp };