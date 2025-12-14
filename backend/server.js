const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Test koneksi database
testConnection();

// ==================== ROUTES ====================

// 1. GET /tasks - Get semua tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT * FROM tasks';
        const params = [];

        if (status && (status === 'pending' || status === 'completed')) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY deadline ASC, dibuat DESC';

        const [rows] = await pool.query(query, params);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
});

// 2. POST /tasks - Tambah task baru
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description, deadline } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const query = `
            INSERT INTO tasks (title, description, deadline) 
            VALUES (?, ?, ?)
        `;
        const [result] = await pool.query(query, [title.trim(), description || null, deadline || null]);

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            taskId: result.insertId
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task'
        });
    }
});

// 3. PUT /tasks/:id - Update task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, deadline } = req.body;

        // Cek apakah task exist
        const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Update fields
        const updateFields = [];
        const updateValues = [];

        if (title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(title.trim());
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        if (deadline !== undefined) {
            updateFields.push('deadline = ?');
            updateValues.push(deadline);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(id);
        const query = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;

        await pool.query(query, updateValues);

        res.json({
            success: true,
            message: 'Task updated successfully'
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task'
        });
    }
});

// 4. DELETE /tasks/:id - Hapus task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task'
        });
    }
});

// 5. PATCH /tasks/:id/toggle - Toggle status
app.patch('/api/tasks/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query(
            'UPDATE tasks SET status = IF(status = "pending", "completed", "pending") WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task status toggled successfully'
        });
    } catch (error) {
        console.error('Error toggling task status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle task status'
        });
    }
});

// Route untuk testing
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// Test database connection endpoint
app.get('/api/db-status', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks LIMIT 5');
        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM tasks');

        res.json({
            success: true,
            message: 'Database is connected',
            database: process.env.DB_NAME,
            totalTasks: countResult[0].total,
            sampleTasks: rows,
            serverTime: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   GET  http://localhost:${PORT}/api/tasks`);
    console.log(`   POST http://localhost:${PORT}/api/tasks`);
    console.log(`   GET  http://localhost:${PORT}/api/test`);
});