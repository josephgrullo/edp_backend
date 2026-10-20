import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './db.js';
import Equipment from './models/Equipment.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

// Basic server check. This endpoint confirms Express is running.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'GearTrack backend is running.' });
});

// GET dashboard totals.
app.get('/api/dashboard', async (_req, res, next) => {
  try {
    const totalEquipment = await Equipment.countDocuments();
    const totals = await Equipment.aggregate([
      { $group: { _id: null, total_quantity: { $sum: '$quantity' } } }
    ]);

    res.json({
      total_equipment: totalEquipment,
      total_quantity: totals[0]?.total_quantity ?? 0
    });
  } catch (error) {
    next(error);
  }
});

// GET all equipment. Optional search: /api/equipment?search=projector
app.get('/api/equipment', async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = {};

    if (search) {
      // Escape special regex characters so search text is treated literally.
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedSearch, 'i');
      filter.$or = [
        { name: pattern },
        { category: pattern },
        { location: pattern }
      ];
    }

    const equipment = await Equipment.find(filter)
      .select('id name category quantity item_condition location date_added')
      .sort({ id: 1 })
      .lean();

    res.json({ count: equipment.length, equipment });
  } catch (error) {
    next(error);
  }
});

// GET one equipment record by its numeric app ID. Example: /api/equipment/1
app.get('/api/equipment/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ message: 'Equipment ID must be a positive integer.' });
    }

    const equipment = await Equipment.findOne({ id })
      .select('id name category quantity item_condition location date_added')
      .lean();

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found.' });
    }

    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

// Central error handler.
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: 'Server error. Check the backend terminal and MongoDB connection.'
  });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`GearTrack backend running at http://localhost:${PORT}`);
  });
}

startServer();
