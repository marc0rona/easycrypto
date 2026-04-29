"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const test_db_controller_1 = require("../controllers/test-db.controller");
const router = (0, express_1.Router)();
router.get('/', test_db_controller_1.testDatabaseConnection);
exports.default = router;
