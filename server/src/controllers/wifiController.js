'use strict';

const { validationResult } = require('express-validator');
const { assessWifiRisk } = require('../services/wifiRiskService');

/**
 * Handles wireless network risk evaluation.
 * @route POST /api/v1/scan/wifi
 */
async function scanWifi(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed for Wi-Fi telemetry',
        details: errors.array(),
      });
    }

    const assessment = assessWifiRisk(req.body);

    return res.status(200).json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  scanWifi,
};
