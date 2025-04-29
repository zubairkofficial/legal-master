import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import userProfileRoutes from './routes/userProfileRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
const app = express();

  // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(cors());

// Define routes for user and authentication management
app.use('/uploads', express.static('uploads'));
const v1Router = express.Router();
v1Router.use('/auth', authRoutes); 
v1Router.use('/questions', questionRoutes);
v1Router.use('/categories', categoryRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/profile', userProfileRoutes);
v1Router.use('/chats', chatRoutes);
v1Router.use('/settings', settingsRoutes);


app.use('/api/v1', v1Router);


app.get('/api/v1/', (req, res) => {
    res.send({ "Hello": "World" })
})

export default app; // Use export default instead of module.exports