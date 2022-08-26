import jwt from 'jsonwebtoken';
import Users from '../model/userModel.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token)
      return res.status(400).json({ message: 'Invalid Authentication.' });

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded)
      return res.status(400).json({ message: 'Invalid Authentication.' });

    const user = await Users.findOne({ _id: decoded.id }).select('-password');
    if (!user) return res.status(400).json({ message: 'User does not exist.' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
