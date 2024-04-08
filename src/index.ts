import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import mongoose from 'mongoose';
import AppError from './utils/appError';
import globalErrorHandler from './controller/errorController';
import { router as userRouter } from './routes/userRoutes';

const port = process.env.PORT || 3000;

const main = async () => {
  await mongoose.connect(process.env.DATABASE as string);
  console.log('DB connect successfully');
};

main().catch((err) => console.log(err));

if (process.env.NODE_ENV === 'development') {
  console.log('dev');
}

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', async (req: Request, res: Response) => {
  res.json({ message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`Server running from port 7000`);
});

app.use('/api/users', userRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);

  next(err);
});

app.use(globalErrorHandler);
