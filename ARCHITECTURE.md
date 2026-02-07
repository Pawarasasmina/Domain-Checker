# System Architecture - Complete Integration

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    YOUR CHECKING SYSTEM                             │
│                    (Runs on any port)                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  1. Fetch Domains                                            │  │
│  │     GET http://localhost:5000/api/urls                       │  │
│  │                                                               │  │
│  │  2. Check Each Domain                                        │  │
│  │     - DNS check                                              │  │
│  │     - HTTP check                                             │  │
│  │     - Firewall check                                         │  │
│  │     - Your custom logic                                      │  │
│  │                                                               │  │
│  │  3. Report Status                                            │  │
│  │     POST http://localhost:5000/api/urls/update               │  │
│  │     { id: "...", scanResult: { status: "blocked" } }        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              │ HTTP Request
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD BACKEND                                │
│                    (Port 5000)                                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  API Routes                                                   │  │
│  │  ├─ GET  /api/urls          → Return all domains            │  │
│  │  └─ POST /api/urls/update   → Update domain status          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  MongoDB Database                                            │  │
│  │  ├─ Users Collection                                         │  │
│  │  ├─ Brands Collection                                        │  │
│  │  └─ Domains Collection                                       │  │
│  │      └─ nawala: { status, blockedId, lastChecked }         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Socket.IO Server                                            │  │
│  │  └─ Emits: 'domain:nawala-updated'                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
                              │ WebSocket Event
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                                 │
│                    (Port 3000)                                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Socket.IO Client                                            │  │
│  │  └─ Listens: 'domain:nawala-updated'                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UI Updates (Instant)                                        │  │
│  │  ├─ Nawala column updates                                    │  │
│  │  ├─ Icon changes (🔴/🟢)                                     │  │
│  │  └─ Toast notification appears                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  👤 Admin User                   👤 Regular User                    │
│  ├─ Can add/edit domains        ├─ Can view domains                │
│  ├─ Can manage brands           ├─ Can see updates                 │
│  └─ Can manage users            └─ Read-only access                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### 1. Domain Fetching Flow
```
Your Checker
    │
    │ GET /api/urls
    ↓
Backend API
    │
    │ Query MongoDB
    ↓
MongoDB
    │
    │ Return domains
    ↓
Backend API
    │
    │ Format as JSON
    ↓
Your Checker
    │
    └─ Receives: [{ id, brand, Domain, noto }]
```

### 2. Status Update Flow
```
Your Checker
    │
    │ Check domain
    ↓
Domain Status Determined
    │
    │ POST /api/urls/update
    │ { id, scanResult: { status } }
    ↓
Backend API
    │
    │ Validate request
    ↓
Update MongoDB
    │
    │ domain.nawala.status = "ada" or "tidak ada"
    ↓
Emit Socket.IO Event
    │
    │ io.emit('domain:nawala-updated', {...})
    ↓
All Connected Frontends
    │
    ├─ Browser 1: Updates table
    ├─ Browser 2: Updates table
    └─ Browser 3: Updates table
```

---

## 🔄 Real-Time Update Sequence

```
Time: T+0ms
Your Checker: Domain is blocked
Your Checker: Send POST request

Time: T+50ms
Backend: Receive request
Backend: Validate data
Backend: Update database

Time: T+100ms
MongoDB: Record updated
Backend: Emit Socket.IO event

Time: T+150ms
Frontend (User 1): Receive event
Frontend (User 1): Update Nawala column
Frontend (User 1): Show toast notification

Frontend (User 2): Receive event
Frontend (User 2): Update Nawala column
Frontend (User 2): Show toast notification

[All within 150 milliseconds! ⚡]
```

---

## 🎯 Integration Points

### Point 1: Your Checker → Dashboard
```javascript
// Your checking system code
const domains = await axios.get('http://localhost:5000/api/urls');

for (const domain of domains.data) {
  const isBlocked = await yourCheckLogic(domain.Domain);
  
  await axios.post('http://localhost:5000/api/urls/update', {
    id: domain.id,
    scanResult: { status: isBlocked ? 'blocked' : 'accessible' }
  });
}
```

### Point 2: Dashboard → Database
```javascript
// Backend (automatic)
domain.nawala = {
  status: isBlocked ? 'ada' : 'tidak ada',
  blockedId: `scan_${Date.now()}`,
  lastChecked: new Date()
};
await domain.save();
```

### Point 3: Database → Frontend
```javascript
// Backend emits
io.emit('domain:nawala-updated', {
  domainId: domain._id,
  domain: domain.domain,
  nawala: domain.nawala
});

// Frontend listens
socket.on('domain:nawala-updated', (data) => {
  updateDomainInTable(data);
  showToastNotification(data);
});
```

---

## 📡 Network Ports

```
Port 3000: Frontend (React + Vite)
    ↕
Port 5000: Backend (Node.js + Express)
    ↕
Port 27017: MongoDB
    ↕
Port XXXX: Your Checking System
```

