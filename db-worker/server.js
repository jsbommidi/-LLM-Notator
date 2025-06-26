const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9848;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'llm_notator',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5435,
});

// Initialize database tables
const initDatabase = async () => {
  try {
    // Create the archives table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS archives (
        id SERIAL PRIMARY KEY,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        error_categories JSONB DEFAULT '[]',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on created_at for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_archives_created_at ON archives(created_at DESC)
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get all archived items with pagination
app.get('/archives', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM archives');
    const totalItems = parseInt(countResult.rows[0].count);

    // Get paginated results
    const result = await pool.query(
      `SELECT id, prompt, response, error_categories, notes, created_at, updated_at 
       FROM archives 
       ORDER BY created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      archives: result.rows,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasNext: page < Math.ceil(totalItems / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching archives:', error);
    res.status(500).json({ error: 'Failed to fetch archives' });
  }
});

// Get a specific archived item
app.get('/archives/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM archives WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archive not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching archive:', error);
    res.status(500).json({ error: 'Failed to fetch archive' });
  }
});

// Create a new archive entry
app.post('/archives', async (req, res) => {
  try {
    const { prompt, response, error_categories, notes } = req.body;

    // Validate required fields
    if (!prompt || !response) {
      return res.status(400).json({ error: 'Prompt and response are required' });
    }

    const result = await pool.query(
      `INSERT INTO archives (prompt, response, error_categories, notes) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [prompt, response, JSON.stringify(error_categories || []), notes || '']
    );

    res.status(201).json({
      message: 'Archive created successfully',
      archive: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating archive:', error);
    res.status(500).json({ error: 'Failed to create archive' });
  }
});

// Update an archive entry
app.put('/archives/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, response, error_categories, notes } = req.body;

    // Check if archive exists
    const existingResult = await pool.query(
      'SELECT id FROM archives WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Archive not found' });
    }

    const result = await pool.query(
      `UPDATE archives 
       SET prompt = COALESCE($1, prompt),
           response = COALESCE($2, response),
           error_categories = COALESCE($3, error_categories),
           notes = COALESCE($4, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [
        prompt,
        response,
        error_categories ? JSON.stringify(error_categories) : null,
        notes,
        id
      ]
    );

    res.json({
      message: 'Archive updated successfully',
      archive: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating archive:', error);
    res.status(500).json({ error: 'Failed to update archive' });
  }
});

// Delete an archive entry
app.delete('/archives/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM archives WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archive not found' });
    }

    res.json({ message: 'Archive deleted successfully' });
  } catch (error) {
    console.error('Error deleting archive:', error);
    res.status(500).json({ error: 'Failed to delete archive' });
  }
});

// Search archives
app.get('/archives/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const searchQuery = `%${query}%`;

    // Get total count for search
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM archives 
       WHERE prompt ILIKE $1 OR response ILIKE $1 OR notes ILIKE $1`,
      [searchQuery]
    );
    const totalItems = parseInt(countResult.rows[0].count);

    // Get search results
    const result = await pool.query(
      `SELECT id, prompt, response, error_categories, notes, created_at, updated_at 
       FROM archives 
       WHERE prompt ILIKE $1 OR response ILIKE $1 OR notes ILIKE $1
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [searchQuery, limit, offset]
    );

    res.json({
      archives: result.rows,
      query,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasNext: page < Math.ceil(totalItems / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error searching archives:', error);
    res.status(500).json({ error: 'Failed to search archives' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Database worker server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 