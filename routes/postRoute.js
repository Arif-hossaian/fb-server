import express from 'express';
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getUserPosts,
  likePost,
  unlikePost,
} from '../controller/postController.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.use(auth);

router.post('/create_post', createPost);
router.get('/posts', getPosts);

router.route('/post/:id').get(auth, getPost).delete(auth, deletePost);

router.patch('/post/:id/like', auth, likePost);

router.patch('/post/:id/unlike', auth, unlikePost);

router.get('/user_posts/:id', auth, getUserPosts);

export default router;
