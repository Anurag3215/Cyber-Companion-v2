'use strict';

const express = require('express');
const { body } = require('express-validator');
const threatController = require('../controllers/threatController');

const router = express.Router();

// 1. URL Threat Scan Endpoint
router.post(
  '/scan/url',
  [
    body('url')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('The "url" field is required and must be a non-empty string.')
      .isLength({ max: 2048 })
      .withMessage('URL exceeds maximum allowable length of 2048 characters.'),
  ],
  threatController.scanUrl
);

// 2. Holistic Security Score Calculation Endpoint
router.post(
  '/score/calculate',
  [
    body('wifi').optional().isObject().withMessage('"wifi" telemetry must be an object if provided.'),
    body('device').optional().isObject().withMessage('"device" telemetry must be an object if provided.'),
    body('permissions').optional().isObject().withMessage('"permissions" telemetry must be an object if provided.'),
    body('passwords').optional().isObject().withMessage('"passwords" telemetry must be an object if provided.'),
    body('threats').optional().isObject().withMessage('"threats" telemetry must be an object if provided.'),
  ],
  threatController.calculateScore
);

module.exports = router;
