# Integrating Your Blocked Domain Checker

## Overview

This guide explains how to integrate your existing Node.js blocked domain checker with this dashboard for real-time Nawala status updates.

## Architecture

```
Your Blocked Domain Checker (Local)
        ↓ (WebSocket)
Domain Dashboard Backend
        ↓ (Socket.IO)
Frontend Dashboard
        ↓ (UI Update)
```

## Option 1: WebSocket Integration (Recommended)

### Your Checker System Should:

1. **Run a WebSocket server** that sends domain blocking events
2. **Send messages** when a domain is detected as blocked/unblocked

### Message Format

Send JSON messages in this format:

```javascript
// When domain is blocked
{
  "type": "blocked_domain",
  "domain": "example.com",
  "blockedId": "unique-id-123",
  "status": "blocked"
}

// When domain is unblocked
{
  "type": "blocked_domain",
  "domain": "example.com",
  "blockedId": "unique-id-123",
  "status": "unblocked"
}
```

### Example WebSocket Server in Your Checker

```javascript
// In your blocked domain checker system
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Broadcast to all connected clients
function broadcastBlockedDomain(domain, isBlocked) {
  const message = JSON.stringify({
    type: 'blocked_domain',
    domain: domain,
    blockedId: generateUniqueId(),
    status: isBlocked ? 'blocked' : 'unblocked'
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Use this function when you detect a blocked domain
// broadcastBlockedDomain('example.com', true);
```

### Dashboard Configuration

Update `backend/.env`:
```env
CHECKER_WEBSOCKET_URL=ws://localhost:8080
```

The dashboard will automatically:
1. Connect to your WebSocket server
2. Listen for messages
3. Update the database
4. Push updates to frontend via Socket.IO

---

## Option 2: HTTP Webhook

If WebSocket is not suitable, use HTTP webhooks.

### Your Checker Sends POST Requests

```javascript
// In your blocked domain checker
const axios = require('axios');

async function notifyDashboard(domain, isBlocked) {
  try {
    await axios.post('http://localhost:5000/api/webhooks/nawala', {
      domain: domain,
      status: isBlocked ? 'blocked' : 'unblocked',
      blockedId: generateUniqueId()
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_WEBHOOK_SECRET'
      }
    });
  } catch (error) {
    console.error('Failed to notify dashboard:', error);
  }
}
```

### Add Webhook Route to Dashboard

Create `backend/routes/webhookRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');

// Webhook authentication middleware
const authenticateWebhook = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token === process.env.WEBHOOK_SECRET) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

router.post('/nawala', authenticateWebhook, async (req, res) => {
  try {
    const { domain, status, blockedId } = req.body;

    const domainDoc = await Domain.findOne({ domain });
    if (domainDoc) {
      domainDoc.nawala = {
        status: status === 'blocked' ? 'ada' : 'tidak ada',
        blockedId,
        lastChecked: new Date()
      };
      await domainDoc.save();

      // Emit socket event
      req.app.get('io').emit('domain:nawala-updated', {
        domainId: domainDoc._id,
        domain: domainDoc.domain,
        nawala: domainDoc.nawala
      });

      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Domain not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

Add to `backend/server.js`:
```javascript
const webhookRoutes = require('./routes/webhookRoutes');
app.use('/api/webhooks', webhookRoutes);
```

Add to `backend/.env`:
```env
WEBHOOK_SECRET=your-secure-webhook-secret-key
```

---

## Option 3: Direct Database Access (Not Recommended)

If your checker must access the database directly:

### Connection String

```javascript
// In your checker system
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/domain-dashboard');

const Domain = mongoose.model('Domain', {
  domain: String,
  nawala: {
    status: String,
    blockedId: String,
    lastChecked: Date
  }
});

