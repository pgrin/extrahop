"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackLoginAttempts = void 0;
const map = new Map();
const trackLoginAttempts = (ip, windowMs) => {
    const now = Date.now();
    const record = map.get(ip);
    if (record && now - record.firstRequestTime < windowMs) {
        record.count += 1;
        return record.count;
    }
    else {
        map.set(ip, { count: 1, firstRequestTime: now });
        return 1;
    }
};
exports.trackLoginAttempts = trackLoginAttempts;
