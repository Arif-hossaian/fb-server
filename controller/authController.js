import Users from '../model/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, username, email, password, gender } = req.body;
    let newUserName = username.toLowerCase().replace(/ /g, '');

    const user_name = await Users.findOne({ username: newUserName });
    if (user_name)
      return res
        .status(400)
        .json({ message: 'This user name already exists.' });

    const user_email = await Users.findOne({ email });
    if (user_email)
      return res.status(400).json({ message: 'This email already exists.' });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters.' });

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = new Users({
      name,
      username: newUserName,
      email,
      password: passwordHash,
      gender,
    });

    const access_token = createAccessToken({ id: newUser._id });
    const refresh_token = createRefreshToken({ id: newUser._id });

    res.cookie('refreshtoken', refresh_token, {
      httpOnly: true,
      path: '/api/refresh_token',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
    });

    await newUser.save();

    res.json({
      message: 'Register Success!',
      access_token,
      user: {
        ...newUser._doc,
        password: '',
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email }).exec();

    if (!user)
      return res.status(400).json({ message: 'This email does not exist.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Password is incorrect.' });

    const access_token = createAccessToken({ id: user._id });
    const refresh_token = createRefreshToken({ id: user._id });

    res.cookie('refreshtoken', refresh_token, {
      httpOnly: true,
      path: '/api/refresh_token',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
    });

    res.json({
      message: 'Login Success!',
      access_token,
      user: {
        ...user._doc,
        password: '',
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  if (!req.user)
    return res.status(400).json({ message: 'Invalid Authentication.' });

  try {
    res.clearCookie('refreshtoken', { path: `/api/refresh_token` });

    await Users.findOneAndUpdate(
      { _id: req.user._id },
      {
        rf_token: '',
      }
    );

    return res.json({ message: 'Logged out!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const generateAccessToken = async (req, res) => {
  try {
    const rf_token = req.cookies.refreshtoken;
    if (!rf_token)
      return res.status(400).json({ message: 'Please login now!' });
    const decoded = jwt.verify(rf_token, `${process.env.REFRESH_TOKEN_SECRET}`);
    if (!decoded.id)
      return res.status(400).json({ message: 'Please login now!' });
    const user = await Users.findById(decoded.id).select('-password +rf_token');
    if (!user)
      return res.status(400).json({ message: 'This account does not exist.' });

    if (rf_token !== user.rf_token)
      return res.status(400).json({ message: 'Please login now!' });

    const access_token = createAccessToken({ id: user._id });
    const refresh_token = createRefreshToken({ id: user._id }, res);

    await Users.findOneAndUpdate(
      { _id: user._id },
      {
        rf_token: refresh_token,
      }
    );

    res.json({ access_token, user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
};
