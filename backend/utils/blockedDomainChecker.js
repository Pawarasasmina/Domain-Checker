const WebSocket = require('ws');
const Domain = require('../models/Domain');

class BlockedDomainChecker {
  constructor(io) {
    this.io = io;
    this.ws = null;
    this.reconnectInterval = 5000;
    this.reconnectTimer = null;
    this.isConnecting = false;
  }

  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = process.env.CHECKER_WEBSOCKET_URL || 'ws://localhost:8080';

    try {
      console.log(`Connecting to Blocked Domain Checker: ${wsUrl}`);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        console.log('✓ Connected to Blocked Domain Checker');
        this.isConnecting = false;
        
        // Clear reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }

        // Send authentication if needed
        // this.ws.send(JSON.stringify({ type: 'auth', token: 'your-token' }));
      });

      this.ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(message);
        } catch (error) {
          console.error('Error processing blocked domain message:', error);
        }
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
        this.isConnecting = false;
      });

      this.ws.on('close', () => {
        console.log('Disconnected from Blocked Domain Checker');
        this.isConnecting = false;
        this.scheduleReconnect();
      });

    } catch (error) {
      console.error('Failed to connect to Blocked Domain Checker:', error.message);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (!this.reconnectTimer) {
      console.log(`Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  async handleMessage(message) {
    try {
      // Expected message format from your blocked domain checker:
      // {
      //   type: 'blocked_domain',
      //   domain: 'example.com',
      //   blockedId: 'some-id',
      //   status: 'blocked' | 'unblocked'
      // }

      console.log('Received blocked domain update:', message);

      if (message.type === 'blocked_domain' && message.domain) {
        const domain = await Domain.findOne({ domain: message.domain });

        if (domain) {
          // Update Nawala status
          domain.nawala = {
            status: message.status === 'blocked' ? 'ada' : 'tidak ada',
            blockedId: message.blockedId || null,
            lastChecked: new Date()
          };

          await domain.save();
          await domain.populate('brand', 'name code color');

          // Emit to all connected clients via Socket.IO
          this.io.emit('domain:nawala-updated', {
            domainId: domain._id,
            domain: domain.domain,
            nawala: domain.nawala
          });

          console.log(`✓ Updated Nawala status for ${domain.domain}: ${domain.nawala.status}`);
        } else {
          console.log(`⚠ Domain not found in database: ${message.domain}`);
        }
      }
    } catch (error) {
      console.error('Error handling blocked domain message:', error);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

module.exports = BlockedDomainChecker;
