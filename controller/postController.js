import Users from '../model/userModel.js';
import Posts from '../model/postModel.js';
import Comments from '../model/commentModel.js';

class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  paginating() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export const createPost = async (req, res) => {
  try {
    const { content, images } = req.body;

    if (images.length === 0)
      return res.status(400).json({ message: 'Please add your photo.' });

    const newPost = new Posts({
      content,
      images,
      user: req.user._id,
    });
    await newPost.save();

    res.json({
      message: 'Created Post!',
      newPost: {
        ...newPost._doc,
        user: req.user,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const features = new APIfeatures(
      Posts.find({
        user: [req.user._id],
      }),
      req.query
    ).paginating();

    const posts = await features.query
      .sort('-createdAt')
      .populate('user likes', 'avatar username fullname followers')
      .populate({
        path: 'comments',
        populate: {
          path: 'user likes',
          select: '-password',
        },
      });

    res.json({
      message: 'Success!',
      result: posts.length,
      posts,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id)
      .populate('user likes', 'avatar username fullname followers')
      .populate({
        path: 'comments',
        populate: {
          path: 'user likes',
          select: '-password',
        },
      });

    if (!post)
      return res.status(400).json({ message: 'This post does not exist.' });

    res.json({
      post,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const features = new APIfeatures(
      Posts.find({ user: req.params.id }),
      req.query
    ).paginating();
    const posts = await features.query.sort('-createdAt');

    res.json({
      posts,
      result: posts.length,
    });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Posts.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    await Comments.deleteMany({ _id: { $in: post.comments } });

    res.json({
      message: 'Deleted Post!',
      newPost: {
        ...post,
        user: req.user,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Posts.find({ _id: req.params.id, likes: req.user._id });
    if (post.length > 0)
      return res.status(400).json({ message: 'You liked this post.' });

    const like = await Posts.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: { likes: req.user._id },
      },
      { new: true }
    );

    if (!like)
      return res.status(400).json({ message: 'This post does not exist.' });

    res.json({ message: 'Liked Post!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const like = await Posts.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: { likes: req.user._id },
      },
      { new: true }
    );

    if (!like)
      return res.status(400).json({ message: 'This post does not exist.' });

    res.json({ message: 'UnLiked Post!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
