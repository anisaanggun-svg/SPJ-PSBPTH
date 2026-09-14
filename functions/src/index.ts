import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from 'dotenv';

// Load environment variables
config();

// Import routes
import usersRouter from './routes/users';
import pejabatRouter from './routes/pejabat';
import rekapRouter from './routes/rekap';
import dataPrimerRouter from './routes/dataPrimer';

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
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
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Export the Express app as a Cloud Function
export const api = functions.https.onRequest(app);