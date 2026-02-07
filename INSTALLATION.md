# Installation Commands - Copy & Paste

## Step 1: Backend Setup

### Navigate to backend and install
```bash
cd "d:\.Port City\Domain Dashboard\backend"
npm install
```

### Create .env file
```bash
copy .env.example .env
```

### Edit .env file (important!)
```
notepad .env
```

Paste this configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/domain-dashboard
JWT_SECRET=super-secret-jwt-key-please-change-this-min-32-chars
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

Save and close.

---

## Step 2: Frontend Setup

### Navigate to frontend and install
```bash
cd "d:\.Port City\Domain Dashboard\frontend"
npm install
```

### Create .env file
```bash
copy .env.example .env
```

### Edit .env file
```bash
notepad .env
```

Paste this configuration:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Save and close.

---

## Step 3: Start MongoDB

### Check if MongoDB is running
```bash
mongod --version
```

### Start MongoDB (choose one method)

**Method 1: As Windows Service**
```bash
net start MongoDB
```

**Method 2: Manual Start**
```bash
mongod --dbpath "C:\data\db"
```

---

## Step 4: Run the Application

### Terminal 1 - Backend
```bash
cd "d:\.Port City\Domain Dashboard\backend"
npm run dev
```

Wait for:
```
✓ MongoDB Connected
✓ Server running on port 5000
✓ Default admin user created
```

### Terminal 2 - Frontend
```bash
cd "d:\.Port City\Domain Dashboard\frontend"
npm run dev
```

Wait for:
```
VITE ready in XXXms
Local: http://localhost:3000
```

---

## Step 5: Access Dashboard

Open browser: **http://localhost:3000**

Login with:
```
Email: admin@example.com
Password: admin123
```

---

## Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] Can login to dashboard
- [ ] Can see Home page
- [ ] Can access Money Sites page
- [ ] Can access Brands page
- [ ] Can access Users page (admin only)

---

## If Something Goes Wrong

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend won't start
```bash
# Vite will automatically use next available port
# Just follow the terminal output
```

### MongoDB connection error
```bash
# Install MongoDB if not installed
# Download from: https://www.mongodb.com/try/download/community

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in backend/.env to Atlas connection string
```

### Module not found errors
```bash
# Clear cache and reinstall
cd backend
rmdir /s /q node_modules
npm install

cd frontend
rmdir /s /q node_modules
npm install
```

---

## Next Steps After Installation

1. ✅ Change default admin password
2. ✅ Create your first brand
3. ✅ Add some domains
4. ✅ Add more users
5. ✅ Configure blocked domain checker (see INTEGRATION.md)

---

## Production Build Commands

### Build Frontend
```bash
cd "d:\.Port City\Domain Dashboard\frontend"
npm run build
```

Output will be in `frontend/dist/`

### Run Backend in Production
```bash
cd "d:\.Port City\Domain Dashboard\backend"
npm start
```

---

## Useful Development Commands

### Backend
```bash
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production mode
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Environment Variables Quick Reference

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time
- `CORS_ORIGIN` - Allowed frontend origin
- `CHECKER_WEBSOCKET_URL` - Blocked checker WebSocket URL (optional)
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password

### Frontend (.env)
- `VITE_API_URL` - Backend API base URL
- `VITE_SOCKET_URL` - Socket.IO server URL

---

## Support

For detailed documentation, see:
- [README.md](README.md) - Complete guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [INTEGRATION.md](INTEGRATION.md) - Blocked domain checker integration

---

**Installation Complete! 🎉**
