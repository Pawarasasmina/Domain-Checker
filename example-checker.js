/**
 * Simple Domain Checker Example
 * This demonstrates how to integrate your checking system with the dashboard
 */

const axios = require('axios');

// Configuration
const CONFIG = {
  // Dashboard API endpoint
  dashboardUrl: 'http://localhost:5000/api/urls',
  
  // How often to run full scan (milliseconds)
  scanInterval: 5 * 60 * 1000, // 5 minutes
  
  // Delay between checking individual domains (milliseconds)
  delayBetweenChecks: 2000, // 2 seconds
  
  // Timeout for domain checks (milliseconds)
  checkTimeout: 5000 // 5 seconds
};

class DomainChecker {
  constructor() {
    this.isRunning = false;
    this.stats = {
      totalChecked: 0,
      blocked: 0,
      accessible: 0,
      errors: 0
    };
  }

  // Main entry point
  async start() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Domain Checker - Dashboard Integration  ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    this.isRunning = true;
    
    while (this.isRunning) {
      await this.runScanCycle();
      
      console.log('\n' + '─'.repeat(50));
      console.log(`⏰ Next scan in ${CONFIG.scanInterval / 1000 / 60} minutes`);
      console.log('─'.repeat(50) + '\n');
      
      await this.sleep(CONFIG.scanInterval);
    }
  }

  // Run one complete scan cycle
  async runScanCycle() {
    console.log(`🚀 Starting scan cycle at ${new Date().toLocaleTimeString()}`);
    
    // Fetch domains from dashboard
    const domains = await this.fetchDomainsFromDashboard();
    
    if (domains.length === 0) {
      console.log('⚠️  No domains to check. Add domains in the dashboard first.');
      return;
    }

    console.log(`📋 Found ${domains.length} domains to check\n`);

    // Check each domain
    for (let i = 0; i < domains.length; i++) {
      const domain = domains[i];
      console.log(`[${i + 1}/${domains.length}] Checking: ${domain.Domain}`);
      
      try {
        const isBlocked = await this.checkDomain(domain.Domain);
        await this.reportToDashboard(domain, isBlocked);
        
        this.stats.totalChecked++;
        if (isBlocked) {
          this.stats.blocked++;
        } else {
          this.stats.accessible++;
        }
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
        this.stats.errors++;
      }

      // Delay between checks to avoid overwhelming servers
      if (i < domains.length - 1) {
        await this.sleep(CONFIG.delayBetweenChecks);
      }
    }

    console.log('\n' + '═'.repeat(50));
    console.log('📊 Scan Statistics:');
    console.log(`   Total Checked: ${this.stats.totalChecked}`);
    console.log(`   🟢 Accessible: ${this.stats.accessible}`);
    console.log(`   🔴 Blocked: ${this.stats.blocked}`);
    console.log(`   ❌ Errors: ${this.stats.errors}`);
    console.log('═'.repeat(50));
  }

  // Fetch domains from dashboard
  async fetchDomainsFromDashboard() {
    try {
      const response = await axios.get(CONFIG.dashboardUrl, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch domains from dashboard:', error.message);
      console.log('💡 Make sure the backend server is running on port 5000');
      return [];
    }
  }

  // Check if a domain is blocked or accessible
  async checkDomain(domainName) {
    /**
     * TODO: Replace this with your actual domain checking logic
     * 
     * Examples:
     * - Check DNS resolution
     * - Check HTTP response
     * - Check against blocklist database
     * - Check firewall rules
     * - etc.
     */

    try {
      // Simple HTTP check example
      const response = await axios.get(`http://${domainName}`, {
        timeout: CONFIG.checkTimeout,
        validateStatus: () => true, // Accept any status code
        maxRedirects: 0
      });

      // If we get any response, domain is accessible
      return false; // Accessible
      
    } catch (error) {
      // Analyze the error to determine if blocked or just down
      
      if (error.code === 'ENOTFOUND') {
        // DNS resolution failed - likely blocked
        return true;
      }
      
      if (error.code === 'ECONNREFUSED') {
        // Connection refused - might be blocked
        return true;
      }
      
      if (error.code === 'ETIMEDOUT') {
        // Timeout - might be blocked or slow
        return true;
      }

      // Other errors - assume accessible but having issues
      return false;
    }
  }

  // Report check result back to dashboard
  async reportToDashboard(domain, isBlocked) {
    try {
      const payload = {
        id: domain.id,
        brand: domain.brand,
        Domain: domain.Domain,
        noto: domain.noto,
        scanResult: {
          status: isBlocked ? 'blocked' : 'accessible'
        }
      };

      const response = await axios.post(
        `${CONFIG.dashboardUrl}/update`,
        payload,
        { timeout: 10000 }
      );

      const statusEmoji = isBlocked ? '🔴' : '🟢';
      const statusText = isBlocked ? 'BLOCKED' : 'ACCESSIBLE';
      console.log(`  ${statusEmoji} ${statusText} - Updated in dashboard`);

    } catch (error) {
      console.error(`  ❌ Failed to report to dashboard: ${error.message}`);
      throw error;
    }
  }

  // Utility: Sleep for specified milliseconds
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Graceful shutdown
  stop() {
    console.log('\n🛑 Stopping checker...');
    this.isRunning = false;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

// Create checker instance
const checker = new DomainChecker();

// Handle graceful shutdown
process.on('SIGINT', () => {
  checker.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  checker.stop();
  process.exit(0);
});

// Start the checker
checker.start().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
