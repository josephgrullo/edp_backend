import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/db.js';
import Equipment from '../src/models/Equipment.js';

const sampleEquipment = [
  {
    id: 1,
    name: 'Projector',
    category: 'Electronics',
    quantity: 4,
    item_condition: 'Good',
    location: 'Room 101',
    date_added: new Date('2026-01-10T00:00:00.000Z')
  },
  {
    id: 2,
    name: 'Office Chair',
    category: 'Furniture',
    quantity: 12,
    item_condition: 'Good',
    location: 'Faculty Office',
    date_added: new Date('2026-01-12T00:00:00.000Z')
  },
  {
    id: 3,
    name: 'Laptop',
    category: 'Electronics',
    quantity: 6,
    item_condition: 'Needs Repair',
    location: 'Computer Laboratory',
    date_added: new Date('2026-01-15T00:00:00.000Z')
  }
];

try {
  await connectDB();

  for (const item of sampleEquipment) {
    await Equipment.updateOne({ id: item.id }, { $setOnInsert: item }, { upsert: true });
  }

  console.log('Sample equipment records are ready. Existing records were not overwritten.');
} catch (error) {
  console.error('Could not seed sample equipment:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
