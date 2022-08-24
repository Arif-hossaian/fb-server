import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import AuthRoute from './routes/authRoute.js';
import PostRoute from './routes/postRoute.js';
import CommentRoute from './routes/commentRoute.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Routes
app.use('/api', AuthRoute);
app.use('/api', PostRoute);
app.use('/api', CommentRoute);

const CONNECTION_URL = process.env.MONGODB_URL;
mongoose.connect(`${CONNECTION_URL}`, (err) => {
  if (err) throw err;
  console.log('Mongodb connection');
});

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`server is running on port:- ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
