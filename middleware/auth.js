import jwt from 'jsonwebtoken';
import Users from '../model/userModel.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded)
      return res.status(400).json({ message: 'Invalid Authentication.' });

    const user = await Users.findOne({ _id: decoded.id });

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
