"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startStreamlitApi = startStreamlitApi;
exports.stopStreamlitApi = stopStreamlitApi;
var express = require("express");
var cors = require("cors");
var ws_1 = require("ws"); // Works with esModuleInterop enabled
var batchProcessor_1 = require("../server/batchProcessor");
var app = express.default(); // Use `.default()` if `esModuleInterop` is not enabled
var PORT = process.env.PORT || 5000;
// Enable CORS for all routes
app.use(cors.default);
app.use(express.json());
// Store active WebSocket connections
var activeConnections = [];
/**
 * Starts the API server for Streamlit integration
 */
function startStreamlitApi() {
    var _this = this;
    // REST endpoint to fetch all pools
    app.get('/get_pools', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var options, pools, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    options = {
                        rpcUrl: req.query.rpc_url || 'https://api.devnet.solana.com',
                        batchSize: req.query.batch_size ? parseInt(req.query.batch_size) : 10,
                        concurrencyLimit: req.query.concurrency ? parseInt(req.query.concurrency) : 5,
                        cluster: req.query.cluster || 'devnet'
                    };
                    return [4 /*yield*/, (0, batchProcessor_1.fetchPools)(options)];
                case 1:
                    pools = _a.sent();
                    res.json(pools);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error fetching pools:', error_1);
                    res.status(500).json({ error: 'Failed to fetch pools', details: error_1.message });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // WebSocket endpoint for streaming pool data
    var server = app.listen(PORT, function () {
        console.log("Streamlit API server running on port ".concat(PORT));
    });
    var wss = new ws_1.default.Server({ server: server });
    wss.on('connection', function (ws) {
        console.log('New WebSocket connection established');
        activeConnections.push(ws);
        ws.on('message', function (message) { return __awaiter(_this, void 0, void 0, function () {
            var data, options, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        data = JSON.parse(message.toString());
                        if (!(data.action === 'fetch_pools_streaming')) return [3 /*break*/, 2];
                        options = {
                            rpcUrl: data.rpc_url || 'https://api.devnet.solana.com',
                            batchSize: data.batch_size || 10,
                            concurrencyLimit: data.concurrency || 5,
                            cluster: data.cluster || 'devnet'
                        };
                        return [4 /*yield*/, (0, batchProcessor_1.fetchPoolsStreaming)(function (pool, progress) {
                                if (ws.readyState === ws_1.default.OPEN) {
                                    ws.send(JSON.stringify({
                                        type: 'pool_data',
                                        data: pool,
                                        progress: progress
                                    }));
                                }
                            }, options)];
                    case 1:
                        _a.sent();
                        if (ws.readyState === ws_1.default.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'complete',
                                message: 'All pools processed'
                            }));
                        }
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error processing WebSocket message:', error_2);
                        if (ws.readyState === ws_1.default.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: error_2.message
                            }));
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        ws.on('close', function () {
            console.log('WebSocket connection closed');
            var index = activeConnections.indexOf(ws);
            if (index !== -1) {
                activeConnections.splice(index, 1);
            }
        });
    });
}
/**
 * Stops the API server
 */
function stopStreamlitApi() {
    // Close all active WebSocket connections
    activeConnections.forEach(function (ws) {
        if (ws.readyState === ws_1.default.OPEN) {
            ws.close();
        }
    });
}
// Start the server if this file is run directly
if (require.main === module) {
    startStreamlitApi();
}
