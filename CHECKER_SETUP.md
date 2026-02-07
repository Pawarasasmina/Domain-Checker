# Quick Setup - Checker Integration

## ✅ What's Been Added

Two new API endpoints for your checking system:

1. **GET /api/urls** - Your checker fetches all domains
2. **POST /api/urls/update** - Your checker sends status updates

## 🚀 Setup Steps

### Step 1: Restart Backend Server

The new endpoints are ready. Just restart your backend:

```bash
# Stop current server (Ctrl+C)
# Then start again:
cd backend
npm run dev
```

### Step 2: Test the Integration

```bash
# In backend directory
node test-checker-api.js
```

This will:
- ✅ Fetch all domains
- ✅ Mark one as blocked
- ✅ Mark it as accessible
- ✅ Show real-time updates in dashboard

### Step 3: Run Example Checker (Optional)

To see how it works:

```bash
# In project root
cd "d:\.Port City\Domain Dashboard"
node example-checker.js
```

This will continuously:
1. Fetch domains from dashboard
2. Check each domain
3. Report status back
4. Update dashboard in real-time
5. Repeat every 5 minutes

## 🔧 For Your Existing Checker System

### Option 1: Modify Your Checker (Recommended)

Add these two functions to your existing checker:

```javascript
const axios = require('axios');
const DASHBOARD_API = 'http://localhost:5000/api/urls';

// Fetch domains to check
async function getDomains() {
  const response = await axios.get(DASHBOARD_API);
  return response.data;
}

// Report status back
async function reportStatus(domainId, isBlocked) {
  await axios.post(`${DASHBOARD_API}/update`, {
    id: domainId,
    scanResult: {
      status: isBlocked ? 'blocked' : 'accessible'
    }
  });
}
```

Then in your checking loop:

```javascript
// Get all domains
const domains = await getDomains();

// Check each one
for (const domain of domains) {
  const isBlocked = await yourCheckingLogic(domain.Domain);
  await reportStatus(domain.id, isBlocked);
}
```

### Option 2: Keep Separate (HTTP Requests)

Your checker can run independently and just make HTTP calls:

```javascript
// Every time you check a domain
const isBlocked = await checkDomain(domain);

await axios.post('http://localhost:5000/api/urls/update', {
  id: domainId,
  scanResult: { status: isBlocked ? 'blocked' : 'accessible' }
});
```

## 📡 API Format Reference

### GET Request
```
GET http://localhost:5000/api/urls
```

**Response:**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "brand": "A200M",
    "Domain": "example.com",
    "noto": "note"
  }
]
```

### POST Request
```
POST http://localhost:5000/api/urls/update
Content-Type: application/json

{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "scanResult": {
    "status": "blocked"
  }
}
```

**Or:**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "scanResult": {
    "status": "accessible"
  }
}
```

## 🎯 What Happens

```
Your Checker
    ↓ POST with status
Dashboard API (/api/urls/update)
    ↓ Updates MongoDB
    ↓ Emits Socket.IO event
All Frontend Users
    ↓ See Nawala column update INSTANTLY
    ↓ Get toast notification
```

## ✅ Verification

1. **Backend running?** → Check http://localhost:5000/health
2. **Endpoints working?** → Run `node test-checker-api.js`
3. **Frontend updating?** → Open dashboard, run checker, watch Nawala column
4. **Real-time working?** → Multiple browsers should all update simultaneously

## 🐛 Troubleshooting

**"Cannot connect to dashboard"**
- Make sure backend is running on port 5000
- Check if MongoDB is running

**"Domain not found"**
- Add domains in dashboard first (Money Sites page)
- Use the correct domain ID from GET response

**"No real-time updates"**
- Check Socket.IO connection in browser console
- Make sure frontend is connected

## 📝 Next Steps

1. ✅ Test with `node test-checker-api.js`
2. ✅ Watch dashboard update in real-time
3. ✅ Integrate into your checker system
4. ✅ Deploy and enjoy real-time monitoring!

## 📚 Documentation

- **[CHECKER_INTEGRATION.md](CHECKER_INTEGRATION.md)** - Detailed integration guide
- **[example-checker.js](example-checker.js)** - Complete working example

---

**That's it! Your checker system can now communicate with the dashboard in real-time! 🎉**
