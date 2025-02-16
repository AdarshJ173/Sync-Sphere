import express from 'express';
import cors from 'cors';
import spotifyRoutes from './routes/auth/spotify';

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.use('/auth/spotify', spotifyRoutes);

export default app; 