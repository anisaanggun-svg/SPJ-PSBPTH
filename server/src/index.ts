import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
import usersRouter from './routes/users';
import pejabatRouter from './routes/pejabat';
import rekapRouter from './routes/rekap';
import dataPrimerRouter from './routes/dataPrimer';

app.use('/api/users', usersRouter);
app.use('/api/pejabat', pejabatRouter);
app.use('/api/rekap', rekapRouter);
app.use('/api/data-primer', dataPrimerRouter);

// Health check
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SPPDpsbtph Backend running on port ${PORT}`);
});
