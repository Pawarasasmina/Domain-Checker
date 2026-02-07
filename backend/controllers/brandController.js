const Brand = require('../models/Brand');
const Domain = require('../models/Domain');

// @desc    Create new brand
// @route   POST /api/brands
// @access  Private/Admin
exports.createBrand = async (req, res, next) => {
  try {
    const { name, code, description, color } = req.body;

    // Auto-generate code from name if not provided
    const brandCode = code || name;

    // Get brand style from predefined list or use default
    const brandStyles = {
      'A200M': '#02bca2', 'B200M': '#4582b4', 'C200M': '#67c700', 'D200M': '#00ff83',
      'E200M': '#0053cb', 'F200M': '#fede9d', 'G200M': '#f60002', 'K200M': '#00e0ba',
      'P200M': '#01ddff', 'J200M': '#81db01', 'Y200M': '#7500b8', 'PASTI200M': '#fa06ba',
      'SGCWIN': '#02bca2', 'SGCWIN77': '#2b8cbb', 'SGCWIN88': '#8a7132', 'SGCPLAY': '#f4e303',
      'SGCVIP': '#008262', 'ASIA100': '#fd5858', 'ASIA200': '#ffc325', 'ASIA300': '#ffb100',
      'TIKET100': '#d6b851', 'TIKET200': '#63fe4c', 'TIKET300': '#579dff',
      'SUPER89': '#ffd700', 'RAJA100': '#2dbdfa', 'TOP111': '#fede9d', 'PADUKA500': '#02bca2',
      'AUTOQRIS77': '#00ff83', 'FUFUSLOT': '#f7a103', 'JOS007': '#41760c', 'DEPO89': '#fa06ba',
      'BONASLOT': '#4582b4', 'MADURA88': '#b80000', 'NUSA211': '#fbeb8c'
    };

    const brandColor = color || brandStyles[name] || '#3B82F6';
    const brandDescription = description || `${name} Brand`;

    const brand = await Brand.create({
      name,
      code: brandCode,
      description: brandDescription,
      color: brandColor,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all brands
// @route   GET /api/brands
// @access  Private
exports.getAllBrands = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const brands = await Brand.find(filter)
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: brands.length,
      data: brands
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get brand by ID
// @route   GET /api/brands/:id
// @access  Private
exports.getBrandById = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Get domain count for this brand
    const domainCount = await Domain.countDocuments({ brand: brand._id });

    res.status(200).json({
      success: true,
      data: {
        ...brand.toObject(),
        domainCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
exports.updateBrand = async (req, res, next) => {
  try {
    const { name, code, description, color, isActive } = req.body;

    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    if (name) brand.name = name;
    if (code) brand.code = code;
    if (description !== undefined) brand.description = description;
    if (color) brand.color = color;
    if (typeof isActive !== 'undefined') brand.isActive = isActive;

    await brand.save();

    res.status(200).json({
      success: true,
      message: 'Brand updated successfully',
      data: brand
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
exports.deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Check if brand has domains
    const domainCount = await Domain.countDocuments({ brand: brand._id });
    
    if (domainCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand. It has ${domainCount} domain(s) associated with it. Please reassign or delete those domains first.`
      });
    }

    await brand.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
