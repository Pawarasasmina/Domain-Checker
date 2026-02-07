# Quick Start Guide

## ⚡ Fast Setup (5 Minutes)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

### 2. Setup Environment Files

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/domain-dashboard
JWT_SECRET=your-secret-key-min-32-chars-long-please-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start MongoDB

```bash
# Windows
net start MongoDB

# Or manually
mongod
```

### 4. Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Login

Open browser: `http://localhost:3000`

```
Email: admin@example.com
Password: admin123
```

## 🎯 First Steps After Login

1. **Change default password** (Profile settings)
2. **Add a brand** (Brands page → Add Brand)
3. **Add domains** (Money Sites → Add Domain)
4. **Add users** (Users page → Add User)

## 🔧 Blocked Domain Checker Integration

If you have your local blocked domain checker running:

1. Update backend `.env`:
   ```env
   CHECKER_WEBSOCKET_URL=ws://localhost:YOUR_PORT
   ```

2. Ensure your checker sends messages in this format:
   ```json
   {
     "type": "blocked_domain",
     "domain": "example.com",
     "blockedId": "id-123",
     "status": "blocked"
   }
   ```

3. Restart backend server

That's it! Real-time Nawala updates will work automatically.

## 🐛 Quick Troubleshooting

**MongoDB Connection Failed?**
```bash
# Check if MongoDB is running
mongod --version
net start MongoDB
```

**Port Already in Use?**
```bash
# Change ports in .env files
# Backend: PORT=5001
# Frontend: (vite will auto-select available port)
```

**CORS Errors?**
```bash
# Make sure CORS_ORIGIN in backend .env matches frontend URL
```

## 📱 Access Dashboard

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health:** http://localhost:5000/health

## 🚀 Ready to Go!

Your Domain Management Dashboard is now ready to use!

For detailed documentation, see [README.md](README.md)
