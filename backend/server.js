import express from 'express';
import mongoose from 'mongoose';
import User from './models/User.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const startServer = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/mern-test');
    console.log('MongoDB connected');

    app.use((req, res, next) => {
      console.log(req.method, req.url);
      next();
    });

    app.get('/', (req, res) => res.send('Server is alive!'));

    app.get('/api/users', async (req, res) => {
      const users = await User.find();
      res.json(users);
    });

    app.post('/api/users', async (req, res) => {
      const user = new User(req.body);
      await user.save();
      res.json(user);
    });

    const PORT = 4000;
    app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

startServer();
