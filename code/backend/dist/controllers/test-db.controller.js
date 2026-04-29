"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConnection = void 0;
const test_db_service_1 = require("../services/test-db.service");
const testDatabaseConnection = async (_req, res, next) => {
    try {
        const result = await test_db_service_1.testDbService.connect();
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.testDatabaseConnection = testDatabaseConnection;
