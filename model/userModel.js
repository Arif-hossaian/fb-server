import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile_picture: {
      type: String,
      default: 'https://picsum.photos/id/1005/300',
    },
    role: { type: String, default: 'user' },
    gender: { type: String, default: 'male' },
    story: {
      type: String,
      default: '',
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('user', userSchema);
