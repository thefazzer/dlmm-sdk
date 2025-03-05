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
exports.getSimulationComputeUnits = exports.MAX_CU_BUFFER = exports.MIN_CU_BUFFER = exports.DEFAULT_ADD_LIQUIDITY_CU = void 0;
var web3_js_1 = require("@solana/web3.js");
// https://solscan.io/tx/4ryJKTB1vYmGU6YnUWwbLps18FaJjiTwgRozcgdP8RFcwp7zUZi85vgWE7rARNx2NvzDJiM9CUWArqzY7LHv38WL
exports.DEFAULT_ADD_LIQUIDITY_CU = 800000;
exports.MIN_CU_BUFFER = 50000;
exports.MAX_CU_BUFFER = 200000;
var getSimulationComputeUnits = function (connection_1, instructions_1, payer_1, lookupTables_1) {
    var args_1 = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        args_1[_i - 4] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([connection_1, instructions_1, payer_1, lookupTables_1], args_1, true), void 0, function (connection, instructions, payer, lookupTables, commitment) {
        var testInstructions, testTransaction, rpcResponse, logs;
        var _a, _b, _c;
        if (commitment === void 0) { commitment = "confirmed"; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    testInstructions = __spreadArray([
                        // Set an arbitrarily high number in simulation
                        // so we can be sure the transaction will succeed
                        // and get the real compute units used
                        web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 })
                    ], instructions, true);
                    testTransaction = new web3_js_1.VersionedTransaction(new web3_js_1.TransactionMessage({
                        instructions: testInstructions,
                        payerKey: payer,
                        // RecentBlockhash can by any public key during simulation
                        // since 'replaceRecentBlockhash' is set to 'true' below
                        recentBlockhash: web3_js_1.PublicKey.default.toString(),
                    }).compileToV0Message(lookupTables));
                    return [4 /*yield*/, connection.simulateTransaction(testTransaction, {
                            replaceRecentBlockhash: true,
                            sigVerify: false,
                            commitment: commitment,
                        })];
                case 1:
                    rpcResponse = _d.sent();
                    if ((_a = rpcResponse === null || rpcResponse === void 0 ? void 0 : rpcResponse.value) === null || _a === void 0 ? void 0 : _a.err) {
                        logs = ((_b = rpcResponse.value.logs) === null || _b === void 0 ? void 0 : _b.join("\n  • ")) || "No logs available";
                        throw new Error("Transaction simulation failed:\n  \u2022".concat(logs) +
                            JSON.stringify((_c = rpcResponse === null || rpcResponse === void 0 ? void 0 : rpcResponse.value) === null || _c === void 0 ? void 0 : _c.err));
                    }
                    return [2 /*return*/, rpcResponse.value.unitsConsumed || null];
            }
        });
    });
};
exports.getSimulationComputeUnits = getSimulationComputeUnits;
