"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDbService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class TestDbService {
    async connect() {
        await prisma_1.default.$connect();
        return {
            message: 'Database connected successfully',
        };
    }
}
exports.testDbService = new TestDbService();
