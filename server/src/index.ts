import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import firebaseApp, { dbAdmin, authAdmin } from './lib/firebaseAdmin';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log Firebase status at startup
if (firebaseApp && dbAdmin && authAdmin) {
  console.log('[Startup] Firebase Admin SDK is ready — all API endpoints available.');
} else {
  console.warn('[Startup] WARNING: Firebase Admin SDK is NOT initialized.');
  console.warn('[Startup] Authenticated endpoints (/api/users, /api/data-primer, etc.) will return errors.');
  console.warn('[Startup] Health check (/api/health) will still work.');
}

// Routes
import usersRouter from './routes/users';
import pejabatRouter from './routes/pejabat';
import rekapRouter from './routes/rekap';
import dataPrimerRouter from './routes/dataPrimer';

app.use('/api/users', usersRouter);
app.use('/api/pejabat', pejabatRouter);
app.use('/api/rekap', rekapRouter);
app.use('/api/data-primer', dataPrimerRouter);

// Health check — always available, even if Firebase is down
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    firebase: firebaseApp ? 'connected' : 'disconnected',
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Error]', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[Startup] SPPDpsbtph Backend running on port ${PORT}`);
});
