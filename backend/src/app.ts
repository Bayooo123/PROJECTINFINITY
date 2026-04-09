import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import learnRoutes from './routes/learn.routes';
import insightRoutes from './routes/insights.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/insights', insightRoutes);

app.get('/', (req, res) => {
    res.send('LearnEd API is running');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
