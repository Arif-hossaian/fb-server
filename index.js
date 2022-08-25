import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import rootRoute from './routes/rootRoute.js';
import AuthRoute from './routes/authRoute.js';
import PostRoute from './routes/postRoute.js';
import CommentRoute from './routes/commentRoute.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Routes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//console.log(__dirname);
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/', rootRoute);
app.use('/api', AuthRoute);
app.use('/api', PostRoute);
app.use('/api', CommentRoute);

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'server running' });
});

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
