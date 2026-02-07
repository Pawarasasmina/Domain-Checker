const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');

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

    // Emit Socket.IO event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('domain:nawala-updated', {
        domainId: domain._id,
        domain: domain.domain,
        nawala: domain.nawala,
        brand: domain.brand
      });
    }

    console.log(`✓ Updated ${domain.domain}: ${domain.nawala.status} (${scanResult.status})`);

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
