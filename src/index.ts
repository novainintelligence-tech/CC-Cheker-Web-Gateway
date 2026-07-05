import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import paymentsRouter from './routes/payments';
import gatewaysRouter from './routes/gateways';
import healthRouter from './routes/health';
import validateRouter from './routes/validate';
import adminRouter from './routes/admin';
import bulkRouter from './routes/bulk';
import telegramRouter from './routes/telegram';
import path from 'path';

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// serve static frontend
app.use('/', express.static(path.join(__dirname, '..', 'public')));

app.use('/api/health', healthRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/gateways', gatewaysRouter);
app.use('/api/validate', validateRouter);
app.use('/api/admin', adminRouter);
app.use('/api/bulk', bulkRouter);
app.use('/api/telegram', telegramRouter);

const port = config.port || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
