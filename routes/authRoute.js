import express from 'express';
import {
  generateAccessToken,
  login,
  logout,
  register,
} from '../controller/authController.js';
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.get('/refresh_token', generateAccessToken);

export default router;
