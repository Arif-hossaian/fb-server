import express from 'express';
import {
  createComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from '../controller/commentController.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.post('/comment', auth, createComment);

router.patch('/comment/:id/like', auth, likeComment);

router.patch('/comment/:id/unlike', auth, unlikeComment);

router.delete('/comment/:id', auth, deleteComment);

export default router;
