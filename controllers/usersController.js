const User = require('../models/User');

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ 'message': 'There\'s no one here.' });
  res.json(users);
}

const deleteUser = async (req, res) => {
  if (!req?.body?.id) return res.status(400).json({ "message": 'We need the user ID to delete a user' });
  const user = await User.findOne({ _id: req.body.id }).exec();
  if (!user) {
    return res.status(204).json({ 'message': `There's no one with id:${req.body.id}` });
  }
  const result = await user.deleteOne({ _id: req.body.id });
  res.json(result);
}

const getUser = async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ "message": 'We need the user ID to delete a user' });
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res.status(204).json({ 'message': `Here's no one with id:${req.params.id}` });
  }
  res.json(user);
}

module.exports = {
  getAllUsers,
  deleteUser,
  getUser
}