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
    // Check if migration file exists and run it
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, 'migrations', '002_simple_migration.sql');
    
    if (fs.existsSync(migrationPath)) {
      console.log('Running database migration...');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(migrationSQL);
      console.log('Database migration completed successfully');
    } else {
      // Fallback to basic table creation if migration file doesn't exist
      console.log('Migration file not found, creating basic archives table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS archives (
          id SERIAL PRIMARY KEY,
          prompt TEXT NOT NULL,
          response TEXT NOT NULL,
          error_categories JSONB DEFAULT '[]'::JSONB,
          category_notes JSONB DEFAULT '{}'::JSONB,
          general_notes TEXT DEFAULT '',
          example_id VARCHAR(255),
          annotator_session_id UUID DEFAULT gen_random_uuid(),
          prompt_length INTEGER GENERATED ALWAYS AS (LENGTH(prompt)) STORED,
          response_length INTEGER GENERATED ALWAYS AS (LENGTH(response)) STORED,
          categories_count INTEGER GENERATED ALWAYS AS (jsonb_array_length(error_categories)) STORED,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT valid_prompt CHECK (LENGTH(prompt) > 0),
          CONSTRAINT valid_response CHECK (LENGTH(response) > 0)
        )
      `);

      // Create essential indexes
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_archives_created_at ON archives(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_archives_example_id ON archives(example_id);
        CREATE INDEX IF NOT EXISTS idx_archives_error_categories ON archives USING gin(error_categories);
      `);
    }

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
    const { 
      prompt, 
      response, 
      error_categories, 
      notes, 
      category_notes, 
      example_id 
    } = req.body;

    // Validate required fields
    if (!prompt || !response) {
      return res.status(400).json({ error: 'Prompt and response are required' });
    }

    const result = await pool.query(
      `INSERT INTO archives (
        prompt, 
        response, 
        error_categories, 
        general_notes, 
        category_notes, 
        example_id
      ) VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        prompt, 
        response, 
        JSON.stringify(error_categories || []), 
        notes || '',
        JSON.stringify(category_notes || {}),
        example_id || null
      ]
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
    const { 
      prompt, 
      response, 
      error_categories, 
      notes, 
      category_notes, 
      example_id 
    } = req.body;

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
           general_notes = COALESCE($4, general_notes),
           category_notes = COALESCE($5, category_notes),
           example_id = COALESCE($6, example_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        prompt,
        response,
        error_categories ? JSON.stringify(error_categories) : null,
        notes,
        category_notes ? JSON.stringify(category_notes) : null,
        example_id,
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

// Search archives with enhanced full-text search
app.get('/archives/search/:query', async (req, res) => {
  const { query } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  
  try {

    // Use both full-text search and ILIKE for broader matching
    const searchQuery = `%${query}%`;
    const tsQuery = query.split(/\s+/).join(' & ');

    // Get total count for search
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM archives 
       WHERE 
         to_tsvector('english', prompt) @@ to_tsquery('english', $1) OR
         to_tsvector('english', response) @@ to_tsquery('english', $1) OR
         to_tsvector('english', COALESCE(general_notes, '')) @@ to_tsquery('english', $1) OR
         prompt ILIKE $2 OR 
         response ILIKE $2 OR 
         COALESCE(general_notes, '') ILIKE $2 OR
         error_categories::text ILIKE $2 OR
         category_notes::text ILIKE $2 OR
         COALESCE(example_id, '') ILIKE $2`,
      [tsQuery, searchQuery]
    );
    const totalItems = parseInt(countResult.rows[0].count);

    // Get paginated search results with relevance ranking
    const result = await pool.query(
      `SELECT 
         id, prompt, response, error_categories, general_notes, category_notes, 
         example_id, annotator_session_id, prompt_length, response_length, 
         categories_count, created_at, updated_at,
         -- Relevance ranking
         ts_rank(to_tsvector('english', prompt || ' ' || response || ' ' || COALESCE(general_notes, '')), to_tsquery('english', $1)) as relevance
       FROM archives 
       WHERE 
         to_tsvector('english', prompt) @@ to_tsquery('english', $1) OR
         to_tsvector('english', response) @@ to_tsquery('english', $1) OR
         to_tsvector('english', COALESCE(general_notes, '')) @@ to_tsquery('english', $1) OR
         prompt ILIKE $3 OR 
         response ILIKE $3 OR 
         COALESCE(general_notes, '') ILIKE $3 OR
         error_categories::text ILIKE $3 OR
         category_notes::text ILIKE $3 OR
         COALESCE(example_id, '') ILIKE $3
       ORDER BY relevance DESC, created_at DESC 
       LIMIT $4 OFFSET $5`,
      [tsQuery, tsQuery, searchQuery, limit, offset]
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
    // Fallback to simple search if full-text search fails
    try {
      const searchQuery = `%${query}%`;
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM archives 
         WHERE prompt ILIKE $1 OR response ILIKE $1 OR COALESCE(general_notes, '') ILIKE $1`,
        [searchQuery]
      );
      const totalItems = parseInt(countResult.rows[0].count);

      const result = await pool.query(
        `SELECT id, prompt, response, error_categories, general_notes, category_notes, 
                example_id, annotator_session_id, created_at, updated_at 
         FROM archives 
         WHERE prompt ILIKE $1 OR response ILIKE $1 OR COALESCE(general_notes, '') ILIKE $1
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
    } catch (fallbackError) {
      console.error('Error in fallback search:', fallbackError);
      res.status(500).json({ error: 'Failed to search archives' });
    }
  }
});

