# Inventa - Where Ownership Begins

A secure intellectual property document protection and ownership verification system built with React, TypeScript, and Web Crypto API.

![Inventa](https://img.shields.io/badge/Inventa-IP%20Protection-orange)
![Security](https://img.shields.io/badge/Security-SHA--256%20%7C%20AES--GCM%20%7C%20ECC-red)
![License](https://img.shields.io/badge/License-MIT-green)

## 🔥 Features

### Authentication Module
- ✅ User registration with automatic ECC key pair generation
- ✅ Secure password hashing using SHA-256
- ✅ Token-based session authentication
- ✅ Protected routes for authenticated users

### Document Registration
- ✅ Upload any document type
- ✅ Generate SHA-256 cryptographic hash (document fingerprint)
- ✅ Encrypt document using AES-256-GCM
- ✅ Generate secure timestamp for proof of origin
- ✅ Sign ownership claim with user's ECC private key
- ✅ Store encrypted file and metadata securely

### Ownership Verification
- ✅ Verify by re-uploading original file
- ✅ Verify by entering document hash directly
- ✅ Compare hashes with stored records
- ✅ Display ownership proof without exposing file contents
- ✅ Show owner's public key and digital signature

### Proof Generation
- ✅ Generate verifiable ownership proof
- ✅ Include document hash, timestamp, and owner identifier
- ✅ Cryptographically signed proofs
- ✅ Downloadable proof certificates

## 🔐 Security Architecture

### Cryptographic Algorithms

| Purpose | Algorithm | Specification |
|---------|-----------|---------------|
| Document Hashing | SHA-256 | 256-bit digest |
| Document Encryption | AES-GCM | 256-bit key, 96-bit IV |
| Ownership Binding | ECDSA | P-256 curve |
| Password Hashing | SHA-256 | 256-bit digest |

### Security Features

1. **Client-Side Encryption**: All cryptographic operations happen in the browser using Web Crypto API
2. **Zero-Knowledge Storage**: Original documents are encrypted; only hashes are used for verification
3. **Tamper-Evident**: Any modification to a document changes its hash, invalidating the proof
4. **Non-Repudiation**: ECDSA signatures prove ownership without revealing private keys

## 🎨 Color Palette

Inventa uses a warm, professional color scheme:

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Orange | `#ff4000` | Main actions, buttons |
| Light Orange | `#ff9966` | Highlights, accents |
| Dark Maroon | `#800000` | Dark accents, shadows |
| Light Gray | `#b3b3b3` | Secondary text |

## 📡 API Endpoints

The application simulates a Flask-like REST API architecture:

```
POST /api/register     - Register new user with ECC key generation
POST /api/login        - Authenticate user and create session
POST /api/upload       - Upload and encrypt document
POST /api/verify       - Verify document ownership
GET  /api/documents    - Get user's registered documents
GET  /api/proof/:id    - Generate ownership proof for document
```

## 🏗️ Project Structure

```
src/
├── App.tsx                 # Main app with routing
├── main.tsx               # Entry point
├── index.css              # Global styles with Inventa colors
├── components/
│   └── Navbar.tsx         # Navigation component
├── context/
│   └── AuthContext.tsx    # Authentication state management
├── pages/
│   ├── Landing.tsx        # Landing page with branding
│   ├── Login.tsx          # User login
│   ├── Register.tsx       # User registration
│   ├── Dashboard.tsx      # User dashboard
│   ├── Upload.tsx         # Document upload
│   └── Verify.tsx         # Document verification
├── services/
│   ├── api.ts             # API simulation layer
│   ├── crypto.ts          # Cryptographic operations
│   └── storage.ts         # Data persistence (TinyDB simulation)
├── types/
│   └── index.ts           # TypeScript type definitions
└── utils/
    └── cn.ts              # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 💻 Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Router 6** - Navigation
- **Lucide React** - Icons

### Security
- **Web Crypto API** - Native browser cryptography
- **SHA-256** - Document hashing
- **AES-GCM** - Symmetric encryption
- **ECDSA P-256** - Digital signatures

### Storage
- **localStorage** - Client-side persistence (simulates TinyDB)

## 📋 Usage Guide

### 1. Create an Account

1. Click "Get Started" on the landing page
2. Enter username, email, and password
3. An ECC key pair is automatically generated for you
4. Your private key is used to sign ownership proofs

### 2. Upload a Document

1. Log in to your account
2. Go to "Upload Document"
3. Drag and drop or select a file
4. The system will:
   - Compute SHA-256 hash
   - Encrypt with AES-256-GCM
   - Sign with your ECC private key
   - Store with secure timestamp

### 3. Verify Ownership

1. Go to "Verify Document" (no login required)
2. Either upload a file or enter its SHA-256 hash
3. The system checks against registered documents
4. If found, displays owner details and proof

### 4. Generate Proof

1. From Dashboard, click "View Proof" on any document
2. Download the cryptographic proof certificate
3. Share the proof to verify ownership

## 🔧 API Integration Examples

### Register User
```typescript
import { register } from './services/api';

const result = await register({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'securepassword123',
  confirmPassword: 'securepassword123'
});

if (result.success) {
  console.log('User created:', result.data.user);
}
```

### Upload Document
```typescript
import { uploadDocument } from './services/api';

const file = new File(['content'], 'document.txt');
const result = await uploadDocument(file);

if (result.success) {
  console.log('Document hash:', result.data.document.originalHash);
  console.log('Timestamp:', result.data.document.timestamp);
}
```

### Verify Document
```typescript
import { verifyDocument } from './services/api';

// By file
const resultByFile = await verifyDocument({ file: myFile });

// By hash
const resultByHash = await verifyDocument({ 
  hash: '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b' 
});

if (result.data.verified) {
  console.log('Owner:', result.data.owner.username);
}
```

### Generate Proof
```typescript
import { generateProof } from './services/api';

const result = await generateProof(documentId);

if (result.success) {
  console.log('Proof signature:', result.data.proof.signature);
}
```

## 🛠️ Flask Backend Reference

For production deployment, replace the simulated API with Flask endpoints:

```python
from flask import Flask, request, jsonify
from tinydb import TinyDB

app = Flask(__name__)
db = TinyDB('inventa.json')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    # Implement registration logic
    return jsonify({'success': True})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    # Implement login logic
    return jsonify({'success': True, 'token': 'jwt_token'})

@app.route('/api/upload', methods=['POST'])
def upload():
    file = request.files['document']
    # Implement upload logic
    return jsonify({'success': True})

@app.route('/api/verify', methods=['POST'])
def verify():
    data = request.json
    # Implement verification logic
    return jsonify({'success': True, 'verified': True})

@app.route('/api/documents', methods=['GET'])
def get_documents():
    # Return user's documents
    return jsonify({'success': True, 'documents': []})

@app.route('/api/proof/<document_id>', methods=['GET'])
def get_proof(document_id):
    # Generate and return proof
    return jsonify({'success': True, 'proof': {}})
```

## 📜 License

MIT License - Feel free to use this project for learning and production purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Inventa** - *Where Ownership Begins*

Built with 🔥 for creators and innovators protecting their intellectual property.
