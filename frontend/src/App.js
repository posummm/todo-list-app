import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import './App.css';

function App() {
    const [allTasks, setAllTasks] = useState([]); // SEMUA tasks dari database
    const [displayTasks, setDisplayTasks] = useState([]); // Tasks yang ditampilkan (setelah filter)
    const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [dbStatus, setDbStatus] = useState('');

    // API Base URL
    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        checkBackendConnection();
        fetchAllTasks(); // Fetch SEMUA tasks
    }, []);

    // Update displayTasks ketika filter atau allTasks berubah
    useEffect(() => {
        if (filter === 'all') {
            setDisplayTasks(allTasks);
        } else {
            setDisplayTasks(allTasks.filter(task => task.status === filter));
        }
    }, [filter, allTasks]);

    const checkBackendConnection = async () => {
        try {
            const response = await axios.get(`${API_URL}/test`);
            if (response.data.success) {
                setDbStatus(`Backend connected (${response.data.database || 'API ready'})`);
            }
        } catch (error) {
            setDbStatus('Backend not connected');
            console.error('Backend connection failed:', error);
        }
    };

    // Fetch SEMUA tasks (tanpa filter)
    const fetchAllTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/tasks`);
            if (response.data.success) {
                setAllTasks(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert('Failed to fetch tasks. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    // Add task
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) {
            alert('Task title is required!');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/tasks`, newTask);
            if (response.data.success) {
                setNewTask({ title: '', description: '', deadline: '' });
                fetchAllTasks(); // Refresh semua tasks
            }
        } catch (error) {
            console.error('Error adding task:', error);
            alert('Failed to add task');
        }
    };

    // Toggle status
    const handleToggleStatus = async (id) => {
        try {
            await axios.patch(`${API_URL}/tasks/${id}/toggle`);
            fetchAllTasks(); // Refresh semua tasks
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    // Delete task
    const handleDeleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;

        try {
            await axios.delete(`${API_URL}/tasks/${id}`);
            fetchAllTasks(); // Refresh semua tasks
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task');
        }
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    // Hitung statistik dari SEMUA tasks
    const taskStats = {
        total: allTasks.length,
        pending: allTasks.filter(t => t.status === 'pending').length,
        completed: allTasks.filter(t => t.status === 'completed').length
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <h1>Pengingat Tugas</h1>
                <div className="header-stats">
                    <span className="stat total">Total: {taskStats.total}</span>
                    <span className="stat pending">Pending: {taskStats.pending}</span>
                    <span className="stat completed">Completed: {taskStats.completed}</span>
                </div>
            </header>

            {/* Main Container */}
            <main className="container">
                {/* Add Task Section */}
                <section className="add-task-section">
                    <h2>Tambah Tugas Baru</h2>
                    <form onSubmit={handleAddTask} className="task-form">
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Judul Tugas *"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                placeholder="Deskripsi Tugas (optional)"
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label>Deadline:</label>
                            <input
                                type="date"
                                value={newTask.deadline}
                                onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-add">
                            Tambah Tugas
                        </button>
                    </form>
                </section>

                {/* Filter Section */}
                <section className="filter-section">
                    <h3>Filter Tugas:</h3>
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Semua ({taskStats.total})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                            onClick={() => setFilter('pending')}
                        >
                            Belum Selesai ({taskStats.pending})
                        </button>
                        <button
                            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Selesai ({taskStats.completed})
                        </button>
                    </div>
                    <div className="filter-info">
                        Menampilkan: {displayTasks.length} dari {taskStats.total} tugas
                    </div>
                </section>

                {/* Tasks List */}
                <section className="tasks-section">
                    <div className="section-header">
                        <h2>Daftar Tugas {filter !== 'all' ? `(${filter})` : ''}</h2>
                        <button
                            onClick={fetchAllTasks}
                            className="btn btn-refresh"
                            disabled={loading}
                        >
                            {loading ? 'Memuat...' : '🔄 Refresh'}
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <p>Memuat tugas...</p>
                        </div>
                    ) : displayTasks.length === 0 ? (
                        <div className="empty-state">
                            <p>Tidak ada tugas ditemukan!</p>
                            <p className="empty-subtitle">
                                {filter === 'all'
                                    ? 'Tambahkan tugas pertama Anda di atas.'
                                    : `Tidak ada tugas dengan status "${filter}". Coba filter lain.`}
                            </p>
                        </div>
                    ) : (
                        <div className="tasks-list">
                            {displayTasks.map(task => (
                                <div key={task.id} className={`task-card ${task.status}`}>
                                    <div className="task-content">
                                        <div className="task-header">
                                            <div className="task-title-wrapper">
                                                <h3 className={task.status === 'completed' ? 'completed' : ''}>
                                                    {task.title}
                                                </h3>
                                                <span className={`status-badge ${task.status}`}>
                                                    {task.status === 'pending' ? 'Belum Selesai' : 'Selesai'}
                                                </span>
                                            </div>
                                            <div className="task-actions">
                                                <button
                                                    className={`btn-status ${task.status === 'pending' ? 'btn-complete' : 'btn-undo'}`}
                                                    onClick={() => handleToggleStatus(task.id)}
                                                >
                                                    {task.status === 'pending' ? '✓ Tandai Selesai' : '↻ Batalkan Selesai'}
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>

                                        {task.description && (
                                            <p className="task-description">{task.description}</p>
                                        )}

                                        <div className="task-footer">
                                            <div className="task-dates">
                                                <span className="deadline">
                                                    <strong>📅 Deadline:</strong> {formatDate(task.deadline)}
                                                    {task.deadline && new Date(task.deadline) < new Date() && task.status === 'pending' && (
                                                        <span className="overdue-badge"> ⚠️ Terlambat</span>
                                                    )}
                                                </span>
                                                <span className="created">
                                                    <strong>🕐 Dibuat:</strong> {format(new Date(task.dibuat), 'dd/MM/yyyy HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>
                    Total Tugas: {taskStats.total} •
                    Belum Selesai: {taskStats.pending} •
                    Selesai: {taskStats.completed}
                </p>
                <p className="footer-info">
                    Filter aktif: {filter === 'all' ? 'Semua' : filter} •
                    Ditampilkan: {displayTasks.length} tugas •
                    Terakhir diperbarui: {new Date().toLocaleTimeString()}
                </p>
            </footer>
        </div>
    );
}

export default App;