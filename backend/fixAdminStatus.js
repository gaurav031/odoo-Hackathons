import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB. Approving existing users...');
    await User.updateMany({}, { status: 'Approved' });
    console.log('All existing users approved successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
