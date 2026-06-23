import http from 'http';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { registerSocket } from './socket/index.js';
import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customers.js';
import dashboardRoutes from './routes/dashboard.js';
import notificationRoutes from './routes/notifications.js';
import paymentRoutes from './routes/payments.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';
import actionRoutes from './routes/actions.js';
import aiRoutes from './routes/ai.js';
import { initScheduler } from './services/schedulerService.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientOrigin, credentials: true }
});

registerSocket(io);

app.use(helmet());
app.use(cors({ 
  origin: function (origin, callback) {
    callback(null, true);
  }, 
  credentials: true 
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'ganga-maxx-credit-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/customers', requireAuth, customerRoutes);
app.use('/api/payments', requireAuth, paymentRoutes);
app.use('/api/reports', requireAuth, reportRoutes);
app.use('/api/notifications', requireAuth, notificationRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);
app.use('/api/actions', requireAuth, actionRoutes);
app.use('/api/ai', requireAuth, aiRoutes);
app.use(errorHandler);

export { app };
if (process.env.NODE_ENV !== 'test') {
  server.listen(env.port, () => {
    console.log(`Ganga Maxx credit API running on http://localhost:${env.port}`);
    initScheduler();
  });
}
