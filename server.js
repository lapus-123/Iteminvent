const express = require('express');
const connectDB = require('./db');
const cors = require('cors');
const path = require('path');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the public directory
// Place this BEFORE your API routes and the catch-all
app.use(express.static(path.join(__dirname, 'public')));

// Define API Routes - Place these BEFORE the catch-all
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/history', require('./routes/historyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// --- THE FIX IS HERE ---
// Catch-all route for the SPA: Serve index.html for any non-API route
// This MUST come AFTER your API routes and static middleware
// Serve the frontend - Catch-all for SPA
// Corrected catch-all route
app.get('*splat', (req, res) => { // <-- Changed '*' to '*splat'
  res.sendFile(path.join(__dirname, 'public', 'invent.html'));
});
// --- END OF FIX ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
