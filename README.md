# GearTrack Backend (MongoDB Edition)

A beginner-friendly ExpressJS backend for GearTrack using MongoDB and Mongoose. This starter version includes GET routes for health checking, dashboard totals, listing/searching equipment, and retrieving one equipment record.

## Requirements
- Node.js 18 or newer
- MongoDB Community Server running locally, or a MongoDB Atlas database
- VS Code (recommended)

## 1. Set up MongoDB

### Option A: MongoDB installed locally
Install and start MongoDB Community Server. The default connection URI is:

```text
mongodb://127.0.0.1:27017/geartrack_db
```

No database needs to be manually created in pgAdmin. MongoDB creates the database and collection when data is first inserted.

### Option B: MongoDB Atlas
Create a cluster and a database user in MongoDB Atlas, allow your current IP address in Network Access, and copy the connection string. Put it in `MONGODB_URI` in your `.env` file. Replace the username/password placeholders with your Atlas database user's credentials, and include `/geartrack_db` before any query options if the URI does not already specify a database. Do not share or upload this URI publicly.

## 2. Configure the environment

1. In VS Code, create a copy of `.env.example` named `.env` in the project root (next to `package.json`).
2. For local MongoDB, use:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/geartrack_db
```

3. For Atlas, replace the URI with your Atlas connection string.

## 3. Install dependencies

Open the VS Code terminal in the `geartrack-backend` folder and run:

```bash
npm install
```

## 4. Add sample equipment

Run this once or again whenever you want to ensure the three sample records exist:

```bash
npm run seed
```

The seed command adds the sample items if their numeric IDs do not already exist. It does not overwrite existing records.

## 5. Start the backend

```bash
npm run dev
```

Expected messages include:

```text
Connected to MongoDB successfully.
GearTrack backend running at http://localhost:5000
```

Keep the terminal open while testing the API.

## GET routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Checks whether Express is running |
| GET | `/api/dashboard` | Returns equipment record count and total quantity |
| GET | `/api/equipment` | Returns all equipment records |
| GET | `/api/equipment?search=projector` | Searches equipment by name, category, or location (case-insensitive) |
| GET | `/api/equipment/1` | Returns the equipment record whose numeric ID is 1 |

### Browser tests

- `http://localhost:5000/api/health`
- `http://localhost:5000/api/dashboard`
- `http://localhost:5000/api/equipment`
- `http://localhost:5000/api/equipment?search=projector`
- `http://localhost:5000/api/equipment/1`

## MongoDB data structure

The `equipment` collection stores documents with `id`, `name`, `category`, `quantity`, `item_condition`, `location`, and `date_added`. MongoDB also adds its own `_id` field. The numeric `id` keeps the existing `/api/equipment/1` route working.

## Troubleshooting

- **MongoNetworkError / ECONNREFUSED:** Make sure your local MongoDB server is running, or check the Atlas URI and network access settings.
- **Authentication failed:** For Atlas, use the Atlas database user's credentials, not your MongoDB Atlas website login. For local MongoDB, check whether authentication is enabled and update the URI accordingly.
- **No equipment records:** Run `npm run seed`, then refresh the equipment route.
- **Port already in use:** Change `PORT` in `.env` or stop the process using port 5000.

Only GET routes are included in this starter version. POST, PUT/PATCH, and DELETE can be added later for full CRUD functionality.
