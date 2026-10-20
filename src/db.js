import mongoose from 'mongoose';
import 'dotenv/config';

const defaultMongoUri = 'mongodb://127.0.0.1:27017/geartrack_db';

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || defaultMongoUri;

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.error('Check that MongoDB is running and MONGODB_URI in .env is correct.');
    process.exit(1);
  }
}