async function updateNawalaStatus(domainName, isBlocked) {
  try {
    await Domain.updateOne(
      { domain: domainName },
      {
        nawala: {
          status: isBlocked ? 'ada' : 'tidak ada',
          blockedId: generateUniqueId(),
          lastChecked: new Date()
        }
      }
    );
  } catch (error) {
    console.error('Failed to update:', error);
  }
}
```

**⚠️ Warning:** This bypasses real-time updates to frontend users. Use Option 1 or 2 instead.

---

## Testing the Integration

### 1. Start Dashboard

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

### 2. Test WebSocket Connection

Create `test-checker.js`:

```javascript
const WebSocket = require('ws');

// Simulate your blocked domain checker
const client = new WebSocket('ws://localhost:8080');

client.on('open', () => {
  console.log('Test checker connected');
  
  // Simulate blocked domain detection
  setInterval(() => {
    const message = {
      type: 'blocked_domain',
      domain: 'test-domain.com', // Must exist in your dashboard
      blockedId: Math.random().toString(36).substr(2, 9),
      status: Math.random() > 0.5 ? 'blocked' : 'unblocked'
    };
    
    console.log('Sending:', message);
    client.send(JSON.stringify(message));
  }, 10000); // Every 10 seconds
});
```

Run test:
```bash
node test-checker.js
```

### 3. Verify in Dashboard

1. Login to dashboard
2. Go to Money Sites page
3. Watch the Nawala column update in real-time
4. Check browser console for Socket.IO events

---

## Monitoring & Debugging

### Backend Logs

Check `backend` terminal for:
```
✓ Connected to Blocked Domain Checker
✓ Updated Nawala status for example.com: ada
```

### Frontend Logs

Open browser DevTools → Console:
```
✓ Connected to server
Received blocked domain update: {...}
```

### Common Issues

**Connection Refused:**
- Ensure checker WebSocket server is running
- Check firewall settings
- Verify CHECKER_WEBSOCKET_URL in .env

**No Updates:**
- Verify message format matches exactly
- Check domain exists in dashboard
- Ensure Socket.IO is working (try ping/pong)

**Delayed Updates:**
- Check network latency
- Verify WebSocket connection is stable
- Consider increasing reconnect interval

---

## Production Considerations

### 1. Secure WebSocket Connection

Use `wss://` (WebSocket Secure) in production:
```env
CHECKER_WEBSOCKET_URL=wss://checker.yourdomain.com
```

### 2. Authentication

Add token-based auth to WebSocket:

```javascript
// In your checker
const client = new WebSocket('ws://localhost:8080');
client.on('open', () => {
  client.send(JSON.stringify({
    type: 'auth',
    token: 'your-secret-token'
  }));
});
```

Update `blockedDomainChecker.js` to handle auth.

### 3. Error Handling

- Implement retry logic
- Log all events
- Set up monitoring alerts
- Handle partial failures gracefully

### 4. Performance

- Batch updates if checking many domains
- Use message queuing for high volume
- Consider Redis for caching
- Monitor memory usage

---

## Alternative: Polling Approach

If real-time is not critical, use polling:

### Your Checker Provides API

```javascript
// In your checker
app.get('/api/blocked-domains', (req, res) => {
  res.json({
    blocked: ['domain1.com', 'domain2.com']
  });
});
```

### Dashboard Polls Periodically

Add cron job in `backend/server.js`:

```javascript
const cron = require('node-cron');

// Check every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/blocked-domains');
    const blockedDomains = response.data.blocked;
    
    // Update all domains
    for (const domain of blockedDomains) {
      await Domain.updateOne(
        { domain },
        { 'nawala.status': 'ada', 'nawala.lastChecked': new Date() }
      );
    }
  } catch (error) {
    console.error('Polling failed:', error);
  }
});
```

---

## Summary

**Best Approach:** WebSocket (Option 1)
- Real-time updates
- Low overhead
- Bidirectional communication

**Alternative:** HTTP Webhook (Option 2)
- Simpler implementation
- Better for one-way notifications
- Easier debugging

**Last Resort:** Direct DB Access (Option 3)
- No real-time frontend updates
- Potential consistency issues
- Not recommended

Choose based on your checker system's capabilities and requirements.
