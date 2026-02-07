# Domain Management Dashboard - Complete Guide

## 🚀 Project Overview

A full-stack **MERN** application for managing domains with real-time blocked domain checking integration.

### Features

✅ **Role-Based Authentication**
- Admin: Full CRUD access (Brands, Domains, Users)
- User: View-only access to domains

✅ **Brand Management**
- Create, edit, delete brands
- Color-coded brand system
- Brand assignment to domains

✅ **Domain Management**
- Add, edit, delete domains
- Real-time status monitoring
- Nawala (blocked domain) integration
- Domain filtering and search

✅ **User Management** (Admin Only)
- Add/remove users
- Role assignment
- User activation/deactivation

✅ **Real-Time Updates**
- WebSocket integration with blocked domain checker
- Live Nawala status updates
- Real-time domain monitoring

---

## 📁 Project Structure

```
Domain Dashboard/
├── backend/                    # Node.js + Express Backend
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── seed.js            # Default admin creation
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── brandController.js # Brand CRUD
│   │   └── domainController.js # Domain CRUD
│   ├── middleware/
│   │   ├── auth.js            # JWT & role-based auth
│   │   ├── errorHandler.js    # Error handling
│   │   └── validation.js      # Input validation
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Brand.js           # Brand schema
│   │   └── Domain.js          # Domain schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── brandRoutes.js     # Brand endpoints
│   │   └── domainRoutes.js    # Domain endpoints
│   ├── utils/
│   │   └── blockedDomainChecker.js # WebSocket client
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Main entry point
│
└── frontend/                   # React + Vite Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx     # Main layout wrapper
    │   │   ├── Sidebar.jsx    # Navigation sidebar
    │   │   └── ProtectedRoute.jsx # Route guard
    │   ├── context/
    │   │   └── AuthContext.jsx # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx      # Login page
    │   │   ├── Home.jsx       # Dashboard home
    │   │   ├── Domains.jsx    # Domain management
    │   │   ├── Brands.jsx     # Brand management
    │   │   └── Users.jsx      # User management
    │   ├── utils/
    │   │   ├── axios.js       # API client
    │   │   └── socket.js      # Socket.IO client
    │   ├── App.jsx            # Main app component
    │   ├── main.jsx           # App entry point
    │   └── index.css          # Global styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   copy .env.example .env
   ```

4. **Configure `.env`:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/domain-dashboard
   JWT_SECRET=your-super-secret-key-change-this
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   CHECKER_WEBSOCKET_URL=ws://localhost:8080
   CHECKER_API_URL=http://localhost:8080/api
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   ```

5. **Start MongoDB:**
   ```bash
   # Windows (if MongoDB is installed as service)
   net start MongoDB
   
   # Or run manually
   mongod --dbpath "C:\path\to\data\db"
   ```

6. **Start backend server:**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   copy .env.example .env
   ```

4. **Configure `.env`:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Start frontend development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

---

## 🔐 Default Login Credentials

```
Email: admin@example.com
Password: admin123
```

**⚠️ IMPORTANT:** Change these credentials immediately after first login!

---

## 🔌 Blocked Domain Checker Integration

### How It Works

1. Your existing blocked domain checker system runs independently (on local machine)
2. This dashboard connects to it via WebSocket
3. When a domain is detected as blocked, the checker sends a message
4. The dashboard receives it and updates the database + UI in real-time

### Expected Message Format

Your blocked domain checker should send WebSocket messages in this format:

```json
{
  "type": "blocked_domain",
  "domain": "example.com",
  "blockedId": "unique-id-123",
  "status": "blocked"
}
```

### Integration Steps

1. **Configure WebSocket URL** in backend `.env`:
   ```env
   CHECKER_WEBSOCKET_URL=ws://your-checker-host:port
   ```

2. **Backend automatically connects** on startup

3. **Real-time updates flow:**
   ```
   Blocked Domain Checker (Local)
   ↓ WebSocket Message
   Backend Server
   ↓ Socket.IO Event
   Frontend Dashboard
   ↓ UI Update
   ```

### If Checker System is Not Available

The dashboard will continue to work normally. You can:
- Manually add domains
- View all domains
- The Nawala column will show "unknown" status

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public* | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| GET | `/api/auth/users` | Admin | Get all users |
| PUT | `/api/auth/users/:id` | Admin | Update user |
| DELETE | `/api/auth/users/:id` | Admin | Delete user |

\* In production, only admins should register users

### Brands

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/brands` | Private | Get all brands |
| GET | `/api/brands/:id` | Private | Get brand by ID |
| POST | `/api/brands` | Admin | Create brand |
| PUT | `/api/brands/:id` | Admin | Update brand |
| DELETE | `/api/brands/:id` | Admin | Delete brand |

### Domains

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/domains` | Private | Get all domains |
| GET | `/api/domains/:id` | Private | Get domain by ID |
| POST | `/api/domains` | Admin | Create domain |
| PUT | `/api/domains/:id` | Admin | Update domain |
| PATCH | `/api/domains/:id/status` | Admin | Update domain status |
| DELETE | `/api/domains/:id` | Admin | Delete domain |

---

## 🔒 Security Features

