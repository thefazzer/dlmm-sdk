"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.processBatch = processBatch;
exports.fetchPools = fetchPools;
exports.fetchPoolsStreaming = fetchPoolsStreaming;
var dlmm_1 = require("../dlmm");
var poolTypes_1 = require("../../../src/types/poolTypes");
var eventEmitter_1 = require("../../../src/utils/eventEmitter");
var connectionManager_1 = require("./connectionManager");
/**
 * Processes a batch of DLMM pools
 * @param poolAddresses Array of pool addresses to process
 * @param batchIndex Index of the current batch
 * @param emitter Event emitter for streaming results
 * @param options Batch processing options
 */
function processBatch(poolAddresses, batchIndex, emitter, options) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, chunks, i, _i, chunks_1, chunk, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting batch ".concat(batchIndex, " with ").concat(poolAddresses.length, " pools"));
                    connection = (0, connectionManager_1.createConnection)(options.rpcUrl);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    chunks = [];
                    for (i = 0; i < poolAddresses.length; i += options.concurrencyLimit) {
                        chunks.push(poolAddresses.slice(i, i + options.concurrencyLimit));
                    }
                    _i = 0, chunks_1 = chunks;
                    _a.label = 2;
                case 2:
                    if (!(_i < chunks_1.length)) return [3 /*break*/, 6];
                    chunk = chunks_1[_i];
                    return [4 /*yield*/, Promise.all(chunk.map(function (poolAddress) { return __awaiter(_this, void 0, void 0, function () {
                            var dlmm_2, activeBin, feeInfo, dynamicFee, activePriceUI, poolInfo, error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, (0, connectionManager_1.withRetry)(function () { return dlmm_1.DLMM.create(connection, poolAddress, {}); }, options.maxRetries, options.retryDelayMs)];
                                    case 1:
                                        dlmm_2 = _a.sent();
                                        return [4 /*yield*/, (0, connectionManager_1.withRetry)(function () { return dlmm_2.getActiveBin(); }, options.maxRetries, options.retryDelayMs)];
                                    case 2:
                                        activeBin = _a.sent();
                                        feeInfo = dlmm_2.getFeeInfo();
                                        dynamicFee = dlmm_2.getDynamicFee();
                                        activePriceUI = dlmm_2.fromPricePerLamport(Number(activeBin.price));
                                        poolInfo = {
                                            pubkey: poolAddress.toBase58(),
                                            tokenX: {
                                                mint: dlmm_2.tokenX.publicKey.toBase58(),
                                                decimal: dlmm_2.tokenX.decimal,
                                                reserve: dlmm_2.tokenX.reserve.toBase58(),
                                                amount: dlmm_2.tokenX.amount.toString(),
                                            },
                                            tokenY: {
                                                mint: dlmm_2.tokenY.publicKey.toBase58(),
                                                decimal: dlmm_2.tokenY.decimal,
                                                reserve: dlmm_2.tokenY.reserve.toBase58(),
                                                amount: dlmm_2.tokenY.amount.toString(),
                                            },
                                            binStep: dlmm_2.lbPair.binStep,
                                            activeId: dlmm_2.lbPair.activeId,
                                            activePrice: activeBin.price,
                                            activePriceUI: activePriceUI,
                                            feeInfo: {
                                                baseFeeRatePercentage: feeInfo.baseFeeRatePercentage.toString(),
                                                maxFeeRatePercentage: feeInfo.maxFeeRatePercentage.toString(),
                                                protocolFeePercentage: feeInfo.protocolFeePercentage.toString(),
                                            },
                                            dynamicFee: dynamicFee.toString(),
                                            timestamp: Date.now(),
                                        };
                                        // Emit the pool info
                                        emitter.emit(poolInfo);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        error_2 = _a.sent();
                                        console.error("Error processing pool ".concat(poolAddress.toBase58(), ":"), error_2);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 3:
                    _a.sent();
                    if (!(chunks.indexOf(chunk) < chunks.length - 1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, options.chunkDelayMs); })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_1 = _a.sent();
                    console.error("Error in batch ".concat(batchIndex, ":"), error_1);
                    emitter.emitError(error_1);
                    return [3 /*break*/, 9];
                case 8:
                    // Clean up connection resources
                    (0, connectionManager_1.safelyCloseConnection)(connection);
                    console.log("Completed batch ".concat(batchIndex));
                    emitter.completeBatch();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches and processes DLMM pools in batches
 * @param options Batch processing options
 * @returns Promise that resolves to an array of processed pool information
 */
function fetchPools() {
    return __awaiter(this, arguments, void 0, function (options) {
        var mergedOptions, emitter, allPools, completionPromise, connection, allPoolAddresses, batches, i, error_3;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mergedOptions = __assign(__assign({}, poolTypes_1.DEFAULT_BATCH_OPTIONS), options);
                    emitter = new eventEmitter_1.PoolEventEmitter();
                    allPools = [];
                    // Set up event handlers
                    emitter.onPool(function (pool) {
                        allPools.push(pool);
                        console.log("Processed pool: ".concat(pool.pubkey, " (Total: ").concat(allPools.length, ")"));
                    });
                    completionPromise = (0, eventEmitter_1.createBarrier)(emitter);
                    // Get all DLMM pools
                    console.log("Fetching DLMM pools...");
                    connection = (0, connectionManager_1.createConnection)(mergedOptions.rpcUrl);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, (0, connectionManager_1.withRetry)(function () { return dlmm_1.DLMM.getLbPairs(connection, {}); }, mergedOptions.maxRetries, mergedOptions.retryDelayMs)];
                case 2:
                    allPoolAddresses = _a.sent();
                    console.log("Found ".concat(allPoolAddresses.length, " DLMM pools"));
                    batches = [];
                    for (i = 0; i < allPoolAddresses.length; i += mergedOptions.batchSize) {
                        batches.push(allPoolAddresses.slice(i, i + mergedOptions.batchSize).map(function (pair) { return pair.publicKey; }));
                    }
                    // Set total batches in emitter
                    emitter.setTotalBatches(batches.length);
                    // Process batches
                    console.log("Processing ".concat(batches.length, " batches with size ").concat(mergedOptions.batchSize));
                    // Start all batches in parallel
                    return [4 /*yield*/, Promise.all(batches.map(function (batch, index) {
                            return processBatch(batch, index, emitter, mergedOptions);
                        }))];
                case 3:
                    // Start all batches in parallel
                    _a.sent();
                    // Wait for all batches to complete
                    return [4 /*yield*/, completionPromise];
                case 4:
                    // Wait for all batches to complete
                    _a.sent();
                    return [2 /*return*/, allPools];
                case 5:
                    error_3 = _a.sent();
                    console.error("Error fetching pools:", error_3);
                    throw error_3;
                case 6:
                    (0, connectionManager_1.safelyCloseConnection)(connection);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetches pools with a streaming API for real-time updates
 * @param callback Function to call with each processed pool
 * @param options Batch processing options
 * @returns Promise that resolves when all pools are processed
 */
function fetchPoolsStreaming(callback_1) {
    return __awaiter(this, arguments, void 0, function (callback, options) {
        var mergedOptions, emitter, completionPromise, connection, allPoolAddresses, batches, i, error_4;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mergedOptions = __assign(__assign({}, poolTypes_1.DEFAULT_BATCH_OPTIONS), options);
                    emitter = new eventEmitter_1.PoolEventEmitter();
                    // Set up event handlers
                    emitter.onPool(function (pool) {
                        callback(pool, emitter.getProgress());
                    });
                    completionPromise = (0, eventEmitter_1.createBarrier)(emitter);
                    // Get all DLMM pools
                    console.log("Fetching DLMM pools...");
                    connection = (0, connectionManager_1.createConnection)(mergedOptions.rpcUrl);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, (0, connectionManager_1.withRetry)(function () { return dlmm_1.DLMM.getLbPairs(connection, {}); }, mergedOptions.maxRetries, mergedOptions.retryDelayMs)];
                case 2:
                    allPoolAddresses = _a.sent();
                    console.log("Found ".concat(allPoolAddresses.length, " DLMM pools"));
                    batches = [];
                    for (i = 0; i < allPoolAddresses.length; i += mergedOptions.batchSize) {
                        batches.push(allPoolAddresses.slice(i, i + mergedOptions.batchSize).map(function (pair) { return pair.publicKey; }));
                    }
                    // Set total batches in emitter
                    emitter.setTotalBatches(batches.length);
                    // Process batches
                    console.log("Processing ".concat(batches.length, " batches with size ").concat(mergedOptions.batchSize));
                    // Start all batches in parallel
                    return [4 /*yield*/, Promise.all(batches.map(function (batch, index) {
                            return processBatch(batch, index, emitter, mergedOptions);
                        }))];
                case 3:
                    // Start all batches in parallel
                    _a.sent();
                    // Wait for all batches to complete
                    return [4 /*yield*/, completionPromise];
                case 4:
                    // Wait for all batches to complete
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    error_4 = _a.sent();
                    console.error("Error fetching pools:", error_4);
                    throw error_4;
                case 6:
                    (0, connectionManager_1.safelyCloseConnection)(connection);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
