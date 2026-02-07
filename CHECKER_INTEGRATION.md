# Checking System Integration with Dashboard

## Overview
Your checking system will communicate with the dashboard through HTTP endpoints. The dashboard will return domains for checking and receive status updates in real-time.

---

## 🔄 Integration Flow

```
Checking System (Port XXXX)
    ↓ GET /api/urls
Dashboard API (Port 5000)
    ↓ Returns domains list
Checking System
    ↓ Performs checks
Checking System
    ↓ POST /api/urls/update (with status)
Dashboard API
    ↓ Updates database
Dashboard Backend
    ↓ Emits Socket.IO event
All Connected Frontend Clients
    ↓ Real-time UI update
```

---

## 📡 API Endpoints for Your Checking System

### 1. Get All Domains to Check

**Endpoint:** `GET http://localhost:5000/api/urls`

**Your checking system calls this to get all domains**

**Response:**
```json
[
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "brand": "A200M",
    "Domain": "a200m-amp.rest",
    "noto": "AMP"
  },
  {
    "id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "brand": "ASIA100",
    "Domain": "asia100-app.hair",
    "noto": "ADS CT / ADS CR"
  }
]
```

**Fields:**
- `id` - MongoDB ObjectId (use this for updates)
- `brand` - Brand name
- `Domain` - Domain name to check
- `noto` - Optional note

---

### 2. Update Domain Status

**Endpoint:** `POST http://localhost:5000/api/urls/update`

**Your checking system sends this after checking each domain**

**Request Body:**
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "brand": "A200M",
  "Domain": "a200m-amp.rest",
  "noto": "AMP",
  "scanResult": {
    "status": "blocked"
  }
}
```

**OR**

```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "brand": "A200M",
  "Domain": "a200m-amp.rest",
  "noto": "AMP",
  "scanResult": {
    "status": "accessible"
  }
}
```

**Fields:**
- `id` - Domain ID from GET response (required)
- `brand` - Brand name (optional, for logging)
- `Domain` - Domain name (optional, for logging)
- `noto` - Note (optional, for logging)
- `scanResult.status` - **"blocked"** or **"accessible"** (required)

**Response:**
```json
{
  "success": true,
  "message": "Domain status updated",
  "data": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "domain": "a200m-amp.rest",
    "nawala": {
      "status": "ada",
      "blockedId": "scan_1707321600000",
      "lastChecked": "2026-02-07T10:00:00.000Z"
    }
  }
}
```

---

## 💻 Example Code for Your Checking System

### Node.js Example

```javascript
const axios = require('axios');

const DASHBOARD_API = 'http://localhost:5000/api/urls';

// 1. Fetch all domains to check
async function getAllDomains() {
  try {
    const response = await axios.get(DASHBOARD_API);
    return response.data; // Array of domains
  } catch (error) {
    console.error('Failed to fetch domains:', error.message);
    return [];
  }
}

// 2. Update domain status
async function updateDomainStatus(domainId, domainName, isBlocked) {
  try {
    await axios.post(`${DASHBOARD_API}/update`, {
      id: domainId,
      scanResult: {
        status: isBlocked ? 'blocked' : 'accessible'
      }
    });
    console.log(`✓ Updated ${domainName}: ${isBlocked ? 'BLOCKED' : 'ACCESSIBLE'}`);
  } catch (error) {
    console.error(`✗ Failed to update ${domainName}:`, error.message);
  }
}

// 3. Main checking loop
async function runChecker() {
  console.log('Starting domain checker...');
  
  while (true) {
    const domains = await getAllDomains();
    console.log(`Checking ${domains.length} domains...`);
    
    for (const domain of domains) {
      // Your checking logic here
      const isBlocked = await checkDomain(domain.Domain);
      
      // Update dashboard
      await updateDomainStatus(domain.id, domain.Domain, isBlocked);
      
      // Small delay between checks
      await sleep(1000);
    }
    
    // Wait before next full scan
    console.log('Scan complete. Waiting 5 minutes before next scan...');
    await sleep(5 * 60 * 1000); // 5 minutes
  }
}

