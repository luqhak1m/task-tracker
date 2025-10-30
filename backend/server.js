import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;


// MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Mongo error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', taskRoutes);

app.get('/', (req, res) => res.send('Task Tracker API running'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// import express from 'express';
// import mongoose from 'mongoose';
// import cors from 'cors';
// import jwt from 'jsonwebtoken';
// import User from './models/User.js';

// const app = express();
// app.use(cors());
// app.use(express.json());

// const MONGO = 'mongodb://127.0.0.1:27017/mern-test';
// const JWT_SECRET = 'replace_this_with_a_strong_secret';

// mongoose.connect(MONGO)
//   .then(() => console.log('mongodb connected'))
//   .catch(err => console.error('mongo error', err));

// app.get('/', (req, res) => res.send('Server is alive!'));

// app.post('/api/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ error: 'email and password required' });

//     const exists = await User.findOne({ email });
//     if (exists) return res.status(400).json({ error: 'email already used' });

//     const user = new User({ name, email, password });
//     await user.save();
//     // respond without password
//     const { password: _, ...userSafe } = user.toObject();
//     res.json({ user: userSafe });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'server error' });
//   }
// });

// app.post('/api/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) return res.status(400).json({ error: 'email and password required' });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ error: 'invalid credentials' });

//     const match = await user.comparePassword(password);
//     if (!match) return res.status(400).json({ error: 'invalid credentials' });

//     const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
//     const { password: _, ...userSafe } = user.toObject();
//     res.json({ token, user: userSafe });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'server error' });
//   }
// });

// const auth = (req, res, next) => {
//   const header = req.headers.authorization;
//   if (!header) return res.status(401).json({ error: 'no token' });
//   const token = header.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.userId = decoded.id;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'invalid token' });
//   }
// };

// app.get('/api/profile', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.userId).select('-password');
//     if (!user) return res.status(404).json({ error: 'user not found' });
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ error: 'server error' });
//   }
// });

// app.get('/api/users', async (req, res) => {
//   const users = await User.find().select('-password');
//   res.json(users);
// });

// app.post('/api/users', async (req, res) => {
//   const { name, email } = req.body;
//   const user = new User({ name, email, password: 'temporary' }); // avoid empty password
//   await user.save();
//   res.json({ _id: user._id, name: user.name, email: user.email });
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`server running at port ${PORT}`));
