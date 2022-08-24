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
      //cross-site cookie
      path: '/api/refresh_token',
      maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
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
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshtoken) return res.sendStatus(204);
    res.clearCookie('refreshtoken', {
      path: '/api/refresh_token',
      httpOnly: true,
    });
    return res.json({ message: 'Logged out!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const generateAccessToken = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.refreshtoken)
      return res.status(401).json({ message: 'Unauthorized' });

    const rf_token = cookies.refreshtoken;

    jwt.verify(
      rf_token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, result) => {
        if (err) return res.status(400).json({ message: 'Please login now.' });

        const user = await Users.findById(result.id);

        if (!user)
          return res.status(400).json({ message: 'This does not exist.' });

        const access_token = createAccessToken({ id: result.id });

        res.json({
          access_token,
        });
      }
    );
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
