'use strict';

const { validationResult } = require('express-validator');
const { sanitizeAndValidateUrl } = require('../utils/urlSanitizer');
const { scanUrlWithIntelligence } = require('../services/threatIntelService');
const { calculateSecurityScore } = require('../services/scoringService');

/**
 * Handles real-time malicious URL scanning requests.
 * @route POST /api/v1/scan/url
 */
async function scanUrl(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { url } = req.body;
    const sanitization = sanitizeAndValidateUrl(url);

    if (!sanitization.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or unsafe URL input',
        message: sanitization.error,
      });
    }

    const scanResult = await scanUrlWithIntelligence(
      sanitization.sanitizedUrl,
      sanitization.parsedUrl
    );

    return res.status(200).json({
      success: true,
      data: scanResult,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles security score calculation from client telemetry matrix.
 * @route POST /api/v1/score/calculate
 */
async function calculateScore(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Invalid telemetry payload',
        details: errors.array(),
      });
    }

    const scoreResult = calculateSecurityScore(req.body);

    return res.status(200).json({
      success: true,
      data: scoreResult,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  scanUrl,
  calculateScore,
};