All communication:
- Frontend ↔ Backend: HTTP + WebSocket
- Your Checker ↔ Backend: HTTP only
- Backend ↔ MongoDB: MongoDB protocol

---

## 🔐 Security Layers

```
┌─────────────────────────────────────────────┐
│  Frontend                                   │
│  ├─ JWT Token in localStorage              │
│  ├─ Role-based UI rendering                │
│  └─ Protected routes                       │
└────────────┬────────────────────────────────┘
             │ JWT Token in Headers
             ↓
┌─────────────────────────────────────────────┐
│  Backend Middleware                         │
│  ├─ JWT verification                       │
│  ├─ Role checking (admin/user)             │
│  ├─ Input validation                       │
│  └─ Rate limiting                          │
└────────────┬────────────────────────────────┘
             │ Validated Request
             ↓
┌─────────────────────────────────────────────┐
│  Controllers                                │
│  ├─ Business logic                         │
│  ├─ Database operations                    │
│  └─ Socket.IO events                       │
└────────────┬────────────────────────────────┘
             │ MongoDB Queries
             ↓
┌─────────────────────────────────────────────┐
│  MongoDB                                    │
│  ├─ Indexed queries                        │
│  ├─ Data validation                        │
│  └─ Secure storage                         │
└─────────────────────────────────────────────┘
```

Note: Checker API endpoints (/api/urls) are currently public for ease of integration.

---

## 📦 Component Relationships

```
App.jsx
└── AuthProvider
    └── BrowserRouter
        ├── Login (public)
        └── Protected Routes
            └── Layout
                ├── Sidebar
                └── Pages
                    ├── Home
                    ├── Domains (Money Sites)
                    │   ├─ Socket.IO listener
                    │   ├─ Real-time updates
                    │   └─ Toast notifications
                    ├── Brands
                    └── Users (admin only)
```

---

## 🗄️ Database Schema Relationships

```
User
├── _id
├── email (unique)
├── role (admin/user)
└── createdBy → User._id

Brand
├── _id
├── name (unique)
├── code (unique)
└── createdBy → User._id

Domain
├── _id
├── domain (unique)
├── brand → Brand._id
├── nawala
│   ├── status
│   ├── blockedId
│   └── lastChecked
├── createdBy → User._id
└── updatedBy → User._id
```

---

## ⚡ Performance Optimizations

### Backend
- Database indexing on domain, brand, status
- Connection pooling for MongoDB
- Rate limiting to prevent abuse
- Efficient Socket.IO room management

### Frontend
- React component memoization
- Efficient state updates
- Lazy loading of routes
- Optimized bundle size with Vite

### Real-time
- Socket.IO efficient event system
- Only emit to connected clients
- Automatic reconnection handling
- Event debouncing when needed

---

## 🎓 Technology Stack Summary

```
┌─────────────────────────────────────────────┐
│  Frontend Layer                             │
│  ├─ React 18                                │
│  ├─ Vite                                    │
│  ├─ Tailwind CSS                            │
│  ├─ React Router                            │
│  ├─ Axios                                   │
│  ├─ Socket.IO Client                        │
│  └─ React Hot Toast                         │
├─────────────────────────────────────────────┤
│  Backend Layer                              │
│  ├─ Node.js                                 │
│  ├─ Express                                 │
│  ├─ Socket.IO Server                        │
│  ├─ JWT                                     │
│  ├─ Bcrypt                                  │
│  └─ Express Validator                       │
├─────────────────────────────────────────────┤
│  Database Layer                             │
│  ├─ MongoDB                                 │
│  └─ Mongoose                                │
├─────────────────────────────────────────────┤
│  Integration Layer                          │
│  ├─ REST API                                │
│  ├─ WebSocket (Socket.IO)                   │
│  └─ HTTP (for checker)                      │
└─────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture (Production)

```
┌─────────────────────────────────────────────┐
│  Load Balancer / Nginx                      │
│  ├─ SSL/TLS termination                    │
│  ├─ Rate limiting                          │
│  └─ Request routing                        │
└────────────┬────────────────────────────────┘
             │
     ┌───────┴────────┐
     │                │
     ↓                ↓
┌─────────┐      ┌─────────┐
│ Backend │      │ Backend │  (Multiple instances)
│ Server 1│      │ Server 2│
└────┬────┘      └────┬────┘
     │                │
     └───────┬────────┘
             ↓
┌─────────────────────────────────────────────┐
│  MongoDB Cluster                            │
│  ├─ Primary                                 │
│  ├─ Secondary (replica)                     │
│  └─ Secondary (replica)                     │
└─────────────────────────────────────────────┘
```

---

This architecture provides:
- ✅ Real-time updates
- ✅ Scalability
- ✅ Security
- ✅ High availability
- ✅ Easy maintenance
- ✅ Flexible integration