// Analytics endpoint
app.get('/analytics', async (req, res) => {
  try {
    const analyticsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_archives,
        COUNT(DISTINCT example_id) as unique_examples,
        COUNT(DISTINCT annotator_session_id) as unique_sessions,
        AVG(prompt_length) as avg_prompt_length,
        AVG(response_length) as avg_response_length,
        AVG(categories_count) as avg_categories_per_annotation,
        DATE_TRUNC('day', MIN(created_at)) as earliest_annotation,
        DATE_TRUNC('day', MAX(created_at)) as latest_annotation
      FROM archives
    `);

    // Get most common error categories
    const categoriesResult = await pool.query(`
      SELECT 
        category,
        COUNT(*) as frequency
      FROM (
        SELECT jsonb_array_elements_text(error_categories) as category
        FROM archives
        WHERE error_categories IS NOT NULL
      ) categories
      GROUP BY category
      ORDER BY frequency DESC
      LIMIT 10
    `);

    // Get daily activity over last 30 days
    const activityResult = await pool.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as annotations_count
      FROM archives
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `);

    res.json({
      summary: analyticsResult.rows[0],
      topErrorCategories: categoriesResult.rows,
      dailyActivity: activityResult.rows
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Bulk operations endpoint
app.post('/archives/bulk', async (req, res) => {
  try {
    const { operation, ids, data } = req.body;

    if (!operation || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid bulk operation request' });
    }

    switch (operation) {
      case 'delete':
        const deleteResult = await pool.query(
          'DELETE FROM archives WHERE id = ANY($1) RETURNING id',
          [ids]
        );
        res.json({ 
          message: `Deleted ${deleteResult.rows.length} archives`,
          deletedIds: deleteResult.rows.map(row => row.id)
        });
        break;

      case 'update_categories':
        if (!data || !data.error_categories) {
          return res.status(400).json({ error: 'error_categories required for bulk update' });
        }
        const updateResult = await pool.query(
          `UPDATE archives 
           SET error_categories = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ANY($2) 
           RETURNING id`,
          [JSON.stringify(data.error_categories), ids]
        );
        res.json({ 
          message: `Updated ${updateResult.rows.length} archives`,
          updatedIds: updateResult.rows.map(row => row.id)
        });
        break;

      default:
        res.status(400).json({ error: 'Unsupported bulk operation' });
    }
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({ error: 'Failed to perform bulk operation' });
  }
});

// Export endpoint for data backup
app.get('/export', async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const limit = parseInt(req.query.limit) || null;
    
    let query = 'SELECT * FROM archives ORDER BY created_at DESC';
    const params = [];
    
    if (limit) {
      query += ' LIMIT $1';
      params.push(limit);
    }

    const result = await pool.query(query, params);

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(result.rows[0] || {});
      const csvData = [
        headers.join(','),
        ...result.rows.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return `"${String(value || '').replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="archives_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="archives_${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportedAt: new Date().toISOString(),
        count: result.rows.length,
        archives: result.rows
      });
    }
  } catch (error) {
    console.error('Error exporting archives:', error);
    res.status(500).json({ error: 'Failed to export archives' });
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