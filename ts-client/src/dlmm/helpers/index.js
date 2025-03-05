"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEstimatedComputeUnitIxWithBuffer = exports.getEstimatedComputeUnitUsageWithBuffer = exports.unwrapSOLInstruction = exports.wrapSOLInstruction = exports.parseLogs = exports.getOrCreateATAInstruction = void 0;
exports.chunks = chunks;
exports.range = range;
exports.chunkedFetchMultiplePoolAccount = chunkedFetchMultiplePoolAccount;
exports.chunkedFetchMultipleBinArrayBitmapExtensionAccount = chunkedFetchMultipleBinArrayBitmapExtensionAccount;
exports.getOutAmount = getOutAmount;
exports.getTokenDecimals = getTokenDecimals;
exports.getTokenBalance = getTokenBalance;
exports.chunkedGetMultipleAccountInfos = chunkedGetMultipleAccountInfos;
var spl_token_1 = require("@solana/spl-token");
var constants_1 = require("../constants");
var web3_js_1 = require("@solana/web3.js");
var math_1 = require("./math");
var computeUnit_1 = require("./computeUnit");
__exportStar(require("./derive"), exports);
__exportStar(require("./binArray"), exports);
__exportStar(require("./weight"), exports);
__exportStar(require("./fee"), exports);
__exportStar(require("./weightToAmounts"), exports);
__exportStar(require("./strategy"), exports);
__exportStar(require("./lbPair"), exports);
function chunks(array, size) {
    return Array.apply(0, new Array(Math.ceil(array.length / size))).map(function (_, index) { return array.slice(index * size, (index + 1) * size); });
}
function range(min, max, mapfn) {
    var length = max - min + 1;
    return Array.from({ length: length }, function (_, i) { return mapfn(min + i); });
}
function chunkedFetchMultiplePoolAccount(program_1, pks_1) {
    return __awaiter(this, arguments, void 0, function (program, pks, chunkSize) {
        var accounts;
        if (chunkSize === void 0) { chunkSize = 100; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(chunks(pks, chunkSize).map(function (chunk) {
                        return program.account.lbPair.fetchMultiple(chunk);
                    }))];
                case 1:
                    accounts = (_a.sent()).flat();
                    return [2 /*return*/, accounts.filter(Boolean)];
            }
        });
    });
}
function chunkedFetchMultipleBinArrayBitmapExtensionAccount(program_1, pks_1) {
    return __awaiter(this, arguments, void 0, function (program, pks, chunkSize) {
        var accounts;
        if (chunkSize === void 0) { chunkSize = 100; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(chunks(pks, chunkSize).map(function (chunk) {
                        return program.account.binArrayBitmapExtension.fetchMultiple(chunk);
                    }))];
                case 1:
                    accounts = (_a.sent()).flat();
                    return [2 /*return*/, accounts];
            }
        });
    });
}
function getOutAmount(bin, inAmount, swapForY) {
    return swapForY
        ? (0, math_1.mulShr)(inAmount, bin.price, constants_1.SCALE_OFFSET, math_1.Rounding.Down)
        : (0, math_1.shlDiv)(inAmount, bin.price, constants_1.SCALE_OFFSET, math_1.Rounding.Down);
}
function getTokenDecimals(conn, mint) {
    return __awaiter(this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, spl_token_1.getMint)(conn, mint)];
                case 1:
                    token = _a.sent();
                    return [4 /*yield*/, token.decimals];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var getOrCreateATAInstruction = function (connection_1, tokenMint_1, owner_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([connection_1, tokenMint_1, owner_1], args_1, true), void 0, function (connection, tokenMint, owner, payer, allowOwnerOffCurve) {
        var toAccount, e_1, ix;
        if (payer === void 0) { payer = owner; }
        if (allowOwnerOffCurve === void 0) { allowOwnerOffCurve = true; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    toAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenMint, owner, allowOwnerOffCurve);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, spl_token_1.getAccount)(connection, toAccount)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { ataPubKey: toAccount, ix: undefined }];
                case 3:
                    e_1 = _a.sent();
                    if (e_1 instanceof spl_token_1.TokenAccountNotFoundError ||
                        e_1 instanceof spl_token_1.TokenInvalidAccountOwnerError) {
                        ix = (0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(payer, toAccount, owner, tokenMint);
                        return [2 /*return*/, { ataPubKey: toAccount, ix: ix }];
                    }
                    else {
                        /* handle error */
                        console.error("Error::getOrCreateATAInstruction", e_1);
                        throw e_1;
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.getOrCreateATAInstruction = getOrCreateATAInstruction;
function getTokenBalance(conn, tokenAccount) {
    return __awaiter(this, void 0, void 0, function () {
        var acc;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, spl_token_1.getAccount)(conn, tokenAccount)];
                case 1:
                    acc = _a.sent();
                    return [2 /*return*/, acc.amount];
            }
        });
    });
}
var parseLogs = function (eventParser, logs) {
    if (!logs.length)
        throw new Error("No logs found");
    for (var _i = 0, _a = eventParser === null || eventParser === void 0 ? void 0 : eventParser.parseLogs(logs); _i < _a.length; _i++) {
        var event_1 = _a[_i];
        return event_1.data;
    }
    throw new Error("No events found");
};
exports.parseLogs = parseLogs;
var wrapSOLInstruction = function (from, to, amount) {
    return [
        web3_js_1.SystemProgram.transfer({
            fromPubkey: from,
            toPubkey: to,
            lamports: amount,
        }),
        new web3_js_1.TransactionInstruction({
            keys: [
                {
                    pubkey: to,
                    isSigner: false,
                    isWritable: true,
                },
            ],
            data: Buffer.from(new Uint8Array([17])),
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }),
    ];
};
exports.wrapSOLInstruction = wrapSOLInstruction;
var unwrapSOLInstruction = function (owner_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([owner_1], args_1, true), void 0, function (owner, allowOwnerOffCurve) {
        var wSolATAAccount, closedWrappedSolInstruction;
        if (allowOwnerOffCurve === void 0) { allowOwnerOffCurve = true; }
        return __generator(this, function (_a) {
            wSolATAAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(spl_token_1.NATIVE_MINT, owner, allowOwnerOffCurve);
            if (wSolATAAccount) {
                closedWrappedSolInstruction = (0, spl_token_1.createCloseAccountInstruction)(wSolATAAccount, owner, owner, [], spl_token_1.TOKEN_PROGRAM_ID);
                return [2 /*return*/, closedWrappedSolInstruction];
            }
            return [2 /*return*/, null];
        });
    });
};
exports.unwrapSOLInstruction = unwrapSOLInstruction;
function chunkedGetMultipleAccountInfos(connection_1, pks_1) {
    return __awaiter(this, arguments, void 0, function (connection, pks, chunkSize) {
        var accountInfos;
        if (chunkSize === void 0) { chunkSize = 100; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(chunks(pks, chunkSize).map(function (chunk) {
                        return connection.getMultipleAccountsInfo(chunk);
                    }))];
                case 1:
                    accountInfos = (_a.sent()).flat();
                    return [2 /*return*/, accountInfos];
            }
        });
    });
}
/**
 * Gets the estimated compute unit usage with a buffer.
 * @param connection A Solana connection object.
 * @param instructions The instructions of the transaction to simulate.
 * @param feePayer The public key of the fee payer.
 * @param buffer The buffer to add to the estimated compute unit usage. Max value is 1. Default value is 0.1 if not provided, and will be capped between 50k - 200k.
 * @returns The estimated compute unit usage with the buffer.
 */
var getEstimatedComputeUnitUsageWithBuffer = function (connection, instructions, feePayer, buffer) { return __awaiter(void 0, void 0, void 0, function () {
    var estimatedComputeUnitUsage, extraComputeUnitBuffer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!buffer) {
                    buffer = 0.1;
                }
                // Avoid negative value
                buffer = Math.max(0, buffer);
                // Limit buffer to 1
                buffer = Math.min(1, buffer);
                return [4 /*yield*/, (0, computeUnit_1.getSimulationComputeUnits)(connection, instructions, feePayer, [])];
            case 1:
                estimatedComputeUnitUsage = _a.sent();
                extraComputeUnitBuffer = estimatedComputeUnitUsage * buffer;
                if (extraComputeUnitBuffer > computeUnit_1.MAX_CU_BUFFER) {
                    extraComputeUnitBuffer = computeUnit_1.MAX_CU_BUFFER;
                }
                else if (extraComputeUnitBuffer < computeUnit_1.MIN_CU_BUFFER) {
                    extraComputeUnitBuffer = computeUnit_1.MIN_CU_BUFFER;
                }
                return [2 /*return*/, estimatedComputeUnitUsage + extraComputeUnitBuffer];
        }
    });
}); };
exports.getEstimatedComputeUnitUsageWithBuffer = getEstimatedComputeUnitUsageWithBuffer;
/**
 * Gets the estimated compute unit usage with a buffer and converts it to a SetComputeUnitLimit instruction.
 * If the estimated compute unit usage cannot be retrieved, returns a SetComputeUnitLimit instruction with the fallback unit.
 * @param connection A Solana connection object.
 * @param instructions The instructions of the transaction to simulate.
 * @param feePayer The public key of the fee payer.
 * @param buffer The buffer to add to the estimated compute unit usage. Max value is 1. Default value is 0.1 if not provided, and will be capped between 50k - 200k.
 * @returns A SetComputeUnitLimit instruction with the estimated compute unit usage.
 */
var getEstimatedComputeUnitIxWithBuffer = function (connection, instructions, feePayer, buffer) { return __awaiter(void 0, void 0, void 0, function () {
    var units;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getEstimatedComputeUnitUsageWithBuffer)(connection, instructions, feePayer, buffer).catch(function (error) {
                    console.error("Error::getEstimatedComputeUnitUsageWithBuffer", error);
                    return 1400000;
                })];
            case 1:
                units = _a.sent();
                return [2 /*return*/, web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: units })];
        }
    });
}); };
exports.getEstimatedComputeUnitIxWithBuffer = getEstimatedComputeUnitIxWithBuffer;
