# ✅ Checker Integration - Complete!

## 🎉 What's Been Added

Your checking system can now communicate with the dashboard through HTTP endpoints!

---

## 📡 New API Endpoints

### 1. GET /api/urls
Your checker fetches all domains to check

**URL:** `http://localhost:5000/api/urls`

**Returns:**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "brand": "A200M",
    "Domain": "example.com",
    "noto": "AMP"
  }
]
```

### 2. POST /api/urls/update
Your checker sends status updates

**URL:** `http://localhost:5000/api/urls/update`

**Send:**
```json
{
  "id": "domain-id-from-get-request",
  "scanResult": {
    "status": "blocked"
  }
}
```
**OR**
```json
{
  "id": "domain-id-from-get-request",
  "scanResult": {
    "status": "accessible"
  }
}
```

---

## 🚀 Quick Test

### Option 1: PowerShell (Easiest)
```powershell
cd "d:\.Port City\Domain Dashboard"
.\test-checker-api.ps1
```

### Option 2: Node.js
```bash
cd backend
node test-checker-api.js
```

Both will:
- ✅ Fetch domains
- ✅ Mark one as blocked
- ✅ Mark it as accessible
- ✅ Show results

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────┐
│  Your Checking System (Any Port)               │
│  ├─ Checks domains continuously                │
│  └─ Sends HTTP POST with status                │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ HTTP Request
┌─────────────────────────────────────────────────┐
│  Dashboard Backend (Port 5000)                  │
│  ├─ Receives status update                     │
│  ├─ Updates MongoDB                            │
│  └─ Emits Socket.IO event                      │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ Real-time Event
┌─────────────────────────────────────────────────┐
│  All Connected Users                            │
│  ├─ Nawala column updates instantly            │
│  ├─ Toast notification appears                 │
│  └─ No page refresh needed                     │
└─────────────────────────────────────────────────┘
```

---

## 💻 Integration Code for Your Checker

### Minimal Integration (Just 2 Functions)

```javascript
const axios = require('axios');
const DASHBOARD_API = 'http://localhost:5000/api/urls';

// 1. Get domains to check
async function getDomains() {
  const response = await axios.get(DASHBOARD_API);
  return response.data;
}

// 2. Report status
async function reportStatus(domainId, isBlocked) {
  await axios.post(`${DASHBOARD_API}/update`, {
    id: domainId,
    scanResult: {
      status: isBlocked ? 'blocked' : 'accessible'
    }
  });
}

// 3. Use in your checking loop
async function runChecker() {
  while (true) {
    const domains = await getDomains();
    
    for (const domain of domains) {
      const isBlocked = await yourCheckingFunction(domain.Domain);
      await reportStatus(domain.id, isBlocked);
    }
    
    await sleep(300000); // Wait 5 minutes
  }
}
```

---

## 📊 Status Mapping

| Your Checker Says | Dashboard Shows | UI Color |
|-------------------|-----------------|----------|
| `"blocked"` | "ada" | 🔴 Red |
| `"accessible"` | "tidak ada" | 🟢 Green |

---

## 🧪 Testing Checklist

- [ ] Backend running on port 5000
- [ ] MongoDB is running
- [ ] Domains exist in dashboard
- [ ] Can GET /api/urls (returns domains)
- [ ] Can POST /api/urls/update (updates status)
- [ ] Frontend shows real-time updates
- [ ] Toast notifications appear
- [ ] Nawala column changes color

---

## 📁 Files Created

### Backend Integration
- `backend/controllers/checkerController.js` - API logic
- `backend/routes/checkerRoutes.js` - API routes
- `backend/server.js` - Updated with new routes

### Testing & Documentation
- `test-checker-api.ps1` - PowerShell test script
- `backend/test-checker-api.js` - Node.js test script
- `example-checker.js` - Complete working example
- `CHECKER_SETUP.md` - Quick setup guide
- `CHECKER_INTEGRATION.md` - Detailed integration guide

---

## 🎯 Next Steps

### 1. Test the Integration (Now)
```powershell
# Make sure backend is running first
cd backend
npm run dev

# Then in new terminal/window
cd "d:\.Port City\Domain Dashboard"
.\test-checker-api.ps1
```

### 2. See Example Checker (Optional)
```bash
node example-checker.js
```

This will continuously check domains and update the dashboard.

### 3. Integrate Your Checker
- Copy the minimal integration code above
- Or follow the detailed guide in `CHECKER_INTEGRATION.md`
- Replace `yourCheckingFunction()` with your actual logic

---

## 🎓 Example Use Cases

### Use Case 1: Periodic Scanning
```javascript
// Check all domains every 5 minutes
setInterval(async () => {
  const domains = await getDomains();
  for (const d of domains) {
    const blocked = await checkDomain(d.Domain);
    await reportStatus(d.id, blocked);
  }
}, 5 * 60 * 1000);
```

### Use Case 2: Real-time Monitoring
```javascript
// Check domains continuously
while (true) {
  const domains = await getDomains();
  await checkAndReport(domains);
  await sleep(1000); // 1 second between domains
}
```

### Use Case 3: On-Demand Checking
```javascript
// Check specific domain when needed
async function checkSpecificDomain(domainId) {
  const domains = await getDomains();
  const domain = domains.find(d => d.id === domainId);
  const blocked = await checkDomain(domain.Domain);
  await reportStatus(domain.id, blocked);
}
```

---

## 🔐 Security Notes

**Current Setup:**
- Endpoints are public (no authentication)
- Designed for local network use
- CORS allows all origins

**For Production:**
Add API key authentication:

```javascript
// In your checker
await axios.post(url, data, {
  headers: {
    'X-API-Key': 'your-secret-key'
  }
});
```

---

## 🐛 Troubleshooting

### Cannot connect to dashboard
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```
**Solution:** Start backend with `npm run dev`

### Domain not found
```json
{"success": false, "message": "Domain not found"}
```
**Solution:** Add domains in dashboard first, use correct ID from GET response

### No real-time updates
**Solution:** 
- Check Socket.IO connection in browser console
- Refresh frontend page
- Verify backend Socket.IO is running

---

## 📚 Documentation Reference

| File | Purpose |
|------|---------|
| **CHECKER_SETUP.md** | Quick setup (this file) |
| **CHECKER_INTEGRATION.md** | Detailed integration guide |
| **example-checker.js** | Complete working example |
| **test-checker-api.ps1** | PowerShell test script |
| **backend/test-checker-api.js** | Node.js test script |

---

## ✅ You're Ready!

Your dashboard now has:
- ✅ API endpoints for your checker
- ✅ Real-time database updates
- ✅ Socket.IO broadcasting
- ✅ Frontend real-time updates
- ✅ Toast notifications
- ✅ Test scripts
- ✅ Example implementations
- ✅ Complete documentation

**Just integrate the 2 functions into your checker and you're done!**

---

## 🎉 Result

When your checker sends updates:
1. Database updates instantly
2. All users see Nawala column update
3. Toast notification pops up
4. No page refresh needed
5. Multiple users see it simultaneously

**That's real-time monitoring! 🚀**
