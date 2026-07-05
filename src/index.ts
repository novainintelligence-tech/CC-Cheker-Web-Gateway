import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { config } from './config';
import paymentsRouter from './routes/payments';
import gatewaysRouter from './routes/gateways';
import healthRouter from './routes/health';

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/api/health', healthRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/gateways', gatewaysRouter);

const port = config.port || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
