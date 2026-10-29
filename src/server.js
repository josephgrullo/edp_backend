
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './db.js';
import Equipment from './models/Equipment.js';
import aiRouter from './routes/ai.js';

const app = express();
const PORT = Number(process.env.PORT || 5000);

// Middleware
app.use(cors());
app.use(express.json());

// AI routes
app.use('/api/ai', aiRouter);

// Root route
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to GearTrack API',
    status: 'running',
    health: '/api/health'
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'GearTrack backend is running.'
  });
});

// GET dashboard totals
app.get('/api/dashboard', async (_req, res, next) => {
  try {
    const totalEquipment = await Equipment.countDocuments();

    const totals = await Equipment.aggregate([
      {
        $group: {
          _id: null,
          total_quantity: { $sum: '$quantity' }
        }
      }
    ]);

    res.json({
      total_equipment: totalEquipment,
      total_quantity: totals[0]?.total_quantity ?? 0
    });
  } catch (error) {
    next(error);
  }
});

// GET all equipment with optional search
// Example: /api/equipment?search=projector
app.get('/api/equipment', async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = {};

    if (search) {
      // Escape special regex characters before searching.
      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

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

    res.json({
      count: equipment.length,
      equipment
    });
  } catch (error) {
    next(error);
  }
});

// POST add a new inventory item
app.post('/api/equipment', async (req, res, next) => {
  try {
    const {
      name,
      category,
      quantity,
      item_condition,
      location
    } = req.body;

    // Validate required text fields
    if (
      typeof name !== 'string' || !name.trim() ||
      typeof category !== 'string' || !category.trim() ||
      typeof location !== 'string' || !location.trim()
    ) {
      return res.status(400).json({
        message: 'Name, category, and location are required.'
      });
    }

    // Validate quantity
    const itemQuantity = Number(quantity);

    if (
      quantity === undefined ||
      quantity === null ||
      quantity === '' ||
      !Number.isInteger(itemQuantity) ||
      itemQuantity < 0
    ) {
      return res.status(400).json({
        message: 'Quantity must be a whole number greater than or equal to zero.'
      });
    }

    // Generate the next numeric inventory ID
    const latestItem = await Equipment.findOne()
      .sort({ id: -1 })
      .select('id')
      .lean();

    const nextId = (latestItem?.id ?? 0) + 1;

    // Create inventory item
    const newItem = await Equipment.create({
      id: nextId,
      name: name.trim(),
      category: category.trim(),
      quantity: itemQuantity,
      item_condition:
        typeof item_condition === 'string' && item_condition.trim()
          ? item_condition.trim()
          : 'Good',
      location: location.trim()
    });

    res.status(201).json({
      message: 'Inventory item added successfully.',
      equipment: newItem
    });
  } catch (error) {
    next(error);
  }
});

// PUT update an existing inventory item by numeric ID
// Example: PUT /api/equipment/1
app.put('/api/equipment/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: 'Equipment ID must be a positive integer.'
      });
    }

    const {
      name,
      category,
      quantity,
      item_condition,
      location
    } = req.body;

    // Validate required text fields
    if (
      typeof name !== 'string' || !name.trim() ||
      typeof category !== 'string' || !category.trim() ||
      typeof location !== 'string' || !location.trim() ||
      typeof item_condition !== 'string' || !item_condition.trim()
    ) {
      return res.status(400).json({
        message: 'Name, category, condition, and location are required.'
      });
    }

    // Validate quantity
    const itemQuantity = Number(quantity);

    if (
      quantity === undefined ||
      quantity === null ||
      quantity === '' ||
      !Number.isInteger(itemQuantity) ||
      itemQuantity < 0
    ) {
      return res.status(400).json({
        message: 'Quantity must be a whole number greater than or equal to zero.'
      });
    }

    // Update the matching MongoDB record
    const updatedItem = await Equipment.findOneAndUpdate(
      { id },
      {
        $set: {
          name: name.trim(),
          category: category.trim(),
          quantity: itemQuantity,
          item_condition: item_condition.trim(),
          location: location.trim()
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedItem) {
      return res.status(404).json({
        message: 'Equipment not found.'
      });
    }

    res.json({
      message: 'Inventory item updated successfully.',
      equipment: updatedItem
    });
  } catch (error) {
    next(error);
  }
});

// DELETE an inventory item by numeric ID
app.delete('/api/equipment/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: 'Equipment ID must be a positive integer.'
      });
    }

    const deletedItem = await Equipment.findOneAndDelete({ id });

    if (!deletedItem) {
      return res.status(404).json({
        message: 'Equipment not found.'
      });
    }

    res.json({
      message: 'Inventory item deleted successfully.',
      equipment: deletedItem
    });
  } catch (error) {
    next(error);
  }
});

// GET one equipment record by numeric ID
// Example: /api/equipment/1
app.get('/api/equipment/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: 'Equipment ID must be a positive integer.'
      });
    }

    const equipment = await Equipment.findOne({ id })
      .select('id name category quantity item_condition location date_added')
      .lean();

    if (!equipment) {
      return res.status(404).json({
        message: 'Equipment not found.'
      });
    }

    res.json(equipment);
  } catch (error) {
    next(error);
  }
});

// Central error handler
app.use((error, _req, res, _next) => {
  console.error(error);

  res.status(500).json({
    message: 'Server error. Check the backend logs and database connection.'
  });
});

// Start server after connecting to MongoDB
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`GearTrack backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start GearTrack backend:', error);
    process.exit(1);
  }
}

startServer();
