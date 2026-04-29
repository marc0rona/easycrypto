"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const env_1 = require("../config/env");
const formatMessage = (level, message) => `[${level}] ${message}`;
exports.logger = {
    info: (message) => {
        const formattedMessage = formatMessage('INFO', message);
        if (env_1.env.isDevelopment) {
            console.log(formattedMessage);
            return;
        }
        console.log(formattedMessage);
    },
    error: (message) => {
        console.error(formatMessage('ERROR', message));
    },
};
