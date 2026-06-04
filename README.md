# 🔍🛡️ Inventa - Intellectual Property Protection System

**Ownership Begins Here**

A secure intellectual property document protection and ownership verification system that allows users to register, upload, and cryptographically prove ownership of their documents.

## ✨ Features

- **User Authentication** - Secure registration with automatic ECC key pair generation
- **Document Registration** - Upload and register documents with SHA-256 hashing
- **AES-256 Encryption** - Military-grade encryption for stored documents
- **ECC Digital Signatures** - Cryptographic ownership binding with ECDSA
- **Ownership Verification** - Verify documents by file upload or hash
- **Proof Generation** - Downloadable ownership certificates
- **Login Analytics** - Track user logins and system activity

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **React Router 6** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Flask 3.0** - Python web framework
- **TinyDB** - Document-based database
- **Flask-JWT-Extended** - JWT authentication
- **Cryptography** - ECC and AES encryption

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ (for frontend)
- **Python** 3.9+ (for backend)

---

## 📦 Backend Setup (Flask + TinyDB)

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Create virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create environment file
```bash
cp .env.example .env
# Edit .env with your secret keys
```

### 5. Run the server
```bash
python run.py
```

The backend will be available at: `http://localhost:5000`

---

## 🌐 Frontend Setup (React + Vite)

### 1. Install dependencies
```bash
npm install
```

### 2. Create environment file
```bash
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
```

### 3. Run development server
```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

### 4. Build for production
```bash
npm run build
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | User login |
| GET | `/api/me` | Get current user |
| POST | `/api/refresh` | Refresh token |
| POST | `/api/logout` | User logout |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload document |
| GET | `/api/documents` | Get user's documents |
| GET | `/api/proof/<id>` | Get ownership proof |
| GET | `/api/download/<id>` | Download document |
| POST | `/api/verify` | Verify document |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Database statistics |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/documents` | All documents |
| GET | `/api/admin/login-history` | Login history |
| GET | `/api/admin/export` | Export database |

---

## 🔐 Security Implementation

| Feature | Algorithm | Purpose |
|---------|-----------|---------|
| Document Hashing | SHA-256 | Unique document fingerprint |
| File Encryption | AES-256-GCM | Secure document storage |
| Ownership Binding | ECDSA P-256 | Digital signatures |
| Password Hashing | SHA-256 | Credential security |
| Authentication | JWT | Stateless auth tokens |

---

## 📁 Project Structure

```
inventa/
├── backend/
│   ├── app.py              # Flask application
│   ├── config.py           # Configuration
│   ├── run.py              # Development runner
│   ├── wsgi.py             # Production entry
│   ├── requirements.txt    # Python dependencies
│   ├── .env.example        # Environment template
│   ├── routes/
│   │   ├── auth.py         # Auth endpoints
│   │   ├── documents.py    # Document endpoints
│   │   └── admin.py        # Admin endpoints
│   └── utils/
│       ├── crypto.py       # Cryptography
│       └── database.py     # TinyDB wrapper
│
├── src/
│   ├── App.tsx             # Main app
│   ├── main.tsx            # Entry point
│   ├── index.css           # Global styles
│   ├── components/
│   │   ├── Navbar.tsx      # Navigation
│   │   └── ShieldSearchIcon.tsx  # Logo
│   ├── context/
│   │   └── AuthContext.tsx # Auth state
│   ├── pages/
│   │   ├── Landing.tsx     # Home page
│   │   ├── Login.tsx       # Login
│   │   ├── Register.tsx    # Registration
│   │   ├── Dashboard.tsx   # User dashboard
│   │   ├── Upload.tsx      # Document upload
│   │   ├── Verify.tsx      # Verification
│   │   └── Database.tsx    # Admin view
│   ├── services/
│   │   ├── api.ts          # API client
│   │   └── crypto.ts       # Client crypto
│   └── types/
│       └── index.ts        # TypeScript types
│
├── index.html              # HTML template
├── package.json            # Node dependencies
├── vite.config.ts          # Vite config
└── README.md               # This file
```

---

## 📋 Document Metadata

When uploading a document, users provide:

| Field | Required | Description |
|-------|----------|-------------|
| Owner Name | ✅ | Legal name of document owner |
| Description | ✅ | Document description |
| Document Type | ✅ | audio, video, image, pdf, article, other |
| Work Type | ✅ | human_made or ai_generated |
| Proof of Work | ❌ | Evidence of creation |

---

## 🌍 Deployment

### Backend (Gunicorn)
```bash
cd backend
gunicorn wsgi:app -w 4 -b 0.0.0.0:5000
```

### Frontend (Static)
```bash
npm run build
# Serve the dist folder with nginx or any static server
```

### Environment Variables

**Backend (.env)**:
```env
FLASK_ENV=production
SECRET_KEY=your-production-secret
JWT_SECRET_KEY=your-jwt-secret
DATABASE_PATH=data/inventa_db.json
CORS_ORIGINS=https://yourdomain.com
```

**Frontend (.env.local)**:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 📊 Database Viewer

Access the admin database viewer at `/database` to:
- View login analytics
- Monitor user registrations
- Track document uploads
- Export database as JSON

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

**Built with ❤️ by Inventa Team**

*Where Ownership Begins*
