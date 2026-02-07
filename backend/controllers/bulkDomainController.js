const Domain = require('../models/Domain');
const Brand = require('../models/Brand');

// @desc    Bulk import domains from CSV
// @route   POST /api/domains/bulk-import
// @access  Private/Admin
exports.bulkImportDomains = async (req, res, next) => {
  try {
    const { domains } = req.body; // Array of domain objects from parsed CSV
    
    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No domains provided'
      });
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    // Get all brands for mapping (including inactive ones for better matching)
    const brands = await Brand.find({});
    const brandMap = {};
    brands.forEach(brand => {
      brandMap[brand.name.toUpperCase()] = brand._id;
      brandMap[brand.code.toUpperCase()] = brand._id;
    });

    console.log(`Available brands: ${Object.keys(brandMap).join(', ')}`);
    console.log(`Processing ${domains.length} domains...`);

    // Get all existing domains at once for faster duplicate checking
    const existingDomains = await Domain.find({}, 'domain');
    const existingDomainsSet = new Set(existingDomains.map(d => d.domain));

    // Process in batches for better performance
    const BATCH_SIZE = 50;
    const domainBatches = [];
    
    for (let i = 0; i < domains.length; i++) {
      const row = domains[i];
      const rowNumber = i + 2; // +2 because row 1 is header and array is 0-indexed

      try {
        // Validate required fields
        if (!row.domain || !row.domain.trim()) {
          results.failed.push({
            row: rowNumber,
            domain: row.domain || 'N/A',
            error: 'Domain is required'
          });
          continue;
        }

        if (!row.brand || !row.brand.trim()) {
          results.failed.push({
            row: rowNumber,
            domain: row.domain,
            error: 'Brand is required'
          });
          continue;
        }

        // Clean domain name (remove http, https, www, but keep paths)
        let cleanDomain = row.domain.trim().toLowerCase();
        cleanDomain = cleanDomain.replace(/^https?:\/\//i, '');
        cleanDomain = cleanDomain.replace(/^www\./i, '');
        cleanDomain = cleanDomain.split('?')[0]; // Remove query params
        cleanDomain = cleanDomain.split('#')[0]; // Remove hash
        // Keep the path (e.g., ikutalur.live/asia200-05-01-2026)

        // Validate domain format (check if base domain has a dot)
        const baseDomain = cleanDomain.split('/')[0];
        if (!baseDomain.includes('.') || baseDomain.length < 3) {
          results.failed.push({
            row: rowNumber,
            domain: row.domain,
            error: 'Invalid domain format'
          });
          continue;
        }

        // Check if domain already exists (using Set for faster lookup)
        if (existingDomainsSet.has(cleanDomain)) {
          results.skipped.push({
            row: rowNumber,
            domain: cleanDomain,
            reason: 'Already exists'
          });
          continue;
        }

        // Also check if we're about to add this domain in the current batch (within same CSV)
        const alreadyInBatch = domainBatches.some(d => d.domain === cleanDomain);
        if (alreadyInBatch) {
          results.skipped.push({
            row: rowNumber,
            domain: cleanDomain,
            reason: 'Duplicate in CSV'
          });
          continue;
        }

        // Find brand ID (try multiple variations)
        const brandKey = row.brand.trim().toUpperCase();
        let brandId = brandMap[brandKey];
        
        // If not found, try without special characters
        if (!brandId) {
          const cleanBrandKey = brandKey.replace(/[^A-Z0-9]/g, '');
          brandId = brandMap[cleanBrandKey];
        }

        if (!brandId) {
          results.failed.push({
            row: rowNumber,
            domain: cleanDomain,
            error: `Brand '${row.brand}' not found. Available brands: ${Object.keys(brandMap).slice(0, 5).join(', ')}...`
          });
          continue;
        }

        // Prepare domain for batch insert
        domainBatches.push({
          domain: cleanDomain,
          brand: brandId,
          note: row.note ? row.note.trim() : '',
          createdBy: req.user._id,
          updatedBy: req.user._id,
          rowNumber: rowNumber,
          brandName: row.brand
        });

      } catch (error) {
        results.failed.push({
          row: rowNumber,
          domain: row.domain || 'N/A',
          error: error.message
        });
      }
    }

    // Insert domains in batches
    console.log(`Starting batch insert for ${domainBatches.length} domains (${Math.ceil(domainBatches.length / BATCH_SIZE)} batches)`);
    
    for (let i = 0; i < domainBatches.length; i += BATCH_SIZE) {
      const batch = domainBatches.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      
      console.log(`Processing batch ${batchNum}: ${batch.length} domains (rows ${batch[0].rowNumber} to ${batch[batch.length-1].rowNumber})`);
      
      try {
        const domainsToInsert = batch.map(({ rowNumber, brandName, ...domain }) => domain);
        const insertResult = await Domain.insertMany(domainsToInsert, { ordered: false });
        
        console.log(`Batch ${batchNum} insertMany succeeded: ${insertResult.length} domains`);
        
        // Only mark as success the domains that were actually inserted
        const insertedDomains = new Set(insertResult.map(d => d.domain));
        
        batch.forEach(item => {
          if (insertedDomains.has(item.domain)) {
            results.success.push({
              row: item.rowNumber,
              domain: item.domain,
              brand: item.brandName
            });
          } else {
            // Domain was in batch but not inserted - likely duplicate or validation error
            results.failed.push({
              row: item.rowNumber,
              domain: item.domain,
              error: 'Insert failed silently - possibly duplicate key or validation error'
            });
            console.error(`Domain ${item.domain} (row ${item.rowNumber}) was not inserted by insertMany`);
          }
        });
      } catch (error) {
        console.log(`Batch ${batchNum} insertMany failed: ${error.message}, trying individual inserts...`);
        
        // Handle individual failures in batch
        for (const item of batch) {
          try {
            const { rowNumber, brandName, ...domain } = item;
            await Domain.create(domain);
            results.success.push({
              row: rowNumber,
              domain: item.domain,
              brand: brandName
            });
          } catch (err) {
            console.error(`Failed to insert domain ${item.domain} (row ${item.rowNumber}): ${err.message}`);
            results.failed.push({
              row: item.rowNumber,
              domain: item.domain,
              error: err.message
            });
          }
        }
      }
    }
    
    console.log(`Batch insert complete. Success: ${results.success.length}, Failed: ${results.failed.length}, Skipped: ${results.skipped.length}`);

    // Emit socket event for real-time update
    if (req.app.get('io') && results.success.length > 0) {
      req.app.get('io').emit('domains:bulk-imported', {
        count: results.success.length
      });
    }

    res.status(200).json({
      success: true,
      message: `Import completed: ${results.success.length} added, ${results.skipped.length} skipped, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    next(error);
  }
};