### Implemented Security

1. **JWT Authentication**
   - Secure token-based auth
   - Token expiration (7 days)
   - Automatic token refresh

2. **Role-Based Access Control (RBAC)**
   - Admin: Full access
   - User: Read-only access

3. **Input Validation**
   - Server-side validation with express-validator
   - Domain name validation
   - Email format validation

4. **Security Headers**
   - Helmet.js for HTTP headers
   - CORS protection
   - Rate limiting (100 req/15min)

5. **Password Security**
   - Bcrypt hashing (10 rounds)
   - Passwords never exposed in responses

6. **Error Handling**
   - Centralized error handler
   - No sensitive data in error messages
   - Different messages for dev/prod

### Additional Security Recommendations

1. **Use HTTPS in production**
2. **Set strong JWT_SECRET** (min 32 characters)
3. **Enable MongoDB authentication**
4. **Set up firewall rules**
5. **Regular security updates**
6. **Implement rate limiting per user**
7. **Add request logging**
8. **Set up monitoring alerts**

---

## 🚀 Deployment

### Backend Deployment (Example: VPS/Cloud Server)

1. **Install Node.js and MongoDB on server**

2. **Clone and setup:**
   ```bash
   cd /var/www
   git clone your-repo
   cd domain-dashboard/backend
   npm install --production
   ```

3. **Configure environment:**
   ```bash
   nano .env
   # Set production values
   NODE_ENV=production
   MONGODB_URI=mongodb://localhost:27017/domain-dashboard
   # etc...
   ```

4. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name domain-dashboard
   pm2 startup
   pm2 save
   ```

5. **Setup Nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Frontend Deployment (Example: Netlify/Vercel)

1. **Build for production:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy `dist` folder** to:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Your own web server

3. **Update environment variables** in deployment platform

### Database Backup

```bash
# Create backup
mongodump --db domain-dashboard --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db domain-dashboard /backup/20260207/domain-dashboard
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Access protected route without token
- [ ] Token expiration handling

#### Brand Management (Admin)
- [ ] Create new brand
- [ ] Edit brand
- [ ] Delete brand (should fail if has domains)
- [ ] View all brands

#### Domain Management
- [ ] Admin can create domain
- [ ] Admin can edit domain
- [ ] Admin can delete domain
- [ ] User can only view domains
- [ ] Search domains
- [ ] Filter by brand
- [ ] Real-time updates work

#### User Management (Admin)
- [ ] Create new user
- [ ] Edit user
- [ ] Delete user
- [ ] Toggle user status
- [ ] Cannot delete self

---

## 🐛 Troubleshooting

### Backend won't start

**Problem:** `Error: connect ECONNREFUSED`
**Solution:** Make sure MongoDB is running

**Problem:** `JWT_SECRET is not defined`
**Solution:** Create `.env` file from `.env.example`

### Frontend won't connect to backend

**Problem:** CORS errors
**Solution:** Check `CORS_ORIGIN` in backend `.env` matches frontend URL

**Problem:** API calls fail with 401
**Solution:** Clear browser localStorage and login again

### Real-time updates not working

**Problem:** Socket connection fails
**Solution:** 
1. Check `VITE_SOCKET_URL` in frontend `.env`
2. Ensure backend WebSocket server is running
3. Check browser console for connection errors

### Blocked domain checker not connecting

**Problem:** WebSocket connection refused
**Solution:**
1. Verify checker system is running
2. Check `CHECKER_WEBSOCKET_URL` in backend `.env`
3. Ensure firewall allows connection
4. System will work without checker (manual updates only)

---

## 📝 Development Tips

### Adding New Features

1. **Backend:**
   - Create model in `models/`
   - Create controller in `controllers/`
   - Create routes in `routes/`
   - Add middleware if needed
   - Test with Postman/Thunder Client

2. **Frontend:**
   - Create page in `pages/`
   - Add route in `App.jsx`
   - Create API calls in page component
   - Update navigation in `Sidebar.jsx`

### Code Style

- Use **camelCase** for variables and functions
- Use **PascalCase** for components
- Always handle errors with try-catch
- Add loading states for async operations
- Show user feedback with toast notifications

---

## 📚 Tech Stack Details

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Validator** - Input validation

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

---

## 🤝 Support

### Common Questions

**Q: Can I use this with PostgreSQL instead of MongoDB?**
A: Yes, but you'll need to rewrite the models using Sequelize or TypeORM

**Q: How do I add more roles?**
A: Update the User model enum, add middleware checks, and update frontend

**Q: Can I customize the dashboard design?**
A: Yes! Edit Tailwind classes and `index.css`

**Q: How do I integrate my specific blocked domain checker?**
A: Update the message format in `blockedDomainChecker.js` to match your system

---

## 📄 License

This project is provided as-is for your use.

---

## ✅ Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment variables
3. ✅ Start MongoDB
4. ✅ Run backend server
5. ✅ Run frontend server
6. ✅ Login with default credentials
7. ✅ Change default password
8. ✅ Add your first brand
9. ✅ Add your first domain
10. ✅ Configure blocked domain checker integration

---

**Happy Managing! 🚀**
"# Domain-Checker" 
