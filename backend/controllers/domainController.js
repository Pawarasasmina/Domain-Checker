const Domain = require('../models/Domain');
const Brand = require('../models/Brand');

// @desc    Create new domain
// @route   POST /api/domains
// @access  Private/Admin
exports.createDomain = async (req, res, next) => {
  try {
    const { domain, brand, note } = req.body;

    // Check if brand exists
    const brandExists = await Brand.findById(brand);
    if (!brandExists) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    const newDomain = await Domain.create({
      domain,
      brand,
      note,
      createdBy: req.user._id
    });

    // Populate brand info
    await newDomain.populate('brand', 'name code color');
    await newDomain.populate('createdBy', 'name email');

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('domain:created', newDomain);
    }

    res.status(201).json({
      success: true,
      message: 'Domain created successfully',
      data: newDomain
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all domains
// @route   GET /api/domains
// @access  Private
exports.getAllDomains = async (req, res, next) => {
  try {
    const { brand, nawala, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    
    if (brand) {
      filter.brand = brand;
    }
    
    if (nawala) {
      filter['nawala.status'] = nawala;
    }
    
    if (search) {
      filter.domain = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const domains = await Domain.find(filter)
      .populate('brand', 'name code color')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Domain.countDocuments(filter);
    const totalBlocked = await Domain.countDocuments({ 'nawala.status': 'ada' });

    res.status(200).json({
      success: true,
      count: domains.length,
      total,
      totalBlocked,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: domains
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get domain by ID
// @route   GET /api/domains/:id
// @access  Private
exports.getDomainById = async (req, res, next) => {
  try {
    const domain = await Domain.findById(req.params.id)
      .populate('brand', 'name code color description')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    res.status(200).json({
      success: true,
      data: domain
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update domain
// @route   PUT /api/domains/:id
// @access  Private/Admin
exports.updateDomain = async (req, res, next) => {
  try {
    const { domain: domainName, brand, note, isActive } = req.body;

    const domain = await Domain.findById(req.params.id);

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    // Check if brand exists if updating
    if (brand) {
      const brandExists = await Brand.findById(brand);
      if (!brandExists) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found'
        });
      }
      domain.brand = brand;
    }

    if (domainName) domain.domain = domainName;
    if (note !== undefined) domain.note = note;
    if (typeof isActive !== 'undefined') domain.isActive = isActive;
    domain.updatedBy = req.user._id;

    await domain.save();
    await domain.populate('brand', 'name code color');
    await domain.populate('updatedBy', 'name email');

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('domain:updated', domain);
    }

    res.status(200).json({
      success: true,
      message: 'Domain updated successfully',
      data: domain
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update domain status (Nawala, Uptime, etc.)
// @route   PATCH /api/domains/:id/status
// @access  Private/Admin
exports.updateDomainStatus = async (req, res, next) => {
  try {
    const { uptime, nawala, cloudflare, google } = req.body;

    const domain = await Domain.findById(req.params.id);

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    if (uptime) {
      domain.uptime = {
        status: uptime.status,
        lastChecked: new Date()
      };
    }

    if (nawala) {
      domain.nawala = {
        status: nawala.status,
        blockedId: nawala.blockedId,
        lastChecked: new Date()
      };
    }

    if (cloudflare) {
      domain.cloudflare = {
        status: cloudflare.status,
        lastChecked: new Date()
      };
    }

    if (google) {
      domain.google = {
        status: google.status,
        lastChecked: new Date()
      };
    }

    domain.updatedBy = req.user._id;
    await domain.save();
    await domain.populate('brand', 'name code color');

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('domain:status-updated', domain);
    }

    res.status(200).json({
      success: true,
      message: 'Domain status updated successfully',
      data: domain
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete domain
// @route   DELETE /api/domains/:id
// @access  Private/Admin
exports.deleteDomain = async (req, res, next) => {
  try {
    const domain = await Domain.findById(req.params.id);

    if (!domain) {
      return res.status(404).json({
        success: false,
        message: 'Domain not found'
      });
    }

    await domain.deleteOne();

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('domain:deleted', { id: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Domain deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all blocked domains (nawala status = 'ada')
// @route   DELETE /api/domains/bulk-delete-blocked
// @access  Private/Admin
exports.deleteAllBlockedDomains = async (req, res, next) => {
  try {
    // Find all blocked domains
    const blockedDomains = await Domain.find({ 'nawala.status': 'ada' });
    const count = blockedDomains.length;

    if (count === 0) {
      return res.status(200).json({
        success: true,
        message: 'No blocked domains to delete',
        count: 0
      });
    }

    // Delete all blocked domains
    await Domain.deleteMany({ 'nawala.status': 'ada' });

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('domains:bulk-deleted', { count });
    }

    res.status(200).json({
      success: true,
      message: `${count} blocked domain(s) deleted successfully`,
      count
    });
  } catch (error) {
    next(error);
  }
};
