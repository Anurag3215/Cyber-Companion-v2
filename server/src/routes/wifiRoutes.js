'use strict';

const express = require('express');
const { body } = require('express-validator');
const wifiController = require('../controllers/wifiController');

const router = express.Router();

router.post(
  '/scan/wifi',
  [
    body('ssid')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 64 })
      .withMessage('SSID cannot exceed 64 characters.'),
    body('bssid')
      .optional()
      .isString()
      .trim()
      .withMessage('BSSID must be a string MAC address.'),
    body('securityType')
      .optional()
      .isString()
      .trim()
      .withMessage('securityType must be a valid protocol string (e.g. WPA3, WPA2, WEP, OPEN).'),
    body('rssi')
      .optional()
      .isNumeric()
      .withMessage('RSSI must be a numeric signal strength value in dBm.'),
    body('frequency')
      .optional()
      .isNumeric()
      .withMessage('Frequency must be a numeric frequency in MHz.'),
    body('isCaptivePortal')
      .optional()
      .isBoolean()
      .withMessage('isCaptivePortal must be a boolean.'),
    body('isArpSpoofed')
      .optional()
      .isBoolean()
      .withMessage('isArpSpoofed must be a boolean.'),
    body('hasDnsTampering')
      .optional()
      .isBoolean()
      .withMessage('hasDnsTampering must be a boolean.'),
  ],
  wifiController.scanWifi
);

router.post(
  '/analyze/wifi',
  [
    body('ssid').optional().isString().trim().isLength({ max: 64 }),
    body('bssid').optional().isString().trim(),
    body('securityType').optional().isString().trim(),
    body('rssi').optional().isNumeric(),
    body('frequency').optional().isNumeric(),
    body('isCaptivePortal').optional().isBoolean(),
    body('isArpSpoofed').optional().isBoolean(),
    body('hasDnsTampering').optional().isBoolean(),
  ],
  wifiController.scanWifi
);

module.exports = router;
