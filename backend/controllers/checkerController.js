const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');
const axios = require('axios');

// @desc    Get all domains for checking system
// @route   GET /api/urls
// @access  Public (for checker system)
exports.getAllUrls = async (req, res, next) => {
  try {
    const domains = await Domain.find({ isActive: true })
      .populate('brand', 'name code')
      .select('domain brand note')
      .sort('domain');

    // Format response for checking system
    const formattedDomains = domains.map((domain, index) => ({
      id: domain._id.toString(),
      brand: domain.brand?.name || domain.brand?.code || 'Unknown',
      Domain: domain.domain,
      noto: domain.note || ''
    }));

    res.status(200).json(formattedDomains);
  } catch (error) {
    next(error);
  }
};

// Batch buffer for Socket.IO events
let updateBatch = [];
let batchTimer = null;

const emitBatchUpdates = (io) => {
  if (updateBatch.length > 0) {
    io.emit('domains:bulk-nawala-updated', {
      updates: updateBatch,
      count: updateBatch.length
    });
    console.log(`📤 Emitted ${updateBatch.length} batched updates`);
    updateBatch = [];
  }
};

// @desc    Update domain status from checking system
// @route   POST /api/urls/update
// @access  Public (for checker system)
exports.updateUrlStatus = async (req, res, next) => {
  try {
    const { id, scanResult } = req.body;

    if (!id || !scanResult || !scanResult.status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: id, scanResult.status'
      });
    }

    const domain = await Domain.findById(id)
      .populate('brand', 'name code color');

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Update Nawala status based on scan result
    const isBlocked = scanResult.status === 'blocked';
    domain.nawala = {
      status: isBlocked ? 'ada' : 'tidak ada',
      blockedId: isBlocked ? `scan_${Date.now()}` : null,
      lastChecked: new Date()
    };

    await domain.save();

    // Batch Socket.IO events instead of emitting immediately
    if (req.app.get('io')) {
      updateBatch.push({
        domainId: domain._id,
        domain: domain.domain,
        nawala: domain.nawala,
        brand: domain.brand
      });

      // Clear existing timer
      if (batchTimer) {
        clearTimeout(batchTimer);
      }

      // Emit batch after 2 seconds of no new updates, or when batch reaches 50
      if (updateBatch.length >= 50) {
        emitBatchUpdates(req.app.get('io'));
      } else {
        batchTimer = setTimeout(() => {
          emitBatchUpdates(req.app.get('io'));
        }, 2000);
      }
    }

    // Only log every 10th update to reduce console spam
    if (Math.random() < 0.1) {
      console.log(`✓ Updated ${domain.domain}: ${domain.nawala.status}`);
    }

    res.status(200).json({
      success: true,
      message: 'Domain status updated',
      data: {
        id: domain._id,
        domain: domain.domain,
        nawala: domain.nawala
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update domain statuses
// @route   POST /api/urls/bulk-update
// @access  Public (for checker system)
exports.bulkUpdateUrlStatus = async (req, res, next) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    // Process in chunks to avoid overwhelming the database
    const chunkSize = 10;
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async (update) => {
        try {
          const { id, scanResult } = update;
          const domain = await Domain.findById(id);
          
          if (domain) {
            const isBlocked = scanResult.status === 'blocked';
            domain.nawala = {
              status: isBlocked ? 'ada' : 'tidak ada',
              blockedId: isBlocked ? `scan_${Date.now()}` : null,
              lastChecked: new Date()
            };
            await domain.save();
            results.success++;
          } else {
            results.failed++;
          }
        } catch (err) {
          results.failed++;
          results.errors.push({ id: update.id, error: err.message });
        }
      }));
    }

    // Emit single batch update event
    if (req.app.get('io')) {
      req.app.get('io').emit('domains:bulk-check-complete', {
        success: results.success,
        failed: results.failed
      });
    }

    console.log(`✓ Bulk update complete: ${results.success} success, ${results.failed} failed`);

    res.status(200).json({
      success: true,
      message: 'Bulk update completed',
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Proxy bulk check request to external checker (server-side)
// @route   POST /api/urls/bulk-check
// @access  Protected (frontend should call this)
exports.bulkCheck = async (req, res, next) => {
  try {
    const { urls, mode } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ success: false, message: 'urls array is required' });
    }

    const checkerUrl = process.env.CHECKER_BULK_ENDPOINT || 'http://192.168.10.140:5000/api/bulk-check';

    // Ensure server-side checker API key is configured to avoid forwarding 401s
    if (!process.env.CHECKER_API_KEY) {
      console.warn('bulkCheck attempted but CHECKER_API_KEY is not configured on server');
      return res.status(500).json({ success: false, message: 'Checker API key not configured on server' });
    }

    // Build payload with server-side API key
    const payload = {
      urls,
      mode: mode || 'official',
      apiKey: process.env.CHECKER_API_KEY
    };

    const response = await axios.post(checkerUrl, payload, { timeout: 60000 });

    // Forward the external checker response to the frontend
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Bulk check proxy error:', error.message || error);
    const status = error.response?.status || 500;
    const data = error.response?.data || { success: false, message: 'Checker request failed' };
    return res.status(status).json(data);
  }
};