// Your domain checking function
async function checkDomain(domainName) {
  // TODO: Implement your actual domain checking logic
  // Return true if blocked, false if accessible
  
  try {
    // Example: Check if domain is accessible
    const response = await axios.get(`http://${domainName}`, { timeout: 5000 });
    return false; // Accessible
  } catch (error) {
    // Check if it's blocked or just down
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return true; // Likely blocked
    }
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the checker
runChecker();
```

---

## 🔧 Quick Setup for Your Checking System

### Step 1: Install axios in your checking system
```bash
npm install axios
```

### Step 2: Configure dashboard API URL

In your checking system, set:
```javascript
const DASHBOARD_API = 'http://localhost:5000/api/urls';
```

If dashboard is on different machine:
```javascript
const DASHBOARD_API = 'http://dashboard-server-ip:5000/api/urls';
```

### Step 3: Implement the flow

1. **GET** all domains from dashboard
2. **Check** each domain with your logic
3. **POST** status back to dashboard
4. **Repeat** periodically

---

## ⚡ Real-Time Updates

When your checking system sends POST to `/api/urls/update`:

1. ✅ Dashboard receives the update
2. ✅ Updates database immediately
3. ✅ Emits Socket.IO event to all connected users
4. ✅ Frontend updates the table in real-time
5. ✅ Shows toast notification to users

**Users see the change instantly without refreshing!**

---

## 🧪 Testing the Integration

### Test 1: Get Domains
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:5000/api/urls" -Method Get
```

### Test 2: Update Status (Domain Blocked)
```bash
# PowerShell
$body = @{
  id = "YOUR_DOMAIN_ID"
  scanResult = @{
    status = "blocked"
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/urls/update" -Method Post -Body $body -ContentType "application/json"
```

### Test 3: Update Status (Domain Accessible)
```bash
# PowerShell
$body = @{
  id = "YOUR_DOMAIN_ID"
  scanResult = @{
    status = "accessible"
  }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/urls/update" -Method Post -Body $body -ContentType "application/json"
```

---

## 📊 Status Mapping

| Your Status | Dashboard Nawala Column |
|-------------|------------------------|
| `blocked` | "ada" (🔴 Red) |
| `accessible` | "tidak ada" (🟢 Green) |

---

## 🔍 Monitoring

### Backend Logs
When your checking system sends updates, you'll see:
```
✓ Updated a200m-amp.rest: ada (blocked)
✓ Updated asia100-app.hair: tidak ada (accessible)
```

### Frontend
Users will see:
- Real-time table updates
- Toast notifications: "Nawala status updated for domain.com 🔴/🟢"
- Nawala column changes color instantly

---

## 🚨 Error Handling

### If Domain Not Found
```json
{
  "success": false,
  "message": "Domain not found"
}
```

**Solution:** Domain might have been deleted. Fetch fresh domain list.

### If Missing Required Fields
```json
{
  "success": false,
  "message": "Missing required fields: id, scanResult.status"
}
```

**Solution:** Ensure you're sending `id` and `scanResult.status` in the request.

---

## 🔐 Security Considerations

### Current Setup
- Endpoints are **public** (no auth required)
- Designed for local network use

### For Production

Add authentication to your checking system requests:

1. Generate an API key in dashboard
2. Send it in headers:
```javascript
axios.post(`${DASHBOARD_API}/update`, data, {
  headers: {
    'X-API-Key': 'your-secret-api-key'
  }
});
```

3. Validate in backend middleware

---

## 📝 Complete Integration Example

```javascript
// checker-integration.js
const axios = require('axios');

const CONFIG = {
  dashboardUrl: 'http://localhost:5000/api/urls',
  checkInterval: 5 * 60 * 1000, // 5 minutes
  domainTimeout: 5000 // 5 seconds
};

class DomainChecker {
  async start() {
    console.log('🚀 Starting Domain Checker Integration');
    
    while (true) {
      await this.checkAllDomains();
      console.log(`⏰ Next scan in ${CONFIG.checkInterval / 1000 / 60} minutes`);
      await this.sleep(CONFIG.checkInterval);
    }
  }

  async checkAllDomains() {
    const domains = await this.fetchDomains();
    console.log(`📋 Checking ${domains.length} domains...`);

    for (const domain of domains) {
      const isBlocked = await this.checkDomain(domain.Domain);
      await this.reportStatus(domain.id, domain.Domain, isBlocked);
      await this.sleep(1000); // 1 second between checks
    }

    console.log('✅ Scan complete');
  }

  async fetchDomains() {
    try {
      const response = await axios.get(CONFIG.dashboardUrl);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch domains:', error.message);
      return [];
    }
  }

  async checkDomain(domainName) {
    // TODO: Replace with your actual checking logic
    try {
      await axios.get(`http://${domainName}`, { 
        timeout: CONFIG.domainTimeout 
      });
      return false; // Accessible
    } catch (error) {
      return true; // Blocked or down
    }
  }

  async reportStatus(id, domain, isBlocked) {
    try {
      await axios.post(`${CONFIG.dashboardUrl}/update`, {
        id,
        scanResult: {
          status: isBlocked ? 'blocked' : 'accessible'
        }
      });
      
      const emoji = isBlocked ? '🔴' : '🟢';
      const status = isBlocked ? 'BLOCKED' : 'ACCESSIBLE';
      console.log(`${emoji} ${domain}: ${status}`);
    } catch (error) {
      console.error(`❌ Failed to report ${domain}:`, error.message);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run the checker
const checker = new DomainChecker();
checker.start();
```

**Save as `checker-integration.js` in your checking system and run:**
```bash
node checker-integration.js
```

---

## ✅ Verification Checklist

After integration:

- [ ] Your checking system can GET domains from dashboard
- [ ] Your checking system can POST status updates
- [ ] Dashboard database updates when status is posted
- [ ] Frontend shows real-time updates (Nawala column)
- [ ] Toast notifications appear in frontend
- [ ] Backend logs show updates
- [ ] Status mapping works correctly (blocked → ada, accessible → tidak ada)

---

## 📞 Support

If you encounter issues:

1. Check backend logs for errors
2. Verify dashboard is running on port 5000
3. Test endpoints with PowerShell/curl
4. Ensure domains exist in dashboard before updating
5. Check network connectivity between systems

---

## 🎉 You're All Set!

Your checking system can now:
- ✅ Fetch all domains from dashboard
- ✅ Send status updates in real-time
- ✅ Update database automatically
- ✅ Push updates to all users instantly

The dashboard will show real-time status changes in the Nawala column!
