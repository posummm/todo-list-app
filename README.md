# Todo List Application

Aplikasi Todo List dengan fitur CRUD lengkap menggunakan React.js, Node.js, dan MySQL.

## Fitur
- Tambah tugas baru
- Lihat daftar tugas
- Edit tugas
- Hapus tugas
- Ubah status (pending/completed)
- Filter berdasarkan status

## Teknologi yang Digunakan
### Frontend
- React.js v18.2.0      // UI Library
- React Icons           // Icon library
- date-fns             // Date formatting
- Axios                // HTTP client
- CSS3                 // Modern CSS features (Grid, Flexbox, Animations)

### Backend
- Node.js              // Runtime environment
- Express.js           // Web framework
- MySQL2              // Database driver
- CORS                 // Cross-origin resource sharing
- dotenv              // Environment variables

### Database
- MySQL                // Relational Database Management System
- ujian_pweb          // Database name
- tasks               // Main table for todo items

### Tools
- Git                  // Version control
- npm                  // Package manager 

## Struktur Project
todo/
├── frontend/                 # React Application
│   ├── src/
│   │   ├── App.js           # Main component
│   │   ├── App.css          # All styles
│   │   └── index.js         # Entry point
│   ├── public/
│   └── package.json
│
└── backend/                  # Node.js API Server
    ├── server.js            # Express server
    ├── db.js               # Database connection
    ├── .env                # Environment variables
    └── package.json

## Cara Menjalankan

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Database
1. Import database.sql ke MySQL
2. Konfigurasi koneksi di backend/.env