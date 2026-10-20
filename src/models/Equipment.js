import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    // A readable numeric ID keeps the original GET route /api/equipment/1 working.
    // MongoDB also automatically creates its own _id field for each document.
    id: {
      type: Number,
      required: true,
      unique: true,
      min: 1
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    item_condition: {
      type: String,
      required: true,
      default: 'Good',
      trim: true,
      maxlength: 50
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },
    date_added: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

export default mongoose.model('Equipment', equipmentSchema);
