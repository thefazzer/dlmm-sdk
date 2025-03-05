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
exports.DLMM = void 0;
var anchor_1 = require("@coral-xyz/anchor");
var bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
var spl_token_1 = require("@solana/spl-token");
var web3_js_1 = require("@solana/web3.js");
var decimal_js_1 = require("decimal.js");
var constants_1 = require("./constants");
var error_1 = require("./error");
var helpers_1 = require("./helpers");
var math_1 = require("./helpers/math");
var idl_1 = require("./idl");
var types_1 = require("./types");
var computeUnit_1 = require("./helpers/computeUnit");
var DLMM = /** @class */ (function () {
    function DLMM(pubkey, program, lbPair, binArrayBitmapExtension, tokenX, tokenY, clock, opt) {
        this.pubkey = pubkey;
        this.program = program;
        this.lbPair = lbPair;
        this.binArrayBitmapExtension = binArrayBitmapExtension;
        this.tokenX = tokenX;
        this.tokenY = tokenY;
        this.clock = clock;
        this.opt = opt;
    }
    /** Static public method */
    /**
     * The function `getLbPairs` retrieves a list of LB pair accounts using a connection and optional
     * parameters.
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain network.
     * @param {Opt} [opt] - The `opt` parameter is an optional object that contains additional options
     * for the function. It can have the following properties:
     * @returns The function `getLbPairs` returns a Promise that resolves to an array of
     * `LbPairAccount` objects.
     */
    DLMM.getLbPairs = function (connection, opt) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, program;
            var _a, _b;
            return __generator(this, function (_c) {
                provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
                program = new anchor_1.Program(idl_1.IDL, (_a = opt === null || opt === void 0 ? void 0 : opt.programId) !== null && _a !== void 0 ? _a : constants_1.LBCLMM_PROGRAM_IDS[(_b = opt === null || opt === void 0 ? void 0 : opt.cluster) !== null && _b !== void 0 ? _b : "mainnet-beta"], provider);
                return [2 /*return*/, program.account.lbPair.all()];
            });
        });
    };
    DLMM.getPairPubkeyIfExists = function (connection, tokenX, tokenY, binStep, baseFactor, opt) {
        return __awaiter(this, void 0, void 0, function () {
            var cluster, provider, program, lbPair2Key, account2, lbPairKey, account, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cluster = (opt === null || opt === void 0 ? void 0 : opt.cluster) || "mainnet-beta";
                        provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
                        program = new anchor_1.Program(idl_1.IDL, (_a = opt === null || opt === void 0 ? void 0 : opt.programId) !== null && _a !== void 0 ? _a : constants_1.LBCLMM_PROGRAM_IDS[cluster], provider);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        lbPair2Key = (0, helpers_1.deriveLbPair2)(tokenX, tokenY, binStep, baseFactor, program.programId)[0];
                        return [4 /*yield*/, program.account.lbPair.fetchNullable(lbPair2Key)];
                    case 2:
                        account2 = _b.sent();
                        if (account2)
                            return [2 /*return*/, lbPair2Key];
                        lbPairKey = (0, helpers_1.deriveLbPair)(tokenX, tokenY, binStep, program.programId)[0];
                        return [4 /*yield*/, program.account.lbPair.fetchNullable(lbPairKey)];
                    case 3:
                        account = _b.sent();
                        if (account && account.parameters.baseFactor === baseFactor.toNumber()) {
                            return [2 /*return*/, lbPairKey];
                        }
                        return [2 /*return*/, null];
                    case 4:
                        error_2 = _b.sent();
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * The `create` function is a static method that creates a new instance of the `DLMM` class
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain network.
     * @param {PublicKey} dlmm - The PublicKey of LB Pair.
     * @param {Opt} [opt] - The `opt` parameter is an optional object that can contain additional options
     * for the `create` function. It has the following properties:
     * @returns The `create` function returns a `Promise` that resolves to a `DLMM` object.
     */
    DLMM.create = function (connection, dlmm, opt) {
        return __awaiter(this, void 0, void 0, function () {
            var cluster, provider, program, binArrayBitMapExtensionPubkey, accountsToFetch, accountsInfo, lbPairAccountInfoBuffer, lbPairAccInfo, binArrayBitMapAccountInfoBuffer, binArrayBitMapExtensionAccInfo, clockAccountInfoBuffer, clock, reserveAccountsInfo, binArrayBitmapExtension, reserveXBalance, reserveYBalance, tokenXDecimal, tokenYDecimal, tokenX, tokenY;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        cluster = (opt === null || opt === void 0 ? void 0 : opt.cluster) || "mainnet-beta";
                        provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
                        program = new anchor_1.Program(idl_1.IDL, (_a = opt === null || opt === void 0 ? void 0 : opt.programId) !== null && _a !== void 0 ? _a : constants_1.LBCLMM_PROGRAM_IDS[cluster], provider);
                        binArrayBitMapExtensionPubkey = (0, helpers_1.deriveBinArrayBitmapExtension)(dlmm, program.programId)[0];
                        accountsToFetch = [
                            dlmm,
                            binArrayBitMapExtensionPubkey,
                            web3_js_1.SYSVAR_CLOCK_PUBKEY,
                        ];
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(connection, accountsToFetch)];
                    case 1:
                        accountsInfo = _e.sent();
                        lbPairAccountInfoBuffer = (_b = accountsInfo[0]) === null || _b === void 0 ? void 0 : _b.data;
                        if (!lbPairAccountInfoBuffer)
                            throw new Error("LB Pair account ".concat(dlmm.toBase58(), " not found"));
                        lbPairAccInfo = program.coder.accounts.decode("lbPair", lbPairAccountInfoBuffer);
                        binArrayBitMapAccountInfoBuffer = (_c = accountsInfo[1]) === null || _c === void 0 ? void 0 : _c.data;
                        binArrayBitMapExtensionAccInfo = null;
                        if (binArrayBitMapAccountInfoBuffer) {
                            binArrayBitMapExtensionAccInfo = program.coder.accounts.decode("binArrayBitmapExtension", binArrayBitMapAccountInfoBuffer);
                        }
                        clockAccountInfoBuffer = (_d = accountsInfo[2]) === null || _d === void 0 ? void 0 : _d.data;
                        if (!clockAccountInfoBuffer)
                            throw new Error("Clock account not found");
                        clock = types_1.ClockLayout.decode(clockAccountInfoBuffer);
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(program.provider.connection, [
                                lbPairAccInfo.reserveX,
                                lbPairAccInfo.reserveY,
                                lbPairAccInfo.tokenXMint,
                                lbPairAccInfo.tokenYMint,
                            ])];
                    case 2:
                        reserveAccountsInfo = _e.sent();
                        if (binArrayBitMapExtensionAccInfo) {
                            binArrayBitmapExtension = {
                                account: binArrayBitMapExtensionAccInfo,
                                publicKey: binArrayBitMapExtensionPubkey,
                            };
                        }
                        reserveXBalance = spl_token_1.AccountLayout.decode(reserveAccountsInfo[0].data);
                        reserveYBalance = spl_token_1.AccountLayout.decode(reserveAccountsInfo[1].data);
                        tokenXDecimal = spl_token_1.MintLayout.decode(reserveAccountsInfo[2].data).decimals;
                        tokenYDecimal = spl_token_1.MintLayout.decode(reserveAccountsInfo[3].data).decimals;
                        tokenX = {
                            publicKey: lbPairAccInfo.tokenXMint,
                            reserve: lbPairAccInfo.reserveX,
                            amount: reserveXBalance.amount,
                            decimal: tokenXDecimal,
                        };
                        tokenY = {
                            publicKey: lbPairAccInfo.tokenYMint,
                            reserve: lbPairAccInfo.reserveY,
                            amount: reserveYBalance.amount,
                            decimal: tokenYDecimal,
                        };
                        return [2 /*return*/, new DLMM(dlmm, program, lbPairAccInfo, binArrayBitmapExtension, tokenX, tokenY, clock, opt)];
                }
            });
        });
    };
    /**
     * Similar to `create` function, but it accept multiple lbPairs to be initialized.
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain network.
     * @param dlmmList - An Array of PublicKey of LB Pairs.
     * @param {Opt} [opt] - An optional parameter of type `Opt`.
     * @returns The function `createMultiple` returns a Promise that resolves to an array of `DLMM`
     * objects.
     */
    DLMM.createMultiple = function (connection, dlmmList, opt) {
        return __awaiter(this, void 0, void 0, function () {
            var cluster, provider, program, binArrayBitMapExtensions, accountsToFetch, accountsInfo, clockAccount, clockAccountInfoBuffer, clock, lbPairArraysMap, i, lbPairPubKey, lbPairAccountInfoBuffer, binArrayAccInfo, binArrayBitMapExtensionsMap, i, index, lbPairPubkey, binArrayBitMapAccountInfoBuffer, binArrayBitMapExtensionAccInfo, reservePublicKeys, tokenMintPublicKeys, reserveAndTokenMintAccountsInfo, lbClmmImpl;
            var _this = this;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        cluster = (opt === null || opt === void 0 ? void 0 : opt.cluster) || "mainnet-beta";
                        provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
                        program = new anchor_1.Program(idl_1.IDL, (_a = opt === null || opt === void 0 ? void 0 : opt.programId) !== null && _a !== void 0 ? _a : constants_1.LBCLMM_PROGRAM_IDS[cluster], provider);
                        binArrayBitMapExtensions = dlmmList.map(function (lbPair) { return (0, helpers_1.deriveBinArrayBitmapExtension)(lbPair, program.programId)[0]; });
                        accountsToFetch = __spreadArray(__spreadArray(__spreadArray([], dlmmList, true), binArrayBitMapExtensions, true), [
                            web3_js_1.SYSVAR_CLOCK_PUBKEY,
                        ], false);
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(connection, accountsToFetch)];
                    case 1:
                        accountsInfo = _d.sent();
                        clockAccount = accountsInfo.pop();
                        clockAccountInfoBuffer = clockAccount === null || clockAccount === void 0 ? void 0 : clockAccount.data;
                        if (!clockAccountInfoBuffer)
                            throw new Error("Clock account not found");
                        clock = types_1.ClockLayout.decode(clockAccountInfoBuffer);
                        lbPairArraysMap = new Map();
                        for (i = 0; i < dlmmList.length; i++) {
                            lbPairPubKey = dlmmList[i];
                            lbPairAccountInfoBuffer = (_b = accountsInfo[i]) === null || _b === void 0 ? void 0 : _b.data;
                            if (!lbPairAccountInfoBuffer)
                                throw new Error("LB Pair account ".concat(lbPairPubKey.toBase58(), " not found"));
                            binArrayAccInfo = program.coder.accounts.decode("lbPair", lbPairAccountInfoBuffer);
                            lbPairArraysMap.set(lbPairPubKey.toBase58(), binArrayAccInfo);
                        }
                        binArrayBitMapExtensionsMap = new Map();
                        for (i = dlmmList.length; i < accountsInfo.length; i++) {
                            index = i - dlmmList.length;
                            lbPairPubkey = dlmmList[index];
                            binArrayBitMapAccountInfoBuffer = (_c = accountsInfo[i]) === null || _c === void 0 ? void 0 : _c.data;
                            if (binArrayBitMapAccountInfoBuffer) {
                                binArrayBitMapExtensionAccInfo = program.coder.accounts.decode("binArrayBitmapExtension", binArrayBitMapAccountInfoBuffer);
                                binArrayBitMapExtensionsMap.set(lbPairPubkey.toBase58(), binArrayBitMapExtensionAccInfo);
                            }
                        }
                        reservePublicKeys = Array.from(lbPairArraysMap.values())
                            .map(function (_a) {
                            var reserveX = _a.reserveX, reserveY = _a.reserveY;
                            return [reserveX, reserveY];
                        })
                            .flat();
                        tokenMintPublicKeys = Array.from(lbPairArraysMap.values())
                            .map(function (_a) {
                            var tokenXMint = _a.tokenXMint, tokenYMint = _a.tokenYMint;
                            return [tokenXMint, tokenYMint];
                        })
                            .flat();
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(program.provider.connection, __spreadArray(__spreadArray([], reservePublicKeys, true), tokenMintPublicKeys, true))];
                    case 2:
                        reserveAndTokenMintAccountsInfo = _d.sent();
                        return [4 /*yield*/, Promise.all(dlmmList.map(function (lbPair, index) { return __awaiter(_this, void 0, void 0, function () {
                                var lbPairState, binArrayBitmapExtensionState, binArrayBitmapExtensionPubkey, binArrayBitmapExtension, reserveXAccountInfo, reserveYAccountInfo, tokenXMintAccountInfo, tokenYMintAccountInfo, reserveXBalance, reserveYBalance, tokenXDecimal, tokenYDecimal, tokenX, tokenY;
                                return __generator(this, function (_a) {
                                    lbPairState = lbPairArraysMap.get(lbPair.toBase58());
                                    if (!lbPairState)
                                        throw new Error("LB Pair ".concat(lbPair.toBase58(), " state not found"));
                                    binArrayBitmapExtensionState = binArrayBitMapExtensionsMap.get(lbPair.toBase58());
                                    binArrayBitmapExtensionPubkey = binArrayBitMapExtensions[index];
                                    binArrayBitmapExtension = null;
                                    if (binArrayBitmapExtensionState) {
                                        binArrayBitmapExtension = {
                                            account: binArrayBitmapExtensionState,
                                            publicKey: binArrayBitmapExtensionPubkey,
                                        };
                                    }
                                    reserveXAccountInfo = reserveAndTokenMintAccountsInfo[index * 2];
                                    reserveYAccountInfo = reserveAndTokenMintAccountsInfo[index * 2 + 1];
                                    tokenXMintAccountInfo = reserveAndTokenMintAccountsInfo[reservePublicKeys.length + index * 2];
                                    tokenYMintAccountInfo = reserveAndTokenMintAccountsInfo[reservePublicKeys.length + index * 2 + 1];
                                    if (!reserveXAccountInfo || !reserveYAccountInfo)
                                        throw new Error("Reserve account for LB Pair ".concat(lbPair.toBase58(), " not found"));
                                    reserveXBalance = spl_token_1.AccountLayout.decode(reserveXAccountInfo.data);
                                    reserveYBalance = spl_token_1.AccountLayout.decode(reserveYAccountInfo.data);
                                    tokenXDecimal = spl_token_1.MintLayout.decode(tokenXMintAccountInfo.data).decimals;
                                    tokenYDecimal = spl_token_1.MintLayout.decode(tokenYMintAccountInfo.data).decimals;
                                    tokenX = {
                                        publicKey: lbPairState.tokenXMint,
                                        reserve: lbPairState.reserveX,
                                        amount: reserveXBalance.amount,
                                        decimal: tokenXDecimal,
                                    };
                                    tokenY = {
                                        publicKey: lbPairState.tokenYMint,
                                        reserve: lbPairState.reserveY,
                                        amount: reserveYBalance.amount,
                                        decimal: tokenYDecimal,
                                    };
                                    return [2 /*return*/, new DLMM(lbPair, program, lbPairState, binArrayBitmapExtension, tokenX, tokenY, clock, opt)];
                                });
                            }); }))];
                    case 3:
                        lbClmmImpl = _d.sent();
                        return [2 /*return*/, lbClmmImpl];
                }
            });
        });
    };
    DLMM.getAllPresetParameters = function (connection, opt) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, program, presetParameter;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
                        program = new anchor_1.Program(idl_1.IDL, (_a = opt === null || opt === void 0 ? void 0 : opt.programId) !== null && _a !== void 0 ? _a : constants_1.LBCLMM_PROGRAM_IDS[(_b = opt === null || opt === void 0 ? void 0 : opt.cluster) !== null && _b !== void 0 ? _b : "mainnet-beta"], provider);
                        return [4 /*yield*/, program.account.presetParameter.all()];
                    case 1:
                        presetParameter = _c.sent();
                        return [2 /*return*/, presetParameter];
                }
            });
        });
    };
    /**
     * The function `getAllLbPairPositionsByUser` retrieves all liquidity pool pair positions for a given
     * user.
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain.
     * @param {PublicKey} userPubKey - The user's wallet public key.
     * @param {Opt} [opt] - An optional object that contains additional options for the function.
     * @returns The function `getAllLbPairPositionsByUser` returns a `Promise` that resolves to a `Map`
     * object. The `Map` object contains key-value pairs, where the key is a string representing the LB
     * Pair account, and the value is an object of PositionInfo
     */
    DLMM.getAllLbPairPositionsByUser = function (connection, userPubKey, opt) {
        return __awaiter(this, void 0, void 0, function () {
            var cluster, provider, program, positionsV2, binArrayPubkeySetV2, lbPairSetV2, binArrayPubkeyArrayV2, lbPairArrayV2, _a, clockAccInfo, binArraysAccInfo, positionBinArraysMapV2, i, binArrayPubkey, binArrayAccInfoBufferV2, binArrayAccInfo, lbPairArraysMapV2, i, lbPairPubkey, lbPairAccInfoBufferV2, lbPairAccInfo, reservePublicKeysV2, reserveAccountsInfo, lbPairReserveMapV2, lbPairMintMapV2, onChainTimestamp, positionsMap, _i, positionsV2_1, position, account, positionPubKey, upperBinId, lowerBinId, lbPair, feeOwner, lowerBinArrayIndex, upperBinArrayIndex, lowerBinArrayPubKey, upperBinArrayPubKey, lowerBinArray, upperBinArray, lbPairAcc, _b, baseTokenDecimal, quoteTokenDecimal, reserveXBalance, reserveYBalance, tokenX, tokenY, positionData, _c;
            var _d, _e, _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        cluster = (opt === null || opt === void 0 ? void 0 : opt.cluster) || "mainnet-beta";
                        provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
                        program = new anchor_1.Program(idl_1.IDL, (_d = opt === null || opt === void 0 ? void 0 : opt.programId) !== null && _d !== void 0 ? _d : constants_1.LBCLMM_PROGRAM_IDS[cluster], provider);
                        return [4 /*yield*/, program.account.positionV2.all([
                                {
                                    memcmp: {
                                        bytes: bytes_1.bs58.encode(userPubKey.toBuffer()),
                                        offset: 8 + 32,
                                    },
                                },
                            ])];
                    case 1:
                        positionsV2 = _l.sent();
                        binArrayPubkeySetV2 = new Set();
                        lbPairSetV2 = new Set();
                        positionsV2.forEach(function (_a) {
                            var _b = _a.account, upperBinId = _b.upperBinId, lowerBinId = _b.lowerBinId, lbPair = _b.lbPair;
                            var lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
                            var upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId));
                            var lowerBinArrayPubKey = (0, helpers_1.deriveBinArray)(lbPair, lowerBinArrayIndex, program.programId)[0];
                            var upperBinArrayPubKey = (0, helpers_1.deriveBinArray)(lbPair, upperBinArrayIndex, program.programId)[0];
                            binArrayPubkeySetV2.add(lowerBinArrayPubKey.toBase58());
                            binArrayPubkeySetV2.add(upperBinArrayPubKey.toBase58());
                            lbPairSetV2.add(lbPair.toBase58());
                        });
                        binArrayPubkeyArrayV2 = Array.from(binArrayPubkeySetV2).map(function (pubkey) { return new web3_js_1.PublicKey(pubkey); });
                        lbPairArrayV2 = Array.from(lbPairSetV2).map(function (pubkey) { return new web3_js_1.PublicKey(pubkey); });
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(connection, __spreadArray(__spreadArray([
                                web3_js_1.SYSVAR_CLOCK_PUBKEY
                            ], binArrayPubkeyArrayV2, true), lbPairArrayV2, true))];
                    case 2:
                        _a = _l.sent(), clockAccInfo = _a[0], binArraysAccInfo = _a.slice(1);
                        positionBinArraysMapV2 = new Map();
                        for (i = 0; i < binArrayPubkeyArrayV2.length; i++) {
                            binArrayPubkey = binArrayPubkeyArrayV2[i];
                            binArrayAccInfoBufferV2 = binArraysAccInfo[i];
                            if (binArrayAccInfoBufferV2) {
                                binArrayAccInfo = program.coder.accounts.decode("binArray", binArrayAccInfoBufferV2.data);
                                positionBinArraysMapV2.set(binArrayPubkey.toBase58(), binArrayAccInfo);
                            }
                        }
                        lbPairArraysMapV2 = new Map();
                        for (i = binArrayPubkeyArrayV2.length; i < binArraysAccInfo.length; i++) {
                            lbPairPubkey = lbPairArrayV2[i - binArrayPubkeyArrayV2.length];
                            lbPairAccInfoBufferV2 = binArraysAccInfo[i];
                            if (!lbPairAccInfoBufferV2)
                                throw new Error("LB Pair account ".concat(lbPairPubkey.toBase58(), " not found"));
                            lbPairAccInfo = program.coder.accounts.decode("lbPair", lbPairAccInfoBufferV2.data);
                            lbPairArraysMapV2.set(lbPairPubkey.toBase58(), lbPairAccInfo);
                        }
                        reservePublicKeysV2 = Array.from(lbPairArraysMapV2.values())
                            .map(function (_a) {
                            var reserveX = _a.reserveX, reserveY = _a.reserveY, tokenXMint = _a.tokenXMint, tokenYMint = _a.tokenYMint;
                            return [
                                reserveX,
                                reserveY,
                                tokenXMint,
                                tokenYMint,
                            ];
                        })
                            .flat();
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(program.provider.connection, reservePublicKeysV2)];
                    case 3:
                        reserveAccountsInfo = _l.sent();
                        lbPairReserveMapV2 = new Map();
                        lbPairMintMapV2 = new Map();
                        lbPairArrayV2.forEach(function (lbPair, idx) {
                            var index = idx * 4;
                            var reserveAccBufferXV2 = reserveAccountsInfo[index];
                            var reserveAccBufferYV2 = reserveAccountsInfo[index + 1];
                            if (!reserveAccBufferXV2 || !reserveAccBufferYV2)
                                throw new Error("Reserve account for LB Pair ".concat(lbPair.toBase58(), " not found"));
                            var reserveAccX = spl_token_1.AccountLayout.decode(reserveAccBufferXV2.data);
                            var reserveAccY = spl_token_1.AccountLayout.decode(reserveAccBufferYV2.data);
                            lbPairReserveMapV2.set(lbPair.toBase58(), {
                                reserveX: reserveAccX.amount,
                                reserveY: reserveAccY.amount,
                            });
                            var mintXBufferV2 = reserveAccountsInfo[index + 2];
                            var mintYBufferV2 = reserveAccountsInfo[index + 3];
                            if (!mintXBufferV2 || !mintYBufferV2)
                                throw new Error("Mint account for LB Pair ".concat(lbPair.toBase58(), " not found"));
                            var mintX = spl_token_1.MintLayout.decode(mintXBufferV2.data);
                            var mintY = spl_token_1.MintLayout.decode(mintYBufferV2.data);
                            lbPairMintMapV2.set(lbPair.toBase58(), {
                                mintXDecimal: mintX.decimals,
                                mintYDecimal: mintY.decimals,
                            });
                        });
                        onChainTimestamp = new anchor_1.BN(clockAccInfo.data.readBigInt64LE(32).toString()).toNumber();
                        positionsMap = new Map();
                        _i = 0, positionsV2_1 = positionsV2;
                        _l.label = 4;
                    case 4:
                        if (!(_i < positionsV2_1.length)) return [3 /*break*/, 10];
                        position = positionsV2_1[_i];
                        account = position.account, positionPubKey = position.publicKey;
                        upperBinId = account.upperBinId, lowerBinId = account.lowerBinId, lbPair = account.lbPair, feeOwner = account.feeOwner;
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
                        upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId));
                        lowerBinArrayPubKey = (0, helpers_1.deriveBinArray)(lbPair, lowerBinArrayIndex, program.programId)[0];
                        upperBinArrayPubKey = (0, helpers_1.deriveBinArray)(lbPair, upperBinArrayIndex, program.programId)[0];
                        lowerBinArray = positionBinArraysMapV2.get(lowerBinArrayPubKey.toBase58());
                        upperBinArray = positionBinArraysMapV2.get(upperBinArrayPubKey.toBase58());
                        lbPairAcc = lbPairArraysMapV2.get(lbPair.toBase58());
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getTokenDecimals)(program.provider.connection, lbPairAcc.tokenXMint),
                                (0, helpers_1.getTokenDecimals)(program.provider.connection, lbPairAcc.tokenYMint),
                            ])];
                    case 5:
                        _b = _l.sent(), baseTokenDecimal = _b[0], quoteTokenDecimal = _b[1];
                        reserveXBalance = (_f = (_e = lbPairReserveMapV2.get(lbPair.toBase58())) === null || _e === void 0 ? void 0 : _e.reserveX) !== null && _f !== void 0 ? _f : BigInt(0);
                        reserveYBalance = (_h = (_g = lbPairReserveMapV2.get(lbPair.toBase58())) === null || _g === void 0 ? void 0 : _g.reserveY) !== null && _h !== void 0 ? _h : BigInt(0);
                        tokenX = {
                            publicKey: lbPairAcc.tokenXMint,
                            reserve: lbPairAcc.reserveX,
                            amount: reserveXBalance,
                            decimal: baseTokenDecimal,
                        };
                        tokenY = {
                            publicKey: lbPairAcc.tokenYMint,
                            reserve: lbPairAcc.reserveY,
                            amount: reserveYBalance,
                            decimal: quoteTokenDecimal,
                        };
                        if (!(!!lowerBinArray && !!upperBinArray)) return [3 /*break*/, 7];
                        return [4 /*yield*/, DLMM.processPosition(program, types_1.PositionVersion.V2, lbPairAcc, onChainTimestamp, account, baseTokenDecimal, quoteTokenDecimal, lowerBinArray, upperBinArray, feeOwner)];
                    case 6:
                        _c = _l.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _c = {
                            totalXAmount: '0',
                            totalYAmount: '0',
                            positionBinData: [],
                            lastUpdatedAt: new anchor_1.BN(0),
                            upperBinId: upperBinId,
                            lowerBinId: lowerBinId,
                            feeX: new anchor_1.BN(0),
                            feeY: new anchor_1.BN(0),
                            rewardOne: new anchor_1.BN(0),
                            rewardTwo: new anchor_1.BN(0),
                            feeOwner: feeOwner,
                            totalClaimedFeeXAmount: new anchor_1.BN(0),
                            totalClaimedFeeYAmount: new anchor_1.BN(0),
                        };
                        _l.label = 8;
                    case 8:
                        positionData = _c;
                        if (positionData) {
                            positionsMap.set(lbPair.toBase58(), {
                                publicKey: lbPair,
                                lbPair: lbPairAcc,
                                tokenX: tokenX,
                                tokenY: tokenY,
                                lbPairPositionsData: __spreadArray(__spreadArray([], ((_k = (_j = positionsMap.get(lbPair.toBase58())) === null || _j === void 0 ? void 0 : _j.lbPairPositionsData) !== null && _k !== void 0 ? _k : []), true), [
                                    {
                                        publicKey: positionPubKey,
                                        positionData: positionData,
                                        version: types_1.PositionVersion.V2,
                                    },
                                ], false),
                            });
                        }
                        _l.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 4];
                    case 10: return [2 /*return*/, positionsMap];
                }
            });
        });
    };
    DLMM.getPricePerLamport = function (tokenXDecimal, tokenYDecimal, price) {
        return new decimal_js_1.default(price)
            .mul(new decimal_js_1.default(Math.pow(10, (tokenYDecimal - tokenXDecimal))))
            .toString();
    };
    DLMM.getBinIdFromPrice = function (price, binStep, min) {
        var binStepNum = new decimal_js_1.default(binStep).div(new decimal_js_1.default(constants_1.BASIS_POINT_MAX));
        var binId = new decimal_js_1.default(price)
            .log()
            .dividedBy(new decimal_js_1.default(1).add(binStepNum).log());
        return (min ? binId.floor() : binId.ceil()).toNumber();
    };
    /** Public methods */
    DLMM.createPermissionLbPair = function (connection, binStep, tokenX, tokenY, activeId, baseKey, creatorKey, feeBps, activationType, opt) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, program, lbPair, reserveX, reserveY, oracle, activeBinArrayIndex, binArrayBitmapExtension, _a, minBinId, maxBinId, ixData;
            var _b;
            return __generator(this, function (_c) {
                provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
                program = new anchor_1.Program(idl_1.IDL, (_b = opt === null || opt === void 0 ? void 0 : opt.programId) !== null && _b !== void 0 ? _b : constants_1.LBCLMM_PROGRAM_IDS[opt.cluster], provider);
                lbPair = (0, helpers_1.derivePermissionLbPair)(baseKey, tokenX, tokenY, binStep, program.programId)[0];
                reserveX = (0, helpers_1.deriveReserve)(tokenX, lbPair, program.programId)[0];
                reserveY = (0, helpers_1.deriveReserve)(tokenY, lbPair, program.programId)[0];
                oracle = (0, helpers_1.deriveOracle)(lbPair, program.programId)[0];
                activeBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(activeId);
                binArrayBitmapExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(activeBinArrayIndex)
                    ? (0, helpers_1.deriveBinArrayBitmapExtension)(lbPair, program.programId)[0]
                    : null;
                _a = (0, math_1.findSwappableMinMaxBinId)(binStep), minBinId = _a.minBinId, maxBinId = _a.maxBinId;
                ixData = {
                    activeId: activeId.toNumber(),
                    binStep: binStep.toNumber(),
                    baseFactor: (0, math_1.computeBaseFactorFromFeeBps)(binStep, feeBps).toNumber(),
                    minBinId: minBinId.toNumber(),
                    maxBinId: maxBinId.toNumber(),
                    activationType: activationType,
                };
                return [2 /*return*/, program.methods
                        .initializePermissionLbPair(ixData)
                        .accounts({
                        lbPair: lbPair,
                        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                        reserveX: reserveX,
                        reserveY: reserveY,
                        binArrayBitmapExtension: binArrayBitmapExtension,
                        tokenMintX: tokenX,
                        tokenMintY: tokenY,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        oracle: oracle,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        admin: creatorKey,
                        base: baseKey,
                    })
                        .transaction()];
            });
        });
    };
    DLMM.createCustomizablePermissionlessLbPair = function (connection, binStep, tokenX, tokenY, activeId, feeBps, activationType, hasAlphaVault, creatorKey, activationPoint, opt) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, program, lbPair, reserveX, reserveY, oracle, activeBinArrayIndex, binArrayBitmapExtension, ixData, userTokenX, userTokenY;
            var _a;
            return __generator(this, function (_b) {
                provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
                program = new anchor_1.Program(idl_1.IDL, (_a = opt === null || opt === void 0 ? void 0 : opt.programId) !== null && _a !== void 0 ? _a : constants_1.LBCLMM_PROGRAM_IDS[opt.cluster], provider);
                lbPair = (0, helpers_1.deriveCustomizablePermissionlessLbPair)(tokenX, tokenY, program.programId)[0];
                reserveX = (0, helpers_1.deriveReserve)(tokenX, lbPair, program.programId)[0];
                reserveY = (0, helpers_1.deriveReserve)(tokenY, lbPair, program.programId)[0];
                oracle = (0, helpers_1.deriveOracle)(lbPair, program.programId)[0];
                activeBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(activeId);
                binArrayBitmapExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(activeBinArrayIndex)
                    ? (0, helpers_1.deriveBinArrayBitmapExtension)(lbPair, program.programId)[0]
                    : null;
                ixData = {
                    activeId: activeId.toNumber(),
                    binStep: binStep.toNumber(),
                    baseFactor: (0, math_1.computeBaseFactorFromFeeBps)(binStep, feeBps).toNumber(),
                    activationType: activationType,
                    activationPoint: activationPoint ? activationPoint : null,
                    hasAlphaVault: hasAlphaVault,
                    padding: Array(64).fill(0),
                };
                userTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenX, creatorKey);
                userTokenY = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenY, creatorKey);
                return [2 /*return*/, program.methods
                        .initializeCustomizablePermissionlessLbPair(ixData)
                        .accounts({
                        lbPair: lbPair,
                        reserveX: reserveX,
                        reserveY: reserveY,
                        binArrayBitmapExtension: binArrayBitmapExtension,
                        tokenMintX: tokenX,
                        tokenMintY: tokenY,
                        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        oracle: oracle,
                        systemProgram: web3_js_1.SystemProgram.programId,
                        userTokenX: userTokenX,
                        userTokenY: userTokenY,
                        funder: creatorKey,
                    })
                        .transaction()];
            });
        });
    };
    DLMM.createLbPair = function (connection, funder, tokenX, tokenY, binStep, baseFactor, presetParameter, activeId, opt) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, program, existsPool, lbPair, reserveX, reserveY, oracle, activeBinArrayIndex, binArrayBitmapExtension;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
                        program = new anchor_1.Program(idl_1.IDL, (_a = opt === null || opt === void 0 ? void 0 : opt.programId) !== null && _a !== void 0 ? _a : constants_1.LBCLMM_PROGRAM_IDS[opt.cluster], provider);
                        return [4 /*yield*/, this.getPairPubkeyIfExists(connection, tokenX, tokenY, binStep, baseFactor)];
                    case 1:
                        existsPool = _b.sent();
                        if (existsPool) {
                            throw new Error("Pool already exists");
                        }
                        lbPair = (0, helpers_1.deriveLbPair2)(tokenX, tokenY, binStep, baseFactor, program.programId)[0];
                        reserveX = (0, helpers_1.deriveReserve)(tokenX, lbPair, program.programId)[0];
                        reserveY = (0, helpers_1.deriveReserve)(tokenY, lbPair, program.programId)[0];
                        oracle = (0, helpers_1.deriveOracle)(lbPair, program.programId)[0];
                        activeBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(activeId);
                        binArrayBitmapExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(activeBinArrayIndex)
                            ? (0, helpers_1.deriveBinArrayBitmapExtension)(lbPair, program.programId)[0]
                            : null;
                        return [2 /*return*/, program.methods
                                .initializeLbPair(activeId.toNumber(), binStep.toNumber())
                                .accounts({
                                funder: funder,
                                lbPair: lbPair,
                                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                                reserveX: reserveX,
                                reserveY: reserveY,
                                binArrayBitmapExtension: binArrayBitmapExtension,
                                tokenMintX: tokenX,
                                tokenMintY: tokenY,
                                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                oracle: oracle,
                                presetParameter: presetParameter,
                                systemProgram: web3_js_1.SystemProgram.programId,
                            })
                                .transaction()];
                }
            });
        });
    };
    /**
     * The function `refetchStates` retrieves and updates various states and data related to bin arrays
     * and lb pairs.
     */
    DLMM.prototype.refetchStates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var binArrayBitmapExtensionPubkey, _a, lbPairAccountInfo, binArrayBitmapExtensionAccountInfo, reserveXAccountInfo, reserveYAccountInfo, lbPairState, binArrayBitmapExtensionState, reserveXBalance, reserveYBalance, _b, tokenXDecimal, tokenYDecimal;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        binArrayBitmapExtensionPubkey = (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0];
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(this.program.provider.connection, [
                                this.pubkey,
                                binArrayBitmapExtensionPubkey,
                                this.lbPair.reserveX,
                                this.lbPair.reserveY,
                            ])];
                    case 1:
                        _a = _c.sent(), lbPairAccountInfo = _a[0], binArrayBitmapExtensionAccountInfo = _a[1], reserveXAccountInfo = _a[2], reserveYAccountInfo = _a[3];
                        lbPairState = this.program.coder.accounts.decode("lbPair", lbPairAccountInfo.data);
                        if (binArrayBitmapExtensionAccountInfo) {
                            binArrayBitmapExtensionState = this.program.coder.accounts.decode("binArrayBitmapExtension", binArrayBitmapExtensionAccountInfo.data);
                            if (binArrayBitmapExtensionState) {
                                this.binArrayBitmapExtension = {
                                    account: binArrayBitmapExtensionState,
                                    publicKey: binArrayBitmapExtensionPubkey,
                                };
                            }
                        }
                        reserveXBalance = spl_token_1.AccountLayout.decode(reserveXAccountInfo.data);
                        reserveYBalance = spl_token_1.AccountLayout.decode(reserveYAccountInfo.data);
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getTokenDecimals)(this.program.provider.connection, lbPairState.tokenXMint),
                                (0, helpers_1.getTokenDecimals)(this.program.provider.connection, lbPairState.tokenYMint),
                            ])];
                    case 2:
                        _b = _c.sent(), tokenXDecimal = _b[0], tokenYDecimal = _b[1];
                        this.tokenX = {
                            amount: reserveXBalance.amount,
                            decimal: tokenXDecimal,
                            publicKey: lbPairState.tokenXMint,
                            reserve: lbPairState.reserveX,
                        };
                        this.tokenY = {
                            amount: reserveYBalance.amount,
                            decimal: tokenYDecimal,
                            publicKey: lbPairState.tokenYMint,
                            reserve: lbPairState.reserveY,
                        };
                        this.lbPair = lbPairState;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * The function `getBinArrays` returns an array of `BinArrayAccount` objects
     * @returns a Promise that resolves to an array of BinArrayAccount objects.
     */
    DLMM.prototype.getBinArrays = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.program.account.binArray.all([
                        {
                            memcmp: {
                                bytes: bytes_1.bs58.encode(this.pubkey.toBuffer()),
                                offset: 8 + 16,
                            },
                        },
                    ])];
            });
        });
    };
    /**
     * The function `getBinArrayAroundActiveBin` retrieves a specified number of `BinArrayAccount`
     * objects from the blockchain, based on the active bin and its surrounding bin arrays.
     * @param
     *    swapForY - The `swapForY` parameter is a boolean value that indicates whether the swap is using quote token as input.
     *    [count=4] - The `count` parameter is the number of bin arrays to retrieve on left and right respectively. By default, it is set to 4.
     * @returns an array of `BinArrayAccount` objects.
     */
    DLMM.prototype.getBinArrayForSwap = function (swapForY_1) {
        return __awaiter(this, arguments, void 0, function (swapForY, count) {
            var binArraysPubkey, shouldStop, activeIdToLoop, binArrayIndex, binArrayPubKey, _a, lowerBinId, upperBinId, accountsToFetch, binArraysAccInfoBuffer, binArrays;
            var _this = this;
            var _b, _c;
            if (count === void 0) { count = 4; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.refetchStates()];
                    case 1:
                        _d.sent();
                        binArraysPubkey = new Set();
                        shouldStop = false;
                        activeIdToLoop = this.lbPair.activeId;
                        while (!shouldStop) {
                            binArrayIndex = (0, helpers_1.findNextBinArrayIndexWithLiquidity)(swapForY, new anchor_1.BN(activeIdToLoop), this.lbPair, (_c = (_b = this.binArrayBitmapExtension) === null || _b === void 0 ? void 0 : _b.account) !== null && _c !== void 0 ? _c : null);
                            if (binArrayIndex === null)
                                shouldStop = true;
                            else {
                                binArrayPubKey = (0, helpers_1.deriveBinArray)(this.pubkey, binArrayIndex, this.program.programId)[0];
                                binArraysPubkey.add(binArrayPubKey.toBase58());
                                _a = (0, helpers_1.getBinArrayLowerUpperBinId)(binArrayIndex), lowerBinId = _a[0], upperBinId = _a[1];
                                activeIdToLoop = swapForY
                                    ? lowerBinId.toNumber() - 1
                                    : upperBinId.toNumber() + 1;
                            }
                            if (binArraysPubkey.size === count)
                                shouldStop = true;
                        }
                        accountsToFetch = Array.from(binArraysPubkey).map(function (pubkey) { return new web3_js_1.PublicKey(pubkey); });
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(this.program.provider.connection, accountsToFetch)];
                    case 2:
                        binArraysAccInfoBuffer = _d.sent();
                        return [4 /*yield*/, Promise.all(binArraysAccInfoBuffer.map(function (accInfo, idx) { return __awaiter(_this, void 0, void 0, function () {
                                var account, publicKey;
                                return __generator(this, function (_a) {
                                    account = this.program.coder.accounts.decode("binArray", accInfo.data);
                                    publicKey = accountsToFetch[idx];
                                    return [2 /*return*/, {
                                            account: account,
                                            publicKey: publicKey,
                                        }];
                                });
                            }); }))];
                    case 3:
                        binArrays = _d.sent();
                        return [2 /*return*/, binArrays];
                }
            });
        });
    };
    DLMM.calculateFeeInfo = function (baseFactor, binStep) {
        var baseFeeRate = new anchor_1.BN(baseFactor).mul(new anchor_1.BN(binStep)).mul(new anchor_1.BN(10));
        var baseFeeRatePercentage = new decimal_js_1.default(baseFeeRate.toString())
            .mul(new decimal_js_1.default(100))
            .div(new decimal_js_1.default(constants_1.FEE_PRECISION.toString()));
        var maxFeeRatePercentage = new decimal_js_1.default(constants_1.MAX_FEE_RATE.toString())
            .mul(new decimal_js_1.default(100))
            .div(new decimal_js_1.default(constants_1.FEE_PRECISION.toString()));
        return {
            baseFeeRatePercentage: baseFeeRatePercentage,
            maxFeeRatePercentage: maxFeeRatePercentage,
        };
    };
    /**
     * The function `getFeeInfo` calculates and returns the base fee rate percentage, maximum fee rate
     * percentage, and protocol fee percentage.
     * @returns an object of type `FeeInfo` with the following properties: baseFeeRatePercentage, maxFeeRatePercentage, and protocolFeePercentage.
     */
    DLMM.prototype.getFeeInfo = function () {
        var _a = this.lbPair.parameters, baseFactor = _a.baseFactor, protocolShare = _a.protocolShare;
        var _b = DLMM.calculateFeeInfo(baseFactor, this.lbPair.binStep), baseFeeRatePercentage = _b.baseFeeRatePercentage, maxFeeRatePercentage = _b.maxFeeRatePercentage;
        var protocolFeePercentage = new decimal_js_1.default(protocolShare.toString())
            .mul(new decimal_js_1.default(100))
            .div(new decimal_js_1.default(constants_1.BASIS_POINT_MAX));
        return {
            baseFeeRatePercentage: baseFeeRatePercentage,
            maxFeeRatePercentage: maxFeeRatePercentage,
            protocolFeePercentage: protocolFeePercentage,
        };
    };
    /**
     * The function calculates and returns a dynamic fee
     * @returns a Decimal value representing the dynamic fee.
     */
    DLMM.prototype.getDynamicFee = function () {
        var vParameterClone = Object.assign({}, this.lbPair.vParameters);
        var activeId = new anchor_1.BN(this.lbPair.activeId);
        var sParameters = this.lbPair.parameters;
        var currentTimestamp = Date.now() / 1000;
        this.updateReference(activeId.toNumber(), vParameterClone, sParameters, currentTimestamp);
        this.updateVolatilityAccumulator(vParameterClone, sParameters, activeId.toNumber());
        var totalFee = (0, helpers_1.getTotalFee)(this.lbPair.binStep, sParameters, vParameterClone);
        return new decimal_js_1.default(totalFee.toString())
            .div(new decimal_js_1.default(constants_1.FEE_PRECISION.toString()))
            .mul(100);
    };
    /**
     * The function `getEmissionRate` returns the emission rates for two rewards.
     * @returns an object of type `EmissionRate`. The object has two properties: `rewardOne` and
     * `rewardTwo`, both of which are of type `Decimal`.
     */
    DLMM.prototype.getEmissionRate = function () {
        var now = Date.now() / 1000;
        var _a = this.lbPair.rewardInfos.map(function (_a) {
            var rewardRate = _a.rewardRate, rewardDurationEnd = _a.rewardDurationEnd;
            return now > rewardDurationEnd.toNumber() ? undefined : rewardRate;
        }), rewardOneEmissionRate = _a[0], rewardTwoEmissionRate = _a[1];
        return {
            rewardOne: rewardOneEmissionRate
                ? new decimal_js_1.default(rewardOneEmissionRate.toString()).div(constants_1.PRECISION)
                : undefined,
            rewardTwo: rewardTwoEmissionRate
                ? new decimal_js_1.default(rewardTwoEmissionRate.toString()).div(constants_1.PRECISION)
                : undefined,
        };
    };
    /**
     * The function `getBinsAroundActiveBin` retrieves a specified number of bins to the left and right
     * of the active bin and returns them along with the active bin ID.
     * @param {number} numberOfBinsToTheLeft - The parameter `numberOfBinsToTheLeft` represents the
     * number of bins to the left of the active bin that you want to retrieve. It determines how many
     * bins you want to include in the result that are positioned to the left of the active bin.
     * @param {number} numberOfBinsToTheRight - The parameter `numberOfBinsToTheRight` represents the
     * number of bins to the right of the active bin that you want to retrieve.
     * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
     * value of "this.lbPair.activeId", and the value of "bins" is the result of calling the "getBins"
     * function with the specified parameters.
     */
    DLMM.prototype.getBinsAroundActiveBin = function (numberOfBinsToTheLeft, numberOfBinsToTheRight) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerBinId, upperBinId, bins;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lowerBinId = this.lbPair.activeId - numberOfBinsToTheLeft - 1;
                        upperBinId = this.lbPair.activeId + numberOfBinsToTheRight + 1;
                        return [4 /*yield*/, this.getBins(this.pubkey, lowerBinId, upperBinId, this.tokenX.decimal, this.tokenY.decimal)];
                    case 1:
                        bins = _a.sent();
                        return [2 /*return*/, { activeBin: this.lbPair.activeId, bins: bins }];
                }
            });
        });
    };
    /**
     * The function `getBinsBetweenMinAndMaxPrice` retrieves a list of bins within a specified price
     * range.
     * @param {number} minPrice - The minimum price value for filtering the bins.
     * @param {number} maxPrice - The `maxPrice` parameter is the maximum price value that you want to
     * use for filtering the bins.
     * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
     * active bin ID of the lbPair, and the value of "bins" is an array of BinLiquidity objects.
     */
    DLMM.prototype.getBinsBetweenMinAndMaxPrice = function (minPrice, maxPrice) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerBinId, upperBinId, bins;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lowerBinId = this.getBinIdFromPrice(minPrice, true) - 1;
                        upperBinId = this.getBinIdFromPrice(maxPrice, false) + 1;
                        return [4 /*yield*/, this.getBins(this.pubkey, lowerBinId, upperBinId, this.tokenX.decimal, this.tokenX.decimal)];
                    case 1:
                        bins = _a.sent();
                        return [2 /*return*/, { activeBin: this.lbPair.activeId, bins: bins }];
                }
            });
        });
    };
    /**
     * The function `getBinsBetweenLowerAndUpperBound` retrieves a list of bins between a lower and upper
     * bin ID and returns the active bin ID and the list of bins.
     * @param {number} lowerBinId - The lowerBinId parameter is a number that represents the ID of the
     * lowest bin.
     * @param {number} upperBinId - The upperBinID parameter is a number that represents the ID of the
     * highest bin.
     * @param {BinArray} [lowerBinArrays] - The `lowerBinArrays` parameter is an optional parameter of
     * type `BinArray`. It represents an array of bins that are below the lower bin ID.
     * @param {BinArray} [upperBinArrays] - The parameter `upperBinArrays` is an optional parameter of
     * type `BinArray`. It represents an array of bins that are above the upper bin ID.
     * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
     * active bin ID of the lbPair, and the value of "bins" is an array of BinLiquidity objects.
     */
    DLMM.prototype.getBinsBetweenLowerAndUpperBound = function (lowerBinId, upperBinId, lowerBinArray, upperBinArray) {
        return __awaiter(this, void 0, void 0, function () {
            var bins;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getBins(this.pubkey, lowerBinId, upperBinId, this.tokenX.decimal, this.tokenY.decimal, lowerBinArray, upperBinArray)];
                    case 1:
                        bins = _a.sent();
                        return [2 /*return*/, { activeBin: this.lbPair.activeId, bins: bins }];
                }
            });
        });
    };
    /**
     * The function converts a real price of bin to a lamport value
     * @param {number} price - The `price` parameter is a number representing the price of a token.
     * @returns {string} price per Lamport of bin
     */
    DLMM.prototype.toPricePerLamport = function (price) {
        return DLMM.getPricePerLamport(this.tokenX.decimal, this.tokenY.decimal, price);
    };
    /**
     * The function converts a price per lamport value to a real price of bin
     * @param {number} pricePerLamport - The parameter `pricePerLamport` is a number representing the
     * price per lamport.
     * @returns {string} real price of bin
     */
    DLMM.prototype.fromPricePerLamport = function (pricePerLamport) {
        return new decimal_js_1.default(pricePerLamport)
            .div(new decimal_js_1.default(Math.pow(10, (this.tokenY.decimal - this.tokenX.decimal))))
            .toString();
    };
    /**
     * The function retrieves the active bin ID and its corresponding price.
     * @returns an object with two properties: "binId" which is a number, and "price" which is a string.
     */
    DLMM.prototype.getActiveBin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var activeId, activeBinState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.program.account.lbPair.fetch(this.pubkey)];
                    case 1:
                        activeId = (_a.sent()).activeId;
                        return [4 /*yield*/, this.getBins(this.pubkey, activeId, activeId, this.tokenX.decimal, this.tokenY.decimal)];
                    case 2:
                        activeBinState = (_a.sent())[0];
                        return [2 /*return*/, activeBinState];
                }
            });
        });
    };
    /**
     * The function get bin ID based on a given price and a boolean flag indicating whether to
     * round down or up.
     * @param {number} price - The price parameter is a number that represents the price value.
     * @param {boolean} min - The "min" parameter is a boolean value that determines whether to round
     * down or round up the calculated binId. If "min" is true, the binId will be rounded down (floor),
     * otherwise it will be rounded up (ceil).
     * @returns {number} which is the binId calculated based on the given price and whether the minimum
     * value should be used.
     */
    DLMM.prototype.getBinIdFromPrice = function (price, min) {
        return DLMM.getBinIdFromPrice(price, this.lbPair.binStep, min);
    };
    /**
     * The function `getPositionsByUserAndLbPair` retrieves positions by user and LB pair, including
     * active bin and user positions.
     * @param {PublicKey} [userPubKey] - The `userPubKey` parameter is an optional parameter of type
     * `PublicKey`. It represents the public key of a user. If no `userPubKey` is provided, the function
     * will return an object with an empty `userPositions` array and the active bin information obtained
     * from the `getActive
     * @returns The function `getPositionsByUserAndLbPair` returns a Promise that resolves to an object
     * with two properties:
     *    - "activeBin" which is an object with two properties: "binId" and "price". The value of "binId"
     *     is the active bin ID of the lbPair, and the value of "price" is the price of the active bin.
     *   - "userPositions" which is an array of Position objects.
     */
    DLMM.prototype.getPositionsByUserAndLbPair = function (userPubKey) {
        return __awaiter(this, void 0, void 0, function () {
            var promiseResults, activeBin, positionsV2, binArrayPubkeySetV2, binArrayPubkeyArrayV2, lbPairAndBinArrays, lbPairAccInfo, clockAccInfo, binArraysAccInfo, positionBinArraysMapV2, i, binArrayPubkey, binArrayAccBufferV2, binArrayAccInfo, onChainTimestamp, userPositionsV2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.getActiveBin(),
                            userPubKey &&
                                this.program.account.positionV2.all([
                                    {
                                        memcmp: {
                                            bytes: bytes_1.bs58.encode(userPubKey.toBuffer()),
                                            offset: 8 + 32,
                                        },
                                    },
                                    {
                                        memcmp: {
                                            bytes: bytes_1.bs58.encode(this.pubkey.toBuffer()),
                                            offset: 8,
                                        },
                                    },
                                ]),
                        ])];
                    case 1:
                        promiseResults = _a.sent();
                        activeBin = promiseResults[0], positionsV2 = promiseResults[1];
                        if (!activeBin) {
                            throw new Error("Error fetching active bin");
                        }
                        if (!userPubKey) {
                            return [2 /*return*/, {
                                    activeBin: activeBin,
                                    userPositions: [],
                                }];
                        }
                        if (!positionsV2) {
                            throw new Error("Error fetching positions");
                        }
                        binArrayPubkeySetV2 = new Set();
                        positionsV2.forEach(function (_a) {
                            var _b = _a.account, upperBinId = _b.upperBinId, lowerBinId = _b.lowerBinId, lbPair = _b.lbPair;
                            var lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
                            var upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId));
                            var lowerBinArrayPubKey = (0, helpers_1.deriveBinArray)(_this.pubkey, lowerBinArrayIndex, _this.program.programId)[0];
                            var upperBinArrayPubKey = (0, helpers_1.deriveBinArray)(_this.pubkey, upperBinArrayIndex, _this.program.programId)[0];
                            binArrayPubkeySetV2.add(lowerBinArrayPubKey.toBase58());
                            binArrayPubkeySetV2.add(upperBinArrayPubKey.toBase58());
                        });
                        binArrayPubkeyArrayV2 = Array.from(binArrayPubkeySetV2).map(function (pubkey) { return new web3_js_1.PublicKey(pubkey); });
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(this.program.provider.connection, __spreadArray([
                                this.pubkey,
                                web3_js_1.SYSVAR_CLOCK_PUBKEY
                            ], binArrayPubkeyArrayV2, true))];
                    case 2:
                        lbPairAndBinArrays = _a.sent();
                        lbPairAccInfo = lbPairAndBinArrays[0], clockAccInfo = lbPairAndBinArrays[1], binArraysAccInfo = lbPairAndBinArrays.slice(2);
                        positionBinArraysMapV2 = new Map();
                        for (i = 0; i < binArraysAccInfo.length; i++) {
                            binArrayPubkey = binArrayPubkeyArrayV2[i];
                            binArrayAccBufferV2 = binArraysAccInfo[i];
                            if (!binArrayAccBufferV2)
                                throw new Error("Bin Array account ".concat(binArrayPubkey.toBase58(), " not found"));
                            binArrayAccInfo = this.program.coder.accounts.decode("binArray", binArrayAccBufferV2.data);
                            positionBinArraysMapV2.set(binArrayPubkey.toBase58(), binArrayAccInfo);
                        }
                        if (!lbPairAccInfo)
                            throw new Error("LB Pair account ".concat(this.pubkey.toBase58(), " not found"));
                        onChainTimestamp = new anchor_1.BN(clockAccInfo.data.readBigInt64LE(32).toString()).toNumber();
                        return [4 /*yield*/, Promise.all(positionsV2.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                                var lowerBinId, upperBinId, feeOwner, lowerBinArrayIndex, upperBinArrayIndex, lowerBinArrayPubKey, upperBinArrayPubKey, lowerBinArray, upperBinArray;
                                var _c;
                                var publicKey = _b.publicKey, account = _b.account;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            lowerBinId = account.lowerBinId, upperBinId = account.upperBinId, feeOwner = account.feeOwner;
                                            lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
                                            upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId));
                                            lowerBinArrayPubKey = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                                            upperBinArrayPubKey = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                                            lowerBinArray = positionBinArraysMapV2.get(lowerBinArrayPubKey.toBase58());
                                            upperBinArray = positionBinArraysMapV2.get(upperBinArrayPubKey.toBase58());
                                            _c = {
                                                publicKey: publicKey
                                            };
                                            return [4 /*yield*/, DLMM.processPosition(this.program, types_1.PositionVersion.V2, this.lbPair, onChainTimestamp, account, this.tokenX.decimal, this.tokenY.decimal, lowerBinArray, upperBinArray, feeOwner)];
                                        case 1: return [2 /*return*/, (_c.positionData = _d.sent(),
                                                _c.version = types_1.PositionVersion.V2,
                                                _c)];
                                    }
                                });
                            }); }))];
                    case 3:
                        userPositionsV2 = _a.sent();
                        return [2 /*return*/, {
                                activeBin: activeBin,
                                userPositions: userPositionsV2,
                            }];
                }
            });
        });
    };
    DLMM.prototype.quoteCreatePosition = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var minBinId, maxBinId, lowerBinArrayIndex, upperBinArrayIndex, binArraysCount, positionCount, binArrayCost, positionCost;
            var strategy = _b.strategy;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        minBinId = strategy.minBinId, maxBinId = strategy.maxBinId;
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
                        upperBinArrayIndex = anchor_1.BN.max((0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId)), lowerBinArrayIndex.add(new anchor_1.BN(1)));
                        return [4 /*yield*/, this.binArraysToBeCreate(lowerBinArrayIndex, upperBinArrayIndex)];
                    case 1:
                        binArraysCount = (_c.sent()).length;
                        positionCount = Math.ceil((maxBinId - minBinId + 1) / constants_1.MAX_BIN_PER_TX);
                        binArrayCost = binArraysCount * constants_1.BIN_ARRAY_FEE;
                        positionCost = positionCount * constants_1.POSITION_FEE;
                        return [2 /*return*/, {
                                binArraysCount: binArraysCount,
                                binArrayCost: binArrayCost,
                                positionCount: positionCount,
                                positionCost: positionCost,
                            }];
                }
            });
        });
    };
    /**
     * Creates an empty position and initializes the corresponding bin arrays if needed.
     * @param param0 The settings of the requested new position.
     * @returns A promise that resolves into a transaction for creating the requested position.
     */
    DLMM.prototype.createEmptyPosition = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var createPositionIx, lowerBinArrayIndex, upperBinArrayIndex, createBinArrayIxs, instructions, setCUIx, _c, blockhash, lastValidBlockHeight;
            var _d;
            var positionPubKey = _b.positionPubKey, minBinId = _b.minBinId, maxBinId = _b.maxBinId, user = _b.user;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.program.methods
                            .initializePosition(minBinId, maxBinId - minBinId + 1)
                            .accounts({
                            payer: user,
                            position: positionPubKey,
                            lbPair: this.pubkey,
                            owner: user,
                        })
                            .instruction()];
                    case 1:
                        createPositionIx = _e.sent();
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
                        upperBinArrayIndex = anchor_1.BN.max(lowerBinArrayIndex.add(new anchor_1.BN(1)), (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId)));
                        return [4 /*yield*/, this.createBinArraysIfNeeded(upperBinArrayIndex, lowerBinArrayIndex, user)];
                    case 2:
                        createBinArrayIxs = _e.sent();
                        instructions = __spreadArray([createPositionIx], createBinArrayIxs, true);
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user)];
                    case 3:
                        setCUIx = _e.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 4:
                        _c = _e.sent(), blockhash = _c.blockhash, lastValidBlockHeight = _c.lastValidBlockHeight;
                        return [2 /*return*/, (_d = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_d, __spreadArray([setCUIx], instructions, false))];
                }
            });
        });
    };
    /**
     * The function `getPosition` retrieves position information for a given public key and processes it
     * using various data to return a `LbPosition` object.
     * @param {PublicKey} positionPubKey - The `getPosition` function you provided is an asynchronous
     * function that fetches position information based on a given public key. Here's a breakdown of the
     * parameters used in the function:
     * @returns The `getPosition` function returns a Promise that resolves to an object of type
     * `LbPosition`. The object contains the following properties:
     * - `publicKey`: The public key of the position account
     * - `positionData`: Position Object
     * - `version`: The version of the position (in this case, `Position.V2`)
     */
    DLMM.prototype.getPosition = function (positionPubKey) {
        return __awaiter(this, void 0, void 0, function () {
            var positionAccountInfo, lowerBinId, upperBinId, feeOwner, lowerBinArrayIndex, upperBinArrayIndex, lowerBinArrayPubKey, upperBinArrayPubKey, _a, clockAccInfo, lowerBinArrayAccInfo, upperBinArrayAccInfo, onChainTimestamp, lowerBinArray, upperBinArray;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.program.account.positionV2.fetch(positionPubKey)];
                    case 1:
                        positionAccountInfo = _c.sent();
                        if (!positionAccountInfo) {
                            throw new Error("Position account ".concat(positionPubKey.toBase58(), " not found"));
                        }
                        lowerBinId = positionAccountInfo.lowerBinId, upperBinId = positionAccountInfo.upperBinId, feeOwner = positionAccountInfo.feeOwner;
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
                        upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId));
                        lowerBinArrayPubKey = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        upperBinArrayPubKey = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        return [4 /*yield*/, (0, helpers_1.chunkedGetMultipleAccountInfos)(this.program.provider.connection, [
                                web3_js_1.SYSVAR_CLOCK_PUBKEY,
                                lowerBinArrayPubKey,
                                upperBinArrayPubKey,
                            ])];
                    case 2:
                        _a = _c.sent(), clockAccInfo = _a[0], lowerBinArrayAccInfo = _a[1], upperBinArrayAccInfo = _a[2];
                        if (!lowerBinArrayAccInfo || !upperBinArrayAccInfo) {
                            return [2 /*return*/, {
                                    publicKey: positionPubKey,
                                    positionData: {
                                        totalXAmount: '0',
                                        totalYAmount: '0',
                                        positionBinData: [],
                                        lastUpdatedAt: new anchor_1.BN(0),
                                        upperBinId: upperBinId,
                                        lowerBinId: lowerBinId,
                                        feeX: new anchor_1.BN(0),
                                        feeY: new anchor_1.BN(0),
                                        rewardOne: new anchor_1.BN(0),
                                        rewardTwo: new anchor_1.BN(0),
                                        feeOwner: feeOwner,
                                        totalClaimedFeeXAmount: new anchor_1.BN(0),
                                        totalClaimedFeeYAmount: new anchor_1.BN(0),
                                    },
                                    version: types_1.PositionVersion.V2,
                                }];
                        }
                        onChainTimestamp = new anchor_1.BN(clockAccInfo.data.readBigInt64LE(32).toString()).toNumber();
                        lowerBinArray = this.program.coder.accounts.decode("binArray", lowerBinArrayAccInfo.data);
                        upperBinArray = this.program.coder.accounts.decode("binArray", upperBinArrayAccInfo.data);
                        _b = {
                            publicKey: positionPubKey
                        };
                        return [4 /*yield*/, DLMM.processPosition(this.program, types_1.PositionVersion.V2, this.lbPair, onChainTimestamp, positionAccountInfo, this.tokenX.decimal, this.tokenY.decimal, lowerBinArray, upperBinArray, feeOwner)];
                    case 3: return [2 /*return*/, (_b.positionData = _c.sent(),
                            _b.version = types_1.PositionVersion.V2,
                            _b)];
                }
            });
        });
    };
    /**
     * The function `initializePositionAndAddLiquidityByStrategy` function is used to initializes a position and adds liquidity
     * @param {TInitializePositionAndAddLiquidityParamsByStrategy}
     *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
     *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
     *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
     *    - `strategy`: The strategy parameters to be used for the liquidity pool (Can use `calculateStrategyParameter` to calculate).
     *    - `user`: The public key of the user account.
     *    - `slippage`: The slippage percentage to be used for the liquidity pool.
     * @returns {Promise<Transaction>} The function `initializePositionAndAddLiquidityByWeight` returns a `Promise` that
     * resolves to either a single `Transaction` object.
     */
    DLMM.prototype.initializePositionAndAddLiquidityByStrategy = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var maxBinId, minBinId, maxActiveBinSlippage, preInstructions, initializePositionIx, lowerBinArrayIndex, binArrayLower, upperBinArrayIndex, binArrayUpper, createBinArrayIxs, _c, _d, userTokenX, createPayerTokenXIx, _e, userTokenY, createPayerTokenYIx, wrapSOLIx, wrapSOLIx, postInstructions, closeWrappedSOLIx, minBinArrayIndex, maxBinArrayIndex, useExtension, binArrayBitmapExtension, activeId, strategyParameters, liquidityParams, addLiquidityAccounts, programMethod, addLiquidityIx, instructions, setCUIx, _f, blockhash, lastValidBlockHeight;
            var _g;
            var positionPubKey = _b.positionPubKey, totalXAmount = _b.totalXAmount, totalYAmount = _b.totalYAmount, strategy = _b.strategy, user = _b.user, slippage = _b.slippage;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        maxBinId = strategy.maxBinId, minBinId = strategy.minBinId;
                        maxActiveBinSlippage = slippage
                            ? Math.ceil(slippage / (this.lbPair.binStep / 100))
                            : constants_1.MAX_ACTIVE_BIN_SLIPPAGE;
                        preInstructions = [];
                        return [4 /*yield*/, this.program.methods
                                .initializePosition(minBinId, maxBinId - minBinId + 1)
                                .accounts({
                                payer: user,
                                position: positionPubKey,
                                lbPair: this.pubkey,
                                owner: user,
                            })
                                .instruction()];
                    case 1:
                        initializePositionIx = _h.sent();
                        preInstructions.push(initializePositionIx);
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
                        binArrayLower = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        upperBinArrayIndex = anchor_1.BN.max(lowerBinArrayIndex.add(new anchor_1.BN(1)), (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId)));
                        binArrayUpper = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        return [4 /*yield*/, this.createBinArraysIfNeeded(upperBinArrayIndex, lowerBinArrayIndex, user)];
                    case 2:
                        createBinArrayIxs = _h.sent();
                        preInstructions.push.apply(preInstructions, createBinArrayIxs);
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, user),
                            ])];
                    case 3:
                        _c = _h.sent(), _d = _c[0], userTokenX = _d.ataPubKey, createPayerTokenXIx = _d.ix, _e = _c[1], userTokenY = _e.ataPubKey, createPayerTokenYIx = _e.ix;
                        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
                        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
                        if (this.tokenX.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalXAmount.isZero()) {
                            wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenX, BigInt(totalXAmount.toString()));
                            preInstructions.push.apply(preInstructions, wrapSOLIx);
                        }
                        if (this.tokenY.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalYAmount.isZero()) {
                            wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenY, BigInt(totalYAmount.toString()));
                            preInstructions.push.apply(preInstructions, wrapSOLIx);
                        }
                        postInstructions = [];
                        if (![
                            this.tokenX.publicKey.toBase58(),
                            this.tokenY.publicKey.toBase58(),
                        ].includes(spl_token_1.NATIVE_MINT.toBase58())) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 4:
                        closeWrappedSOLIx = _h.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _h.label = 5;
                    case 5:
                        minBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
                        maxBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId));
                        useExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(minBinArrayIndex) ||
                            (0, helpers_1.isOverflowDefaultBinArrayBitmap)(maxBinArrayIndex);
                        binArrayBitmapExtension = useExtension
                            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
                            : null;
                        activeId = this.lbPair.activeId;
                        strategyParameters = (0, helpers_1.toStrategyParameters)(strategy);
                        liquidityParams = {
                            amountX: totalXAmount,
                            amountY: totalYAmount,
                            activeId: activeId,
                            maxActiveBinSlippage: maxActiveBinSlippage,
                            strategyParameters: strategyParameters,
                        };
                        addLiquidityAccounts = {
                            position: positionPubKey,
                            lbPair: this.pubkey,
                            userTokenX: userTokenX,
                            userTokenY: userTokenY,
                            reserveX: this.lbPair.reserveX,
                            reserveY: this.lbPair.reserveY,
                            tokenXMint: this.lbPair.tokenXMint,
                            tokenYMint: this.lbPair.tokenYMint,
                            binArrayLower: binArrayLower,
                            binArrayUpper: binArrayUpper,
                            binArrayBitmapExtension: binArrayBitmapExtension,
                            sender: user,
                            tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        programMethod = this.program.methods.addLiquidityByStrategy(liquidityParams);
                        return [4 /*yield*/, programMethod
                                .accounts(addLiquidityAccounts)
                                .instruction()];
                    case 6:
                        addLiquidityIx = _h.sent();
                        instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), [
                            addLiquidityIx
                        ], false), postInstructions, true);
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user)];
                    case 7:
                        setCUIx = _h.sent();
                        instructions.unshift(setCUIx);
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 8:
                        _f = _h.sent(), blockhash = _f.blockhash, lastValidBlockHeight = _f.lastValidBlockHeight;
                        return [2 /*return*/, (_g = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_g, instructions)];
                }
            });
        });
    };
    /**
     * The function `initializePositionAndAddLiquidityByWeight` function is used to initializes a position and adds liquidity
     * @param {TInitializePositionAndAddLiquidityParams}
     *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
     *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
     *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
     *    - `xYAmountDistribution`: An array of objects of type `XYAmountDistribution` that represents (can use `calculateSpotDistribution`, `calculateBidAskDistribution` & `calculateNormalDistribution`)
     *    - `user`: The public key of the user account.
     *    - `slippage`: The slippage percentage to be used for the liquidity pool.
     * @returns {Promise<Transaction|Transaction[]>} The function `initializePositionAndAddLiquidityByWeight` returns a `Promise` that
     * resolves to either a single `Transaction` object (if less than 26bin involved) or an array of `Transaction` objects.
     */
    DLMM.prototype.initializePositionAndAddLiquidityByWeight = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var _c, lowerBinId, upperBinId, binIds, maxActiveBinSlippage, preInstructions, initializePositionIx, lowerBinArrayIndex, binArrayLower, upperBinArrayIndex, binArrayUpper, createBinArrayIxs, _d, _e, userTokenX, createPayerTokenXIx, _f, userTokenY, createPayerTokenYIx, wrapSOLIx, wrapSOLIx, postInstructions, closeWrappedSOLIx, minBinId, maxBinId, minBinArrayIndex, maxBinArrayIndex, useExtension, binArrayBitmapExtension, activeId, binLiquidityDist, liquidityParams, addLiquidityAccounts, oneSideLiquidityParams, oneSideAddLiquidityAccounts, isOneSideDeposit, programMethod, addLiqIx_1, instructions, setCUIx_1, _g, blockhash_1, lastValidBlockHeight_1, addLiqIx, setCUIx, mainInstructions, transactions, _h, blockhash, lastValidBlockHeight, preInstructionsTx, mainTx, postInstructionsTx;
            var _j, _k, _l, _m;
            var positionPubKey = _b.positionPubKey, totalXAmount = _b.totalXAmount, totalYAmount = _b.totalYAmount, xYAmountDistribution = _b.xYAmountDistribution, user = _b.user, slippage = _b.slippage;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        _c = this.processXYAmountDistribution(xYAmountDistribution), lowerBinId = _c.lowerBinId, upperBinId = _c.upperBinId, binIds = _c.binIds;
                        maxActiveBinSlippage = slippage
                            ? Math.ceil(slippage / (this.lbPair.binStep / 100))
                            : constants_1.MAX_ACTIVE_BIN_SLIPPAGE;
                        if (upperBinId >= lowerBinId + constants_1.MAX_BIN_PER_POSITION.toNumber()) {
                            throw new Error("Position must be within a range of 1 to ".concat(constants_1.MAX_BIN_PER_POSITION.toNumber(), " bins."));
                        }
                        preInstructions = [];
                        return [4 /*yield*/, this.program.methods
                                .initializePosition(lowerBinId, upperBinId - lowerBinId + 1)
                                .accounts({
                                payer: user,
                                position: positionPubKey,
                                lbPair: this.pubkey,
                                owner: user,
                            })
                                .instruction()];
                    case 1:
                        initializePositionIx = _o.sent();
                        preInstructions.push(initializePositionIx);
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
                        binArrayLower = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        upperBinArrayIndex = anchor_1.BN.max(lowerBinArrayIndex.add(new anchor_1.BN(1)), (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId)));
                        binArrayUpper = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        return [4 /*yield*/, this.createBinArraysIfNeeded(upperBinArrayIndex, lowerBinArrayIndex, user)];
                    case 2:
                        createBinArrayIxs = _o.sent();
                        preInstructions.push.apply(preInstructions, createBinArrayIxs);
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, user),
                            ])];
                    case 3:
                        _d = _o.sent(), _e = _d[0], userTokenX = _e.ataPubKey, createPayerTokenXIx = _e.ix, _f = _d[1], userTokenY = _f.ataPubKey, createPayerTokenYIx = _f.ix;
                        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
                        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
                        if (this.tokenX.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalXAmount.isZero()) {
                            wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenX, BigInt(totalXAmount.toString()));
                            preInstructions.push.apply(preInstructions, wrapSOLIx);
                        }
                        if (this.tokenY.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalYAmount.isZero()) {
                            wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenY, BigInt(totalYAmount.toString()));
                            preInstructions.push.apply(preInstructions, wrapSOLIx);
                        }
                        postInstructions = [];
                        if (![
                            this.tokenX.publicKey.toBase58(),
                            this.tokenY.publicKey.toBase58(),
                        ].includes(spl_token_1.NATIVE_MINT.toBase58())) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 4:
                        closeWrappedSOLIx = _o.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _o.label = 5;
                    case 5:
                        minBinId = Math.min.apply(Math, binIds);
                        maxBinId = Math.max.apply(Math, binIds);
                        minBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
                        maxBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId));
                        useExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(minBinArrayIndex) ||
                            (0, helpers_1.isOverflowDefaultBinArrayBitmap)(maxBinArrayIndex);
                        binArrayBitmapExtension = useExtension
                            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
                            : null;
                        activeId = this.lbPair.activeId;
                        binLiquidityDist = (0, helpers_1.toWeightDistribution)(totalXAmount, totalYAmount, xYAmountDistribution.map(function (item) { return ({
                            binId: item.binId,
                            xAmountBpsOfTotal: item.xAmountBpsOfTotal,
                            yAmountBpsOfTotal: item.yAmountBpsOfTotal,
                        }); }), this.lbPair.binStep);
                        if (binLiquidityDist.length === 0) {
                            throw new Error("No liquidity to add");
                        }
                        liquidityParams = {
                            amountX: totalXAmount,
                            amountY: totalYAmount,
                            binLiquidityDist: binLiquidityDist,
                            activeId: activeId,
                            maxActiveBinSlippage: maxActiveBinSlippage,
                        };
                        addLiquidityAccounts = {
                            position: positionPubKey,
                            lbPair: this.pubkey,
                            userTokenX: userTokenX,
                            userTokenY: userTokenY,
                            reserveX: this.lbPair.reserveX,
                            reserveY: this.lbPair.reserveY,
                            tokenXMint: this.lbPair.tokenXMint,
                            tokenYMint: this.lbPair.tokenYMint,
                            binArrayLower: binArrayLower,
                            binArrayUpper: binArrayUpper,
                            binArrayBitmapExtension: binArrayBitmapExtension,
                            sender: user,
                            tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        oneSideLiquidityParams = {
                            amount: totalXAmount.isZero() ? totalYAmount : totalXAmount,
                            activeId: activeId,
                            maxActiveBinSlippage: maxActiveBinSlippage,
                            binLiquidityDist: binLiquidityDist,
                        };
                        oneSideAddLiquidityAccounts = {
                            binArrayLower: binArrayLower,
                            binArrayUpper: binArrayUpper,
                            lbPair: this.pubkey,
                            binArrayBitmapExtension: null,
                            sender: user,
                            position: positionPubKey,
                            reserve: totalXAmount.isZero()
                                ? this.lbPair.reserveY
                                : this.lbPair.reserveX,
                            tokenMint: totalXAmount.isZero()
                                ? this.lbPair.tokenYMint
                                : this.lbPair.tokenXMint,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            userToken: totalXAmount.isZero() ? userTokenY : userTokenX,
                        };
                        isOneSideDeposit = totalXAmount.isZero() || totalYAmount.isZero();
                        programMethod = isOneSideDeposit
                            ? this.program.methods.addLiquidityOneSide(oneSideLiquidityParams)
                            : this.program.methods.addLiquidityByWeight(liquidityParams);
                        if (!(xYAmountDistribution.length < constants_1.MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX)) return [3 /*break*/, 9];
                        return [4 /*yield*/, programMethod
                                .accounts(isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts)
                                .instruction()];
                    case 6:
                        addLiqIx_1 = _o.sent();
                        instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), [addLiqIx_1], false), postInstructions, true);
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user)];
                    case 7:
                        setCUIx_1 = _o.sent();
                        instructions.unshift(setCUIx_1);
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 8:
                        _g = _o.sent(), blockhash_1 = _g.blockhash, lastValidBlockHeight_1 = _g.lastValidBlockHeight;
                        return [2 /*return*/, (_j = new web3_js_1.Transaction({
                                blockhash: blockhash_1,
                                lastValidBlockHeight: lastValidBlockHeight_1,
                                feePayer: user,
                            })).add.apply(_j, instructions)];
                    case 9: return [4 /*yield*/, programMethod
                            .accounts(isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts)
                            .instruction()];
                    case 10:
                        addLiqIx = _o.sent();
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, [addLiqIx], user, computeUnit_1.DEFAULT_ADD_LIQUIDITY_CU // The function return multiple transactions that dependent on each other, simulation will fail
                            )];
                    case 11:
                        setCUIx = _o.sent();
                        mainInstructions = [setCUIx, addLiqIx];
                        transactions = [];
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 12:
                        _h = _o.sent(), blockhash = _h.blockhash, lastValidBlockHeight = _h.lastValidBlockHeight;
                        if (preInstructions.length) {
                            preInstructionsTx = (_k = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_k, preInstructions);
                            transactions.push(preInstructionsTx);
                        }
                        mainTx = (_l = new web3_js_1.Transaction({
                            blockhash: blockhash,
                            lastValidBlockHeight: lastValidBlockHeight,
                            feePayer: user,
                        })).add.apply(_l, mainInstructions);
                        transactions.push(mainTx);
                        if (postInstructions.length) {
                            postInstructionsTx = (_m = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_m, postInstructions);
                            transactions.push(postInstructionsTx);
                        }
                        return [2 /*return*/, transactions];
                }
            });
        });
    };
    /**
     * The `addLiquidityByStrategy` function is used to add liquidity to existing position
     * @param {TInitializePositionAndAddLiquidityParamsByStrategy}
     *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
     *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
     *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
     *    - `strategy`: The strategy parameters to be used for the liquidity pool (Can use `calculateStrategyParameter` to calculate).
     *    - `user`: The public key of the user account.
     *    - `slippage`: The slippage percentage to be used for the liquidity pool.
     * @returns {Promise<Transaction>} The function `addLiquidityByWeight` returns a `Promise` that resolves to either a single
     * `Transaction` object
     */
    DLMM.prototype.addLiquidityByStrategy = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var maxBinId, minBinId, maxActiveBinSlippage, preInstructions, minBinArrayIndex, maxBinArrayIndex, useExtension, binArrayBitmapExtension, strategyParameters, positionAccount, lowerBinArrayIndex, upperBinArrayIndex, binArrayLower, binArrayUpper, createBinArrayIxs, _c, _d, userTokenX, createPayerTokenXIx, _e, userTokenY, createPayerTokenYIx, wrapSOLIx, wrapSOLIx, postInstructions, closeWrappedSOLIx, liquidityParams, addLiquidityAccounts, programMethod, addLiquidityIx, instructions, setCUIx, _f, blockhash, lastValidBlockHeight;
            var _g;
            var positionPubKey = _b.positionPubKey, totalXAmount = _b.totalXAmount, totalYAmount = _b.totalYAmount, strategy = _b.strategy, user = _b.user, slippage = _b.slippage;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        maxBinId = strategy.maxBinId, minBinId = strategy.minBinId;
                        maxActiveBinSlippage = slippage
                            ? Math.ceil(slippage / (this.lbPair.binStep / 100))
                            : constants_1.MAX_ACTIVE_BIN_SLIPPAGE;
                        preInstructions = [];
                        minBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
                        maxBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId));
                        useExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(minBinArrayIndex) ||
                            (0, helpers_1.isOverflowDefaultBinArrayBitmap)(maxBinArrayIndex);
                        binArrayBitmapExtension = useExtension
                            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
                            : null;
                        strategyParameters = (0, helpers_1.toStrategyParameters)(strategy);
                        return [4 /*yield*/, this.program.account.positionV2.fetch(positionPubKey)];
                    case 1:
                        positionAccount = _h.sent();
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(positionAccount.lowerBinId));
                        upperBinArrayIndex = lowerBinArrayIndex.add(new anchor_1.BN(1));
                        binArrayLower = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        binArrayUpper = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        return [4 /*yield*/, this.createBinArraysIfNeeded(upperBinArrayIndex, lowerBinArrayIndex, user)];
                    case 2:
                        createBinArrayIxs = _h.sent();
                        preInstructions.push.apply(preInstructions, createBinArrayIxs);
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, user),
                            ])];
                    case 3:
                        _c = _h.sent(), _d = _c[0], userTokenX = _d.ataPubKey, createPayerTokenXIx = _d.ix, _e = _c[1], userTokenY = _e.ataPubKey, createPayerTokenYIx = _e.ix;
                        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
                        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
                        if (this.tokenX.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalXAmount.isZero()) {
                            wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenX, BigInt(totalXAmount.toString()));
                            preInstructions.push.apply(preInstructions, wrapSOLIx);
                        }
                        if (this.tokenY.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalYAmount.isZero()) {
                            wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenY, BigInt(totalYAmount.toString()));
                            preInstructions.push.apply(preInstructions, wrapSOLIx);
                        }
                        postInstructions = [];
                        if (![
                            this.tokenX.publicKey.toBase58(),
                            this.tokenY.publicKey.toBase58(),
                        ].includes(spl_token_1.NATIVE_MINT.toBase58())) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 4:
                        closeWrappedSOLIx = _h.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _h.label = 5;
                    case 5:
                        liquidityParams = {
                            amountX: totalXAmount,
                            amountY: totalYAmount,
                            activeId: this.lbPair.activeId,
                            maxActiveBinSlippage: maxActiveBinSlippage,
                            strategyParameters: strategyParameters,
                        };
                        addLiquidityAccounts = {
                            position: positionPubKey,
                            lbPair: this.pubkey,
                            userTokenX: userTokenX,
                            userTokenY: userTokenY,
                            reserveX: this.lbPair.reserveX,
                            reserveY: this.lbPair.reserveY,
                            tokenXMint: this.lbPair.tokenXMint,
                            tokenYMint: this.lbPair.tokenYMint,
                            binArrayLower: binArrayLower,
                            binArrayUpper: binArrayUpper,
                            binArrayBitmapExtension: binArrayBitmapExtension,
                            sender: user,
                            tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        programMethod = this.program.methods.addLiquidityByStrategy(liquidityParams);
                        return [4 /*yield*/, programMethod
                                .accounts(addLiquidityAccounts)
                                .instruction()];
                    case 6:
                        addLiquidityIx = _h.sent();
                        instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), [
                            addLiquidityIx
                        ], false), postInstructions, true);
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user)];
                    case 7:
                        setCUIx = _h.sent();
                        instructions.unshift(setCUIx);
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 8:
                        _f = _h.sent(), blockhash = _f.blockhash, lastValidBlockHeight = _f.lastValidBlockHeight;
                        return [2 /*return*/, (_g = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_g, instructions)];
                }
            });
        });
    };
    /**
     * The `addLiquidityByWeight` function is used to add liquidity to existing position
     * @param {TInitializePositionAndAddLiquidityParams}
     *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
     *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
     *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
     *    - `xYAmountDistribution`: An array of objects of type `XYAmountDistribution` that represents (can use `calculateSpotDistribution`, `calculateBidAskDistribution` & `calculateNormalDistribution`)
     *    - `user`: The public key of the user account.
     *    - `slippage`: The slippage percentage to be used for the liquidity pool.
     * @returns {Promise<Transaction|Transaction[]>} The function `addLiquidityByWeight` returns a `Promise` that resolves to either a single
     * `Transaction` object (if less than 26bin involved) or an array of `Transaction` objects.
     */
    DLMM.prototype.addLiquidityByWeight = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var maxActiveBinSlippage, positionAccount, _c, lowerBinId, upperBinId, binIds, minBinId, maxBinId, minBinArrayIndex, maxBinArrayIndex, useExtension, binArrayBitmapExtension, activeId, binLiquidityDist, lowerBinArrayIndex, binArrayLower, upperBinArrayIndex, binArrayUpper, preInstructions, createBinArrayIxs, _d, _e, userTokenX, createPayerTokenXIx, _f, userTokenY, createPayerTokenYIx, wrapSOLIx, wrapSOLIx, postInstructions, closeWrappedSOLIx, liquidityParams, addLiquidityAccounts, oneSideLiquidityParams, oneSideAddLiquidityAccounts, isOneSideDeposit, programMethod, addLiqIx_2, instructions, setCUIx_2, _g, blockhash_2, lastValidBlockHeight_2, addLiqIx, setCUIx, mainInstructions, transactions, _h, blockhash, lastValidBlockHeight, preInstructionsTx, mainTx, postInstructionsTx;
            var _j, _k, _l, _m;
            var positionPubKey = _b.positionPubKey, totalXAmount = _b.totalXAmount, totalYAmount = _b.totalYAmount, xYAmountDistribution = _b.xYAmountDistribution, user = _b.user, slippage = _b.slippage;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        maxActiveBinSlippage = slippage
                            ? Math.ceil(slippage / (this.lbPair.binStep / 100))
                            : constants_1.MAX_ACTIVE_BIN_SLIPPAGE;
                        return [4 /*yield*/, this.program.account.positionV2.fetch(positionPubKey)];
                    case 1:
                        positionAccount = _o.sent();
                        _c = this.processXYAmountDistribution(xYAmountDistribution), lowerBinId = _c.lowerBinId, upperBinId = _c.upperBinId, binIds = _c.binIds;
                        if (lowerBinId < positionAccount.lowerBinId)
                            throw new Error("Lower Bin ID (".concat(lowerBinId, ") lower than Position Lower Bin Id (").concat(positionAccount.lowerBinId, ")"));
                        if (upperBinId > positionAccount.upperBinId)
                            throw new Error("Upper Bin ID (".concat(upperBinId, ") higher than Position Upper Bin Id (").concat(positionAccount.upperBinId, ")"));
                        minBinId = Math.min.apply(Math, binIds);
                        maxBinId = Math.max.apply(Math, binIds);
                        minBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
                        maxBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId));
                        useExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(minBinArrayIndex) ||
                            (0, helpers_1.isOverflowDefaultBinArrayBitmap)(maxBinArrayIndex);
                        binArrayBitmapExtension = useExtension
                            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
                            : null;
                        activeId = this.lbPair.activeId;
                        binLiquidityDist = (0, helpers_1.toWeightDistribution)(totalXAmount, totalYAmount, xYAmountDistribution.map(function (item) { return ({
                            binId: item.binId,
                            xAmountBpsOfTotal: item.xAmountBpsOfTotal,
                            yAmountBpsOfTotal: item.yAmountBpsOfTotal,
                        }); }), this.lbPair.binStep);
                        if (binLiquidityDist.length === 0) {
                            throw new Error("No liquidity to add");
                        }
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(positionAccount.lowerBinId));
                        binArrayLower = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        upperBinArrayIndex = anchor_1.BN.max(lowerBinArrayIndex.add(new anchor_1.BN(1)), (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(positionAccount.upperBinId)));
                        binArrayUpper = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        preInstructions = [];
                        return [4 /*yield*/, this.createBinArraysIfNeeded(upperBinArrayIndex, lowerBinArrayIndex, user)];
                    case 2:
                        createBinArrayIxs = _o.sent();
                        preInstructions.push.apply(preInstructions, createBinArrayIxs);
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, user),
                            ])];
                    case 3:
                        _d = _o.sent(), _e = _d[0], userTokenX = _e.ataPubKey, createPayerTokenXIx = _e.ix, _f = _d[1], userTokenY = _f.ataPubKey, createPayerTokenYIx = _f.ix;
                        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
                        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
                        if (this.tokenX.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalXAmount.isZero()) {
                            wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenX, BigInt(totalXAmount.toString()));
                            preInstructions.push.apply(preInstructions, wrapSOLIx);
                        }
                        if (this.tokenY.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalYAmount.isZero()) {
                            wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenY, BigInt(totalYAmount.toString()));
                            preInstructions.push.apply(preInstructions, wrapSOLIx);
                        }
                        postInstructions = [];
                        if (![
                            this.tokenX.publicKey.toBase58(),
                            this.tokenY.publicKey.toBase58(),
                        ].includes(spl_token_1.NATIVE_MINT.toBase58())) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 4:
                        closeWrappedSOLIx = _o.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _o.label = 5;
                    case 5:
                        liquidityParams = {
                            amountX: totalXAmount,
                            amountY: totalYAmount,
                            binLiquidityDist: binLiquidityDist,
                            activeId: activeId,
                            maxActiveBinSlippage: maxActiveBinSlippage,
                        };
                        addLiquidityAccounts = {
                            position: positionPubKey,
                            lbPair: this.pubkey,
                            userTokenX: userTokenX,
                            userTokenY: userTokenY,
                            reserveX: this.lbPair.reserveX,
                            reserveY: this.lbPair.reserveY,
                            tokenXMint: this.lbPair.tokenXMint,
                            tokenYMint: this.lbPair.tokenYMint,
                            binArrayLower: binArrayLower,
                            binArrayUpper: binArrayUpper,
                            binArrayBitmapExtension: binArrayBitmapExtension,
                            sender: user,
                            tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
                        };
                        oneSideLiquidityParams = {
                            amount: totalXAmount.isZero() ? totalYAmount : totalXAmount,
                            activeId: activeId,
                            maxActiveBinSlippage: maxActiveBinSlippage,
                            binLiquidityDist: binLiquidityDist,
                        };
                        oneSideAddLiquidityAccounts = {
                            binArrayLower: binArrayLower,
                            binArrayUpper: binArrayUpper,
                            lbPair: this.pubkey,
                            binArrayBitmapExtension: null,
                            sender: user,
                            position: positionPubKey,
                            reserve: totalXAmount.isZero()
                                ? this.lbPair.reserveY
                                : this.lbPair.reserveX,
                            tokenMint: totalXAmount.isZero()
                                ? this.lbPair.tokenYMint
                                : this.lbPair.tokenXMint,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            userToken: totalXAmount.isZero() ? userTokenY : userTokenX,
                        };
                        isOneSideDeposit = totalXAmount.isZero() || totalYAmount.isZero();
                        programMethod = isOneSideDeposit
                            ? this.program.methods.addLiquidityOneSide(oneSideLiquidityParams)
                            : this.program.methods.addLiquidityByWeight(liquidityParams);
                        if (!(xYAmountDistribution.length < constants_1.MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX)) return [3 /*break*/, 9];
                        return [4 /*yield*/, programMethod
                                .accounts(isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts)
                                .instruction()];
                    case 6:
                        addLiqIx_2 = _o.sent();
                        instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), [addLiqIx_2], false), postInstructions, true);
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user)];
                    case 7:
                        setCUIx_2 = _o.sent();
                        instructions.unshift(setCUIx_2);
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 8:
                        _g = _o.sent(), blockhash_2 = _g.blockhash, lastValidBlockHeight_2 = _g.lastValidBlockHeight;
                        return [2 /*return*/, (_j = new web3_js_1.Transaction({
                                blockhash: blockhash_2,
                                lastValidBlockHeight: lastValidBlockHeight_2,
                                feePayer: user,
                            })).add.apply(_j, instructions)];
                    case 9: return [4 /*yield*/, programMethod
                            .accounts(isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts)
                            .instruction()];
                    case 10:
                        addLiqIx = _o.sent();
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, [addLiqIx], user)];
                    case 11:
                        setCUIx = _o.sent();
                        mainInstructions = [setCUIx, addLiqIx];
                        transactions = [];
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 12:
                        _h = _o.sent(), blockhash = _h.blockhash, lastValidBlockHeight = _h.lastValidBlockHeight;
                        if (preInstructions.length) {
                            preInstructionsTx = (_k = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_k, preInstructions);
                            transactions.push(preInstructionsTx);
                        }
                        mainTx = (_l = new web3_js_1.Transaction({
                            blockhash: blockhash,
                            lastValidBlockHeight: lastValidBlockHeight,
                            feePayer: user,
                        })).add.apply(_l, mainInstructions);
                        transactions.push(mainTx);
                        if (postInstructions.length) {
                            postInstructionsTx = (_m = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_m, postInstructions);
                            transactions.push(postInstructionsTx);
                        }
                        return [2 /*return*/, transactions];
                }
            });
        });
    };
    /**
     * The `removeLiquidity` function is used to remove liquidity from a position,
     * with the option to claim rewards and close the position.
     * @param
     *    - `user`: The public key of the user account.
     *    - `position`: The public key of the position account.
     *    - `binIds`: An array of numbers that represent the bin IDs to remove liquidity from.
     *    - `liquiditiesBpsToRemove`: An array of numbers (percentage) that represent the liquidity to remove from each bin.
     *    - `shouldClaimAndClose`: A boolean flag that indicates whether to claim rewards and close the position.
     * @returns {Promise<Transaction|Transaction[]>}
     */
    DLMM.prototype.removeLiquidity = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var lowerBinIdToRemove, upperBinIdToRemove, _c, lbPair, owner, feeOwner, positionLowerBinId, liquidityShares, lowerBinArrayIndex, upperBinArrayIndex, binArrayLower, binArrayUpper, preInstructions, walletToReceiveFee, _d, _e, userTokenX, createPayerTokenXIx, _f, userTokenY, createPayerTokenYIx, _g, feeOwnerTokenX, createFeeOwnerTokenXIx, _h, feeOwnerTokenY, createFeeOwnerTokenYIx, secondTransactionsIx, postInstructions, claimSwapFeeIx, i, rewardInfo, _j, ataPubKey, rewardAtaIx, claimRewardIx, closePositionIx, closeWrappedSOLIx, minBinArrayIndex, maxBinArrayIndex, useExtension, binArrayBitmapExtension, removeLiquidityTx, instructions, setCUIx, setCUIx_3, _k, blockhash, lastValidBlockHeight, claimRewardsTx, mainTx, _l, blockhash, lastValidBlockHeight;
            var _m, _o, _p;
            var user = _b.user, position = _b.position, binIds = _b.binIds, bps = _b.bps, _q = _b.shouldClaimAndClose, shouldClaimAndClose = _q === void 0 ? false : _q;
            return __generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        lowerBinIdToRemove = Math.min.apply(Math, binIds);
                        upperBinIdToRemove = Math.max.apply(Math, binIds);
                        return [4 /*yield*/, this.program.account.positionV2.fetch(position)];
                    case 1:
                        _c = _r.sent(), lbPair = _c.lbPair, owner = _c.owner, feeOwner = _c.feeOwner, positionLowerBinId = _c.lowerBinId, liquidityShares = _c.liquidityShares;
                        if (liquidityShares.every(function (share) { return share.isZero(); })) {
                            throw new Error("No liquidity to remove");
                        }
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(positionLowerBinId));
                        upperBinArrayIndex = lowerBinArrayIndex.add(new anchor_1.BN(1));
                        binArrayLower = (0, helpers_1.deriveBinArray)(lbPair, lowerBinArrayIndex, this.program.programId)[0];
                        binArrayUpper = (0, helpers_1.deriveBinArray)(lbPair, upperBinArrayIndex, this.program.programId)[0];
                        preInstructions = [];
                        walletToReceiveFee = feeOwner.equals(web3_js_1.PublicKey.default)
                            ? user
                            : feeOwner;
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, owner, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, owner, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, walletToReceiveFee, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, walletToReceiveFee, user),
                            ])];
                    case 2:
                        _d = _r.sent(), _e = _d[0], userTokenX = _e.ataPubKey, createPayerTokenXIx = _e.ix, _f = _d[1], userTokenY = _f.ataPubKey, createPayerTokenYIx = _f.ix, _g = _d[2], feeOwnerTokenX = _g.ataPubKey, createFeeOwnerTokenXIx = _g.ix, _h = _d[3], feeOwnerTokenY = _h.ataPubKey, createFeeOwnerTokenYIx = _h.ix;
                        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
                        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
                        if (!walletToReceiveFee.equals(owner)) {
                            createFeeOwnerTokenXIx && preInstructions.push(createFeeOwnerTokenXIx);
                            createFeeOwnerTokenYIx && preInstructions.push(createFeeOwnerTokenYIx);
                        }
                        secondTransactionsIx = [];
                        postInstructions = [];
                        if (!shouldClaimAndClose) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.program.methods
                                .claimFee()
                                .accounts({
                                binArrayLower: binArrayLower,
                                binArrayUpper: binArrayUpper,
                                lbPair: this.pubkey,
                                sender: user,
                                position: position,
                                reserveX: this.lbPair.reserveX,
                                reserveY: this.lbPair.reserveY,
                                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                tokenXMint: this.tokenX.publicKey,
                                tokenYMint: this.tokenY.publicKey,
                                userTokenX: feeOwnerTokenX,
                                userTokenY: feeOwnerTokenY,
                            })
                                .instruction()];
                    case 3:
                        claimSwapFeeIx = _r.sent();
                        postInstructions.push(claimSwapFeeIx);
                        i = 0;
                        _r.label = 4;
                    case 4:
                        if (!(i < 2)) return [3 /*break*/, 8];
                        rewardInfo = this.lbPair.rewardInfos[i];
                        if (!rewardInfo || rewardInfo.mint.equals(web3_js_1.PublicKey.default))
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, rewardInfo.mint, user)];
                    case 5:
                        _j = _r.sent(), ataPubKey = _j.ataPubKey, rewardAtaIx = _j.ix;
                        rewardAtaIx && preInstructions.push(rewardAtaIx);
                        return [4 /*yield*/, this.program.methods
                                .claimReward(new anchor_1.BN(i))
                                .accounts({
                                lbPair: this.pubkey,
                                sender: user,
                                position: position,
                                binArrayLower: binArrayLower,
                                binArrayUpper: binArrayUpper,
                                rewardVault: rewardInfo.vault,
                                rewardMint: rewardInfo.mint,
                                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                userTokenAccount: ataPubKey,
                            })
                                .instruction()];
                    case 6:
                        claimRewardIx = _r.sent();
                        secondTransactionsIx.push(claimRewardIx);
                        _r.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 4];
                    case 8: return [4 /*yield*/, this.program.methods
                            .closePosition()
                            .accounts({
                            binArrayLower: binArrayLower,
                            binArrayUpper: binArrayUpper,
                            rentReceiver: owner, // Must be position owner
                            position: position,
                            lbPair: this.pubkey,
                            sender: user,
                        })
                            .instruction()];
                    case 9:
                        closePositionIx = _r.sent();
                        if (secondTransactionsIx.length) {
                            secondTransactionsIx.push(closePositionIx);
                        }
                        else {
                            postInstructions.push(closePositionIx);
                        }
                        _r.label = 10;
                    case 10:
                        if (![
                            this.tokenX.publicKey.toBase58(),
                            this.tokenY.publicKey.toBase58(),
                        ].includes(spl_token_1.NATIVE_MINT.toBase58())) return [3 /*break*/, 12];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 11:
                        closeWrappedSOLIx = _r.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _r.label = 12;
                    case 12:
                        minBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinIdToRemove));
                        maxBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinIdToRemove));
                        useExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(minBinArrayIndex) ||
                            (0, helpers_1.isOverflowDefaultBinArrayBitmap)(maxBinArrayIndex);
                        binArrayBitmapExtension = useExtension
                            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
                            : null;
                        return [4 /*yield*/, this.program.methods
                                .removeLiquidityByRange(lowerBinIdToRemove, upperBinIdToRemove, bps.toNumber())
                                .accounts({
                                position: position,
                                lbPair: lbPair,
                                userTokenX: userTokenX,
                                userTokenY: userTokenY,
                                reserveX: this.lbPair.reserveX,
                                reserveY: this.lbPair.reserveY,
                                tokenXMint: this.tokenX.publicKey,
                                tokenYMint: this.tokenY.publicKey,
                                binArrayLower: binArrayLower,
                                binArrayUpper: binArrayUpper,
                                binArrayBitmapExtension: binArrayBitmapExtension,
                                tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                sender: user,
                            })
                                .instruction()];
                    case 13:
                        removeLiquidityTx = _r.sent();
                        instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), [
                            removeLiquidityTx
                        ], false), postInstructions, true);
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user)];
                    case 14:
                        setCUIx = _r.sent();
                        instructions.unshift(setCUIx);
                        if (!secondTransactionsIx.length) return [3 /*break*/, 17];
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, secondTransactionsIx, user)];
                    case 15:
                        setCUIx_3 = _r.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 16:
                        _k = _r.sent(), blockhash = _k.blockhash, lastValidBlockHeight = _k.lastValidBlockHeight;
                        claimRewardsTx = (_m = new web3_js_1.Transaction({
                            blockhash: blockhash,
                            lastValidBlockHeight: lastValidBlockHeight,
                            feePayer: user,
                        })).add.apply(_m, __spreadArray([setCUIx_3], secondTransactionsIx, false));
                        mainTx = (_o = new web3_js_1.Transaction({
                            blockhash: blockhash,
                            lastValidBlockHeight: lastValidBlockHeight,
                            feePayer: user,
                        })).add.apply(_o, instructions);
                        return [2 /*return*/, [mainTx, claimRewardsTx]];
                    case 17: return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 18:
                        _l = _r.sent(), blockhash = _l.blockhash, lastValidBlockHeight = _l.lastValidBlockHeight;
                        return [2 /*return*/, (_p = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_p, instructions)];
                }
            });
        });
    };
    /**
     * The `closePosition` function closes a position
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction>}
     */
    DLMM.prototype.closePosition = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var lowerBinId, lowerBinArrayIndex, binArrayLower, upperBinArrayIndex, binArrayUpper, closePositionTx, _c, blockhash, lastValidBlockHeight;
            var owner = _b.owner, position = _b.position;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.program.account.positionV2.fetch(position.publicKey)];
                    case 1:
                        lowerBinId = (_d.sent()).lowerBinId;
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
                        binArrayLower = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        upperBinArrayIndex = lowerBinArrayIndex.add(new anchor_1.BN(1));
                        binArrayUpper = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        return [4 /*yield*/, this.program.methods
                                .closePosition()
                                .accounts({
                                binArrayLower: binArrayLower,
                                binArrayUpper: binArrayUpper,
                                rentReceiver: owner,
                                position: position.publicKey,
                                lbPair: this.pubkey,
                                sender: owner,
                            })
                                .transaction()];
                    case 2:
                        closePositionTx = _d.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 3:
                        _c = _d.sent(), blockhash = _c.blockhash, lastValidBlockHeight = _c.lastValidBlockHeight;
                        return [2 /*return*/, new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: owner,
                            }).add(closePositionTx)];
                }
            });
        });
    };
    /**
     * The `swapQuoteExactOut` function returns a quote for a swap
     * @param
     *    - `outAmount`: Amount of lamport to swap out
     *    - `swapForY`: Swap token X to Y when it is true, else reversed.
     *    - `allowedSlippage`: Allowed slippage for the swap. Expressed in BPS. To convert from slippage percentage to BPS unit: SLIPPAGE_PERCENTAGE * 100
     * @returns {SwapQuote}
     *    - `inAmount`: Amount of lamport to swap in
     *    - `outAmount`: Amount of lamport to swap out
     *    - `fee`: Fee amount
     *    - `protocolFee`: Protocol fee amount
     *    - `maxInAmount`: Maximum amount of lamport to swap in
     *    - `binArraysPubkey`: Array of bin arrays involved in the swap
     * @throws {DlmmSdkError}
     *
     */
    DLMM.prototype.swapQuoteExactOut = function (outAmount, swapForY, allowedSlippage, binArrays) {
        var _a, _b;
        // TODO: Should we use onchain clock ? Volatile fee rate is sensitive to time. Caching clock might causes the quoted fee off ...
        var currentTimestamp = Date.now() / 1000;
        var outAmountLeft = outAmount;
        var vParameterClone = Object.assign({}, this.lbPair.vParameters);
        var activeId = new anchor_1.BN(this.lbPair.activeId);
        var binStep = this.lbPair.binStep;
        var sParameters = this.lbPair.parameters;
        this.updateReference(activeId.toNumber(), vParameterClone, sParameters, currentTimestamp);
        var startBinId = activeId;
        var binArraysForSwap = new Map();
        var actualInAmount = new anchor_1.BN(0);
        var feeAmount = new anchor_1.BN(0);
        var protocolFeeAmount = new anchor_1.BN(0);
        while (!outAmountLeft.isZero()) {
            var binArrayAccountToSwap = (0, helpers_1.findNextBinArrayWithLiquidity)(swapForY, activeId, this.lbPair, (_b = (_a = this.binArrayBitmapExtension) === null || _a === void 0 ? void 0 : _a.account) !== null && _b !== void 0 ? _b : null, binArrays);
            if (binArrayAccountToSwap == null) {
                throw new error_1.DlmmSdkError("SWAP_QUOTE_INSUFFICIENT_LIQUIDITY", "Insufficient liquidity in binArrays");
            }
            binArraysForSwap.set(binArrayAccountToSwap.publicKey, true);
            this.updateVolatilityAccumulator(vParameterClone, sParameters, activeId.toNumber());
            if ((0, helpers_1.isBinIdWithinBinArray)(activeId, binArrayAccountToSwap.account.index)) {
                var bin = (0, helpers_1.getBinFromBinArray)(activeId.toNumber(), binArrayAccountToSwap.account);
                var _c = (0, helpers_1.swapExactOutQuoteAtBin)(bin, binStep, sParameters, vParameterClone, outAmountLeft, swapForY), amountIn = _c.amountIn, amountOut = _c.amountOut, fee = _c.fee, protocolFee = _c.protocolFee;
                if (!amountOut.isZero()) {
                    outAmountLeft = outAmountLeft.sub(amountOut);
                    actualInAmount = actualInAmount.add(amountIn);
                    feeAmount = feeAmount.add(fee);
                    protocolFeeAmount = protocolFee.add(protocolFee);
                }
            }
            if (!outAmountLeft.isZero()) {
                if (swapForY) {
                    activeId = activeId.sub(new anchor_1.BN(1));
                }
                else {
                    activeId = activeId.add(new anchor_1.BN(1));
                }
            }
        }
        var startPrice = (0, helpers_1.getPriceOfBinByBinId)(startBinId.toNumber(), this.lbPair.binStep);
        var endPrice = (0, helpers_1.getPriceOfBinByBinId)(activeId.toNumber(), this.lbPair.binStep);
        var priceImpact = startPrice
            .sub(endPrice)
            .abs()
            .div(startPrice)
            .mul(new decimal_js_1.default(100));
        var maxInAmount = actualInAmount
            .mul(new anchor_1.BN(constants_1.BASIS_POINT_MAX).add(allowedSlippage))
            .div(new anchor_1.BN(constants_1.BASIS_POINT_MAX));
        return {
            inAmount: actualInAmount,
            maxInAmount: maxInAmount,
            outAmount: outAmount,
            priceImpact: priceImpact,
            fee: feeAmount,
            protocolFee: protocolFeeAmount,
            binArraysPubkey: __spreadArray([], binArraysForSwap.keys(), true),
        };
    };
    /**
     * The `swapQuote` function returns a quote for a swap
     * @param
     *    - `inAmount`: Amount of lamport to swap in
     *    - `swapForY`: Swap token X to Y when it is true, else reversed.
     *    - `allowedSlippage`: Allowed slippage for the swap. Expressed in BPS. To convert from slippage percentage to BPS unit: SLIPPAGE_PERCENTAGE * 100
     *    - `binArrays`: binArrays for swapQuote.
     *    - `isPartialFill`: Flag to check whether the the swapQuote is partial fill, default = false.
     * @returns {SwapQuote}
     *    - `consumedInAmount`: Amount of lamport to swap in
     *    - `outAmount`: Amount of lamport to swap out
     *    - `fee`: Fee amount
     *    - `protocolFee`: Protocol fee amount
     *    - `minOutAmount`: Minimum amount of lamport to swap out
     *    - `priceImpact`: Price impact of the swap
     *    - `binArraysPubkey`: Array of bin arrays involved in the swap
     * @throws {DlmmSdkError}
     */
    DLMM.prototype.swapQuote = function (inAmount, swapForY, allowedSlippage, binArrays, isPartialFill) {
        var _a, _b;
        // TODO: Should we use onchain clock ? Volatile fee rate is sensitive to time. Caching clock might causes the quoted fee off ...
        var currentTimestamp = Date.now() / 1000;
        var inAmountLeft = inAmount;
        var vParameterClone = Object.assign({}, this.lbPair.vParameters);
        var activeId = new anchor_1.BN(this.lbPair.activeId);
        var binStep = this.lbPair.binStep;
        var sParameters = this.lbPair.parameters;
        this.updateReference(activeId.toNumber(), vParameterClone, sParameters, currentTimestamp);
        var startBin = null;
        var binArraysForSwap = new Map();
        var actualOutAmount = new anchor_1.BN(0);
        var feeAmount = new anchor_1.BN(0);
        var protocolFeeAmount = new anchor_1.BN(0);
        var lastFilledActiveBinId = activeId;
        while (!inAmountLeft.isZero()) {
            var binArrayAccountToSwap = (0, helpers_1.findNextBinArrayWithLiquidity)(swapForY, activeId, this.lbPair, (_b = (_a = this.binArrayBitmapExtension) === null || _a === void 0 ? void 0 : _a.account) !== null && _b !== void 0 ? _b : null, binArrays);
            if (binArrayAccountToSwap == null) {
                if (isPartialFill) {
                    break;
                }
                else {
                    throw new error_1.DlmmSdkError("SWAP_QUOTE_INSUFFICIENT_LIQUIDITY", "Insufficient liquidity in binArrays for swapQuote");
                }
            }
            binArraysForSwap.set(binArrayAccountToSwap.publicKey, true);
            this.updateVolatilityAccumulator(vParameterClone, sParameters, activeId.toNumber());
            if ((0, helpers_1.isBinIdWithinBinArray)(activeId, binArrayAccountToSwap.account.index)) {
                var bin = (0, helpers_1.getBinFromBinArray)(activeId.toNumber(), binArrayAccountToSwap.account);
                var _c = (0, helpers_1.swapExactInQuoteAtBin)(bin, binStep, sParameters, vParameterClone, inAmountLeft, swapForY), amountIn = _c.amountIn, amountOut = _c.amountOut, fee = _c.fee, protocolFee = _c.protocolFee;
                if (!amountIn.isZero()) {
                    inAmountLeft = inAmountLeft.sub(amountIn);
                    actualOutAmount = actualOutAmount.add(amountOut);
                    feeAmount = feeAmount.add(fee);
                    protocolFeeAmount = protocolFee.add(protocolFee);
                    if (!startBin) {
                        startBin = bin;
                    }
                    lastFilledActiveBinId = activeId;
                }
            }
            if (!inAmountLeft.isZero()) {
                if (swapForY) {
                    activeId = activeId.sub(new anchor_1.BN(1));
                }
                else {
                    activeId = activeId.add(new anchor_1.BN(1));
                }
            }
        }
        if (!startBin) {
            // The pool insufficient liquidity
            throw new error_1.DlmmSdkError("SWAP_QUOTE_INSUFFICIENT_LIQUIDITY", "Insufficient liquidity");
        }
        inAmount = inAmount.sub(inAmountLeft);
        var outAmountWithoutSlippage = (0, helpers_1.getOutAmount)(startBin, inAmount.sub((0, helpers_1.computeFeeFromAmount)(binStep, sParameters, vParameterClone, inAmount)), swapForY);
        var priceImpact = new decimal_js_1.default(actualOutAmount.toString())
            .sub(new decimal_js_1.default(outAmountWithoutSlippage.toString()))
            .div(new decimal_js_1.default(outAmountWithoutSlippage.toString()))
            .mul(new decimal_js_1.default(100));
        var minOutAmount = actualOutAmount
            .mul(new anchor_1.BN(constants_1.BASIS_POINT_MAX).sub(allowedSlippage))
            .div(new anchor_1.BN(constants_1.BASIS_POINT_MAX));
        var endPrice = (0, helpers_1.getPriceOfBinByBinId)(lastFilledActiveBinId.toNumber(), this.lbPair.binStep);
        return {
            consumedInAmount: inAmount,
            outAmount: actualOutAmount,
            fee: feeAmount,
            protocolFee: protocolFeeAmount,
            minOutAmount: minOutAmount,
            priceImpact: priceImpact,
            binArraysPubkey: __spreadArray([], binArraysForSwap.keys(), true),
            endPrice: endPrice,
        };
    };
    DLMM.prototype.swapExactOut = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var _c, tokenXMint, tokenYMint, reserveX, reserveY, activeId, oracle, preInstructions, postInstructions, _d, _e, userTokenIn, createInTokenAccountIx, _f, userTokenOut, createOutTokenAccountIx, wrapSOLIx, closeWrappedSOLIx, closeWrappedSOLIx, swapForY, binArrays, swapIx, instructions, setCUIx, _g, blockhash, lastValidBlockHeight;
            var _h;
            var inToken = _b.inToken, outToken = _b.outToken, outAmount = _b.outAmount, maxInAmount = _b.maxInAmount, lbPair = _b.lbPair, user = _b.user, binArraysPubkey = _b.binArraysPubkey;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0: return [4 /*yield*/, this.program.account.lbPair.fetch(lbPair)];
                    case 1:
                        _c = _j.sent(), tokenXMint = _c.tokenXMint, tokenYMint = _c.tokenYMint, reserveX = _c.reserveX, reserveY = _c.reserveY, activeId = _c.activeId, oracle = _c.oracle;
                        preInstructions = [];
                        postInstructions = [];
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, inToken, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, outToken, user),
                            ])];
                    case 2:
                        _d = _j.sent(), _e = _d[0], userTokenIn = _e.ataPubKey, createInTokenAccountIx = _e.ix, _f = _d[1], userTokenOut = _f.ataPubKey, createOutTokenAccountIx = _f.ix;
                        createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
                        createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
                        if (!inToken.equals(spl_token_1.NATIVE_MINT)) return [3 /*break*/, 4];
                        wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenIn, BigInt(maxInAmount.toString()));
                        preInstructions.push.apply(preInstructions, wrapSOLIx);
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 3:
                        closeWrappedSOLIx = _j.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _j.label = 4;
                    case 4:
                        if (!outToken.equals(spl_token_1.NATIVE_MINT)) return [3 /*break*/, 6];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 5:
                        closeWrappedSOLIx = _j.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _j.label = 6;
                    case 6:
                        swapForY = true;
                        if (outToken.equals(tokenXMint))
                            swapForY = false;
                        binArrays = binArraysPubkey.map(function (pubkey) {
                            return {
                                isSigner: false,
                                isWritable: true,
                                pubkey: pubkey,
                            };
                        });
                        return [4 /*yield*/, this.program.methods
                                .swapExactOut(maxInAmount, outAmount)
                                .accounts({
                                lbPair: lbPair,
                                reserveX: reserveX,
                                reserveY: reserveY,
                                tokenXMint: tokenXMint,
                                tokenYMint: tokenYMint,
                                tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                user: user,
                                userTokenIn: userTokenIn,
                                userTokenOut: userTokenOut,
                                binArrayBitmapExtension: this.binArrayBitmapExtension
                                    ? this.binArrayBitmapExtension.publicKey
                                    : null,
                                oracle: oracle,
                                hostFeeIn: null,
                            })
                                .remainingAccounts(binArrays)
                                .instruction()];
                    case 7:
                        swapIx = _j.sent();
                        instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), [swapIx], false), postInstructions, true);
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user)];
                    case 8:
                        setCUIx = _j.sent();
                        instructions.unshift(setCUIx);
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 9:
                        _g = _j.sent(), blockhash = _g.blockhash, lastValidBlockHeight = _g.lastValidBlockHeight;
                        return [2 /*return*/, (_h = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_h, instructions)];
                }
            });
        });
    };
    /**
     * Returns a transaction to be signed and sent by user performing swap.
     * @param {SwapWithPriceImpactParams}
     *    - `inToken`: The public key of the token to be swapped in.
     *    - `outToken`: The public key of the token to be swapped out.
     *    - `inAmount`: The amount of token to be swapped in.
     *    - `priceImpact`: Accepted price impact bps.
     *    - `lbPair`: The public key of the liquidity pool.
     *    - `user`: The public key of the user account.
     *    - `binArraysPubkey`: Array of bin arrays involved in the swap
     * @returns {Promise<Transaction>}
     */
    DLMM.prototype.swapWithPriceImpact = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var preInstructions, postInstructions, _c, _d, userTokenIn, createInTokenAccountIx, _e, userTokenOut, createOutTokenAccountIx, wrapSOLIx, closeWrappedSOLIx, closeWrappedSOLIx, binArrays, swapIx, instructions, setCUIx, _f, blockhash, lastValidBlockHeight;
            var _g;
            var inToken = _b.inToken, outToken = _b.outToken, inAmount = _b.inAmount, lbPair = _b.lbPair, user = _b.user, priceImpact = _b.priceImpact, binArraysPubkey = _b.binArraysPubkey;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        preInstructions = [];
                        postInstructions = [];
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, inToken, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, outToken, user),
                            ])];
                    case 1:
                        _c = _h.sent(), _d = _c[0], userTokenIn = _d.ataPubKey, createInTokenAccountIx = _d.ix, _e = _c[1], userTokenOut = _e.ataPubKey, createOutTokenAccountIx = _e.ix;
                        createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
                        createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
                        if (!inToken.equals(spl_token_1.NATIVE_MINT)) return [3 /*break*/, 3];
                        wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenIn, BigInt(inAmount.toString()));
                        preInstructions.push.apply(preInstructions, wrapSOLIx);
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 2:
                        closeWrappedSOLIx = _h.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _h.label = 3;
                    case 3:
                        if (!outToken.equals(spl_token_1.NATIVE_MINT)) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 4:
                        closeWrappedSOLIx = _h.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _h.label = 5;
                    case 5:
                        binArrays = binArraysPubkey.map(function (pubkey) {
                            return {
                                isSigner: false,
                                isWritable: true,
                                pubkey: pubkey,
                            };
                        });
                        return [4 /*yield*/, this.program.methods
                                .swapWithPriceImpact(inAmount, this.lbPair.activeId, priceImpact.toNumber())
                                .accounts({
                                lbPair: lbPair,
                                reserveX: this.lbPair.reserveX,
                                reserveY: this.lbPair.reserveY,
                                tokenXMint: this.lbPair.tokenXMint,
                                tokenYMint: this.lbPair.tokenYMint,
                                tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                user: user,
                                userTokenIn: userTokenIn,
                                userTokenOut: userTokenOut,
                                binArrayBitmapExtension: this.binArrayBitmapExtension
                                    ? this.binArrayBitmapExtension.publicKey
                                    : null,
                                oracle: this.lbPair.oracle,
                                hostFeeIn: null,
                            })
                                .remainingAccounts(binArrays)
                                .instruction()];
                    case 6:
                        swapIx = _h.sent();
                        instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), [swapIx], false), postInstructions, true);
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user)];
                    case 7:
                        setCUIx = _h.sent();
                        instructions.unshift(setCUIx);
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 8:
                        _f = _h.sent(), blockhash = _f.blockhash, lastValidBlockHeight = _f.lastValidBlockHeight;
                        return [2 /*return*/, (_g = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_g, instructions)];
                }
            });
        });
    };
    /**
     * Returns a transaction to be signed and sent by user performing swap.
     * @param {SwapParams}
     *    - `inToken`: The public key of the token to be swapped in.
     *    - `outToken`: The public key of the token to be swapped out.
     *    - `inAmount`: The amount of token to be swapped in.
     *    - `minOutAmount`: The minimum amount of token to be swapped out.
     *    - `lbPair`: The public key of the liquidity pool.
     *    - `user`: The public key of the user account.
     *    - `binArraysPubkey`: Array of bin arrays involved in the swap
     * @returns {Promise<Transaction>}
     */
    DLMM.prototype.swap = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var preInstructions, postInstructions, _c, _d, userTokenIn, createInTokenAccountIx, _e, userTokenOut, createOutTokenAccountIx, wrapSOLIx, closeWrappedSOLIx, closeWrappedSOLIx, binArrays, swapIx, instructions, setCUIx, _f, blockhash, lastValidBlockHeight;
            var _g;
            var inToken = _b.inToken, outToken = _b.outToken, inAmount = _b.inAmount, minOutAmount = _b.minOutAmount, lbPair = _b.lbPair, user = _b.user, binArraysPubkey = _b.binArraysPubkey;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        preInstructions = [];
                        postInstructions = [];
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, inToken, user),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, outToken, user),
                            ])];
                    case 1:
                        _c = _h.sent(), _d = _c[0], userTokenIn = _d.ataPubKey, createInTokenAccountIx = _d.ix, _e = _c[1], userTokenOut = _e.ataPubKey, createOutTokenAccountIx = _e.ix;
                        createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
                        createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
                        if (!inToken.equals(spl_token_1.NATIVE_MINT)) return [3 /*break*/, 3];
                        wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenIn, BigInt(inAmount.toString()));
                        preInstructions.push.apply(preInstructions, wrapSOLIx);
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 2:
                        closeWrappedSOLIx = _h.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _h.label = 3;
                    case 3:
                        if (!outToken.equals(spl_token_1.NATIVE_MINT)) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(user)];
                    case 4:
                        closeWrappedSOLIx = _h.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _h.label = 5;
                    case 5:
                        binArrays = binArraysPubkey.map(function (pubkey) {
                            return {
                                isSigner: false,
                                isWritable: true,
                                pubkey: pubkey,
                            };
                        });
                        return [4 /*yield*/, this.program.methods
                                .swap(inAmount, minOutAmount)
                                .accounts({
                                lbPair: lbPair,
                                reserveX: this.lbPair.reserveX,
                                reserveY: this.lbPair.reserveY,
                                tokenXMint: this.lbPair.tokenXMint,
                                tokenYMint: this.lbPair.tokenYMint,
                                tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID, // dont use 2022 first; lack familiarity
                                tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID, // dont use 2022 first; lack familiarity
                                user: user,
                                userTokenIn: userTokenIn,
                                userTokenOut: userTokenOut,
                                binArrayBitmapExtension: this.binArrayBitmapExtension
                                    ? this.binArrayBitmapExtension.publicKey
                                    : null,
                                oracle: this.lbPair.oracle,
                                hostFeeIn: null,
                            })
                                .remainingAccounts(binArrays)
                                .instruction()];
                    case 6:
                        swapIx = _h.sent();
                        instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), [swapIx], false), postInstructions, true);
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user)];
                    case 7:
                        setCUIx = _h.sent();
                        instructions.unshift(setCUIx);
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 8:
                        _f = _h.sent(), blockhash = _f.blockhash, lastValidBlockHeight = _f.lastValidBlockHeight;
                        return [2 /*return*/, (_g = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: user,
                            })).add.apply(_g, instructions)];
                }
            });
        });
    };
    /**
     * The claimLMReward function is used to claim rewards for a specific position owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction>}
     */
    DLMM.prototype.claimLMReward = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var claimTransactions, instructions, setCUIx, _c, blockhash, lastValidBlockHeight;
            var _d;
            var owner = _b.owner, position = _b.position;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.createClaimBuildMethod({
                            owner: owner,
                            position: position,
                        })];
                    case 1:
                        claimTransactions = _e.sent();
                        if (!claimTransactions.length)
                            return [2 /*return*/];
                        instructions = claimTransactions.map(function (t) { return t.instructions; }).flat();
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, owner)];
                    case 2:
                        setCUIx = _e.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 3:
                        _c = _e.sent(), blockhash = _c.blockhash, lastValidBlockHeight = _c.lastValidBlockHeight;
                        return [2 /*return*/, (_d = new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: owner,
                            })).add.apply(_d, __spreadArray([setCUIx], claimTransactions, false))];
                }
            });
        });
    };
    /**
     * The `claimAllLMRewards` function is used to claim all liquidity mining rewards for a given owner
     * and their positions.
     * @param
     *    - `owner`: The public key of the owner of the positions.
     *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim rewards from.
     * @returns {Promise<Transaction[]>}
     */
    DLMM.prototype.claimAllLMRewards = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var claimAllTxs, chunkedClaimAllTx, setCUIx, _c, blockhash, lastValidBlockHeight;
            var _this = this;
            var owner = _b.owner, positions = _b.positions;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, Promise.all(positions
                            .filter(function (_a) {
                            var _b = _a.positionData, rewardOne = _b.rewardOne, rewardTwo = _b.rewardTwo;
                            return !rewardOne.isZero() || !rewardTwo.isZero();
                        })
                            .map(function (position, idx) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.createClaimBuildMethod({
                                            owner: owner,
                                            position: position,
                                            shouldIncludePreIx: idx === 0,
                                        })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); }))];
                    case 1:
                        claimAllTxs = (_d.sent()).flat();
                        chunkedClaimAllTx = (0, helpers_1.chunks)(claimAllTxs, constants_1.MAX_CLAIM_ALL_ALLOWED);
                        if (chunkedClaimAllTx.length === 0)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, 
                            // First tx simulation will success because it will create all the ATA. Then, we use the simulated CU as references for the rest
                            chunkedClaimAllTx[0].map(function (t) { return t.instructions; }).flat(), owner)];
                    case 2:
                        setCUIx = _d.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 3:
                        _c = _d.sent(), blockhash = _c.blockhash, lastValidBlockHeight = _c.lastValidBlockHeight;
                        return [2 /*return*/, Promise.all(chunkedClaimAllTx.map(function (claimAllTx) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    return [2 /*return*/, (_a = new web3_js_1.Transaction({
                                            feePayer: owner,
                                            blockhash: blockhash,
                                            lastValidBlockHeight: lastValidBlockHeight,
                                        })
                                            .add(setCUIx))
                                            .add.apply(_a, claimAllTx)];
                                });
                            }); }))];
                }
            });
        });
    };
    DLMM.prototype.setActivationPoint = function (activationPoint) {
        return __awaiter(this, void 0, void 0, function () {
            var setActivationPointTx, _a, blockhash, lastValidBlockHeight;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.program.methods
                            .setActivationPoint(activationPoint)
                            .accounts({
                            lbPair: this.pubkey,
                            admin: this.lbPair.creator,
                        })
                            .transaction()];
                    case 1:
                        setActivationPointTx = _b.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 2:
                        _a = _b.sent(), blockhash = _a.blockhash, lastValidBlockHeight = _a.lastValidBlockHeight;
                        return [2 /*return*/, new web3_js_1.Transaction({
                                feePayer: this.lbPair.creator,
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                            }).add(setActivationPointTx)];
                }
            });
        });
    };
    DLMM.prototype.setPairStatus = function (enabled) {
        return __awaiter(this, void 0, void 0, function () {
            var pairStatus, tx, _a, blockhash, lastValidBlockHeight;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pairStatus = enabled ? 0 : 1;
                        return [4 /*yield*/, this.program.methods.setPairStatus(pairStatus).accounts({
                                lbPair: this.pubkey,
                                admin: this.lbPair.creator
                            }).transaction()];
                    case 1:
                        tx = _b.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 2:
                        _a = _b.sent(), blockhash = _a.blockhash, lastValidBlockHeight = _a.lastValidBlockHeight;
                        return [2 /*return*/, new web3_js_1.Transaction({
                                feePayer: this.lbPair.creator,
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                            }).add(tx)];
                }
            });
        });
    };
    /**
     * The function `claimSwapFee` is used to claim swap fees for a specific position owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction>}
     */
    DLMM.prototype.claimSwapFee = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var claimFeeTx, _c, blockhash, lastValidBlockHeight;
            var owner = _b.owner, position = _b.position;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.createClaimSwapFeeMethod({ owner: owner, position: position })];
                    case 1:
                        claimFeeTx = _d.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 2:
                        _c = _d.sent(), blockhash = _c.blockhash, lastValidBlockHeight = _c.lastValidBlockHeight;
                        return [2 /*return*/, new web3_js_1.Transaction({
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                                feePayer: owner,
                            }).add(claimFeeTx)];
                }
            });
        });
    };
    /**
     * The `claimAllSwapFee` function to claim swap fees for multiple positions owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the positions.
     *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim swap fees from.
     * @returns {Promise<Transaction[]>}
     */
    DLMM.prototype.claimAllSwapFee = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var claimAllTxs, chunkedClaimAllTx, setCUIx, _c, blockhash, lastValidBlockHeight;
            var _this = this;
            var owner = _b.owner, positions = _b.positions;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, Promise.all(positions
                            .filter(function (_a) {
                            var _b = _a.positionData, feeX = _b.feeX, feeY = _b.feeY;
                            return !feeX.isZero() || !feeY.isZero();
                        })
                            .map(function (position, idx, positions) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.createClaimSwapFeeMethod({
                                            owner: owner,
                                            position: position,
                                            shouldIncludePretIx: idx === 0,
                                            shouldIncludePostIx: idx === positions.length - 1,
                                        })];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); }))];
                    case 1:
                        claimAllTxs = (_d.sent()).flat();
                        chunkedClaimAllTx = (0, helpers_1.chunks)(claimAllTxs, constants_1.MAX_CLAIM_ALL_ALLOWED);
                        if (chunkedClaimAllTx.length === 0)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, 
                            // First tx simulation will success because it will create all the ATA. Then, we use the simulated CU as references for the rest
                            chunkedClaimAllTx[0].map(function (t) { return t.instructions; }).flat(), owner)];
                    case 2:
                        setCUIx = _d.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 3:
                        _c = _d.sent(), blockhash = _c.blockhash, lastValidBlockHeight = _c.lastValidBlockHeight;
                        return [2 /*return*/, Promise.all(chunkedClaimAllTx.map(function (claimAllTx) { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    return [2 /*return*/, (_a = new web3_js_1.Transaction({
                                            feePayer: owner,
                                            blockhash: blockhash,
                                            lastValidBlockHeight: lastValidBlockHeight,
                                        })
                                            .add(setCUIx))
                                            .add.apply(_a, claimAllTx)];
                                });
                            }); }))];
                }
            });
        });
    };
    /**
     * The function `claimAllRewardsByPosition` allows a user to claim all rewards for a specific
     * position.
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction[]>}
     */
    DLMM.prototype.claimAllRewardsByPosition = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var preInstructions, pairTokens, tokensInvolved, _loop_1, this_1, i, feeOwner, createATAAccAndIx, claimAllSwapFeeTxs, claimAllLMTxs, claimAllTxs, postInstructions, closeWrappedSOLIx, _c, blockhash, lastValidBlockHeight;
            var _this = this;
            var owner = _b.owner, position = _b.position;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        preInstructions = [];
                        pairTokens = [this.tokenX.publicKey, this.tokenY.publicKey];
                        tokensInvolved = __spreadArray([], pairTokens, true);
                        _loop_1 = function (i) {
                            var rewardMint = this_1.lbPair.rewardInfos[i].mint;
                            if (!tokensInvolved.some(function (pubkey) { return rewardMint.equals(pubkey); }) &&
                                !rewardMint.equals(web3_js_1.PublicKey.default)) {
                                tokensInvolved.push(this_1.lbPair.rewardInfos[i].mint);
                            }
                        };
                        this_1 = this;
                        for (i = 0; i < 2; i++) {
                            _loop_1(i);
                        }
                        feeOwner = position.positionData.feeOwner.equals(web3_js_1.PublicKey.default)
                            ? owner
                            : position.positionData.feeOwner;
                        return [4 /*yield*/, Promise.all(tokensInvolved.map(function (token) {
                                // Single position. Swap fee only belongs to owner, or the customized fee owner.
                                if (pairTokens.some(function (t) { return t.equals(token); })) {
                                    return (0, helpers_1.getOrCreateATAInstruction)(_this.program.provider.connection, token, feeOwner, owner);
                                }
                                // Reward
                                return (0, helpers_1.getOrCreateATAInstruction)(_this.program.provider.connection, token, owner);
                            }))];
                    case 1:
                        createATAAccAndIx = _d.sent();
                        createATAAccAndIx.forEach(function (_a) {
                            var ix = _a.ix;
                            return ix && preInstructions.push(ix);
                        });
                        return [4 /*yield*/, this.createClaimSwapFeeMethod({
                                owner: owner,
                                position: position,
                                shouldIncludePostIx: false,
                                shouldIncludePretIx: false,
                            })];
                    case 2:
                        claimAllSwapFeeTxs = _d.sent();
                        return [4 /*yield*/, this.createClaimBuildMethod({
                                owner: owner,
                                position: position,
                                shouldIncludePreIx: false,
                            })];
                    case 3:
                        claimAllLMTxs = _d.sent();
                        claimAllTxs = (0, helpers_1.chunks)(__spreadArray([claimAllSwapFeeTxs], claimAllLMTxs, true), constants_1.MAX_CLAIM_ALL_ALLOWED);
                        postInstructions = [];
                        if (!tokensInvolved.some(function (pubkey) { return pubkey.equals(spl_token_1.NATIVE_MINT); })) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(owner)];
                    case 4:
                        closeWrappedSOLIx = _d.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _d.label = 5;
                    case 5: return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 6:
                        _c = _d.sent(), blockhash = _c.blockhash, lastValidBlockHeight = _c.lastValidBlockHeight;
                        return [2 /*return*/, Promise.all(claimAllTxs.map(function (claimAllTx) { return __awaiter(_this, void 0, void 0, function () {
                                var mainInstructions, instructions, setCUIx, tx;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            mainInstructions = claimAllTx.map(function (t) { return t.instructions; }).flat();
                                            instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), mainInstructions, true), postInstructions, true);
                                            return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, owner)];
                                        case 1:
                                            setCUIx = _a.sent();
                                            tx = new web3_js_1.Transaction({
                                                feePayer: owner,
                                                blockhash: blockhash,
                                                lastValidBlockHeight: lastValidBlockHeight,
                                            }).add(setCUIx);
                                            if (preInstructions.length)
                                                tx.add.apply(tx, preInstructions);
                                            tx.add.apply(tx, claimAllTx);
                                            if (postInstructions.length)
                                                tx.add.apply(tx, postInstructions);
                                            return [2 /*return*/, tx];
                                    }
                                });
                            }); }))];
                }
            });
        });
    };
    /**
     * The `seedLiquidity` function create multiple grouped instructions. The grouped instructions will be either [initialize bin array + initialize position instructions] or [deposit instruction] combination.
     * @param
     *    - `owner`: The public key of the positions owner.
     *    - `seedAmount`: Lamport amount to be seeded to the pool.
     *    - `minPrice`: Start price in UI format
     *    - `maxPrice`: End price in UI format
     *    - `base`: Base key
     * @returns {Promise<SeedLiquidityResponse>}
     */
    DLMM.prototype.seedLiquidity = function (owner, seedAmount, curvature, minPrice, maxPrice, base) {
        return __awaiter(this, void 0, void 0, function () {
            var toLamportMultiplier, minPricePerLamport, maxPricePerLamport, minBinId, maxBinId, k, binDepositAmount, decompressMultiplier, _a, compressedBinAmount, compressionLoss, _b, compressedBinDepositAmount, finalLoss, positionCount, seederTokenX, initializeBinArraysAndPositionIxs, addLiquidityIxs, appendedInitBinArrayIx, i, lowerBinId, upperBinId, lowerBinArrayIndex, upperBinArrayIndex, _c, positionPda, _bump, lowerBinArray, upperBinArray, accounts, instructions, lowerBinArrayAccount, _d, _e, upperBinArrayAccount, _f, _g, positionAccount, _h, _j, _k, _l, positionDeposited, cappedUpperBinId, bins, i_1, _m, _o, _p, _q;
            return __generator(this, function (_r) {
                switch (_r.label) {
                    case 0:
                        toLamportMultiplier = new decimal_js_1.default(Math.pow(10, (this.tokenY.decimal - this.tokenX.decimal)));
                        minPricePerLamport = new decimal_js_1.default(minPrice).mul(toLamportMultiplier);
                        maxPricePerLamport = new decimal_js_1.default(maxPrice).mul(toLamportMultiplier);
                        minBinId = new anchor_1.BN(DLMM.getBinIdFromPrice(minPricePerLamport, this.lbPair.binStep, false));
                        maxBinId = new anchor_1.BN(DLMM.getBinIdFromPrice(maxPricePerLamport, this.lbPair.binStep, true));
                        if (minBinId.toNumber() < this.lbPair.activeId) {
                            throw new Error("minPrice < current pair price");
                        }
                        if (minBinId.toNumber() >= maxBinId.toNumber()) {
                            throw new Error("Price range too small");
                        }
                        k = 1.0 / curvature;
                        binDepositAmount = (0, math_1.generateAmountForBinRange)(seedAmount, this.lbPair.binStep, this.tokenX.decimal, this.tokenY.decimal, minBinId, maxBinId, k);
                        decompressMultiplier = new anchor_1.BN(Math.pow(10, this.tokenX.decimal));
                        _a = (0, math_1.compressBinAmount)(binDepositAmount, decompressMultiplier), compressedBinAmount = _a.compressedBinAmount, compressionLoss = _a.compressionLoss;
                        _b = (0, math_1.distributeAmountToCompressedBinsByRatio)(compressedBinAmount, compressionLoss, decompressMultiplier, new anchor_1.BN(Math.pow(2, 32) - 1) // u32
                        ), compressedBinDepositAmount = _b.newCompressedBinAmount, finalLoss = _b.loss;
                        positionCount = (0, math_1.getPositionCount)(minBinId, maxBinId.sub(new anchor_1.BN(1)));
                        seederTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, owner, false);
                        initializeBinArraysAndPositionIxs = [];
                        addLiquidityIxs = [];
                        appendedInitBinArrayIx = new Set();
                        i = 0;
                        _r.label = 1;
                    case 1:
                        if (!(i < positionCount.toNumber())) return [3 /*break*/, 15];
                        lowerBinId = minBinId.add(constants_1.MAX_BIN_PER_POSITION.mul(new anchor_1.BN(i)));
                        upperBinId = lowerBinId.add(constants_1.MAX_BIN_PER_POSITION).sub(new anchor_1.BN(1));
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(lowerBinId);
                        upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(upperBinId);
                        _c = (0, helpers_1.derivePosition)(this.pubkey, base, lowerBinId, constants_1.MAX_BIN_PER_POSITION, this.program.programId), positionPda = _c[0], _bump = _c[1];
                        lowerBinArray = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        upperBinArray = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        return [4 /*yield*/, this.program.provider.connection.getMultipleAccountsInfo([
                                lowerBinArray,
                                upperBinArray,
                                positionPda,
                            ])];
                    case 2:
                        accounts = _r.sent();
                        instructions = [];
                        lowerBinArrayAccount = accounts[0];
                        if (!(!lowerBinArrayAccount &&
                            !appendedInitBinArrayIx.has(lowerBinArray.toBase58()))) return [3 /*break*/, 4];
                        _e = (_d = instructions).push;
                        return [4 /*yield*/, this.program.methods
                                .initializeBinArray(lowerBinArrayIndex)
                                .accounts({
                                lbPair: this.pubkey,
                                binArray: lowerBinArray,
                                funder: owner,
                            })
                                .instruction()];
                    case 3:
                        _e.apply(_d, [_r.sent()]);
                        appendedInitBinArrayIx.add(lowerBinArray.toBase58());
                        _r.label = 4;
                    case 4:
                        upperBinArrayAccount = accounts[1];
                        if (!(!upperBinArrayAccount &&
                            !appendedInitBinArrayIx.has(upperBinArray.toBase58()))) return [3 /*break*/, 6];
                        _g = (_f = instructions).push;
                        return [4 /*yield*/, this.program.methods
                                .initializeBinArray(upperBinArrayIndex)
                                .accounts({
                                lbPair: this.pubkey,
                                binArray: upperBinArray,
                                funder: owner,
                            })
                                .instruction()];
                    case 5:
                        _g.apply(_f, [_r.sent()]);
                        appendedInitBinArrayIx.add(upperBinArray.toBase58());
                        _r.label = 6;
                    case 6:
                        positionAccount = accounts[2];
                        if (!!positionAccount) return [3 /*break*/, 8];
                        _j = (_h = instructions).push;
                        return [4 /*yield*/, this.program.methods
                                .initializePositionPda(lowerBinId.toNumber(), constants_1.MAX_BIN_PER_POSITION.toNumber())
                                .accounts({
                                lbPair: this.pubkey,
                                position: positionPda,
                                base: base,
                                owner: owner,
                                payer: owner,
                            })
                                .instruction()];
                    case 7:
                        _j.apply(_h, [_r.sent()]);
                        _r.label = 8;
                    case 8:
                        if (!(instructions.length > 1)) return [3 /*break*/, 10];
                        _l = (_k = instructions).push;
                        return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, owner)];
                    case 9:
                        _l.apply(_k, [_r.sent()]);
                        initializeBinArraysAndPositionIxs.push(instructions);
                        instructions = [];
                        _r.label = 10;
                    case 10:
                        positionDeposited = positionAccount &&
                            this.program.coder.accounts
                                .decode("positionV2", positionAccount.data)
                                .liquidityShares.reduce(function (total, cur) { return total.add(cur); }, new anchor_1.BN(0))
                                .gt(new anchor_1.BN(0));
                        if (!!positionDeposited) return [3 /*break*/, 14];
                        cappedUpperBinId = Math.min(upperBinId.toNumber(), maxBinId.toNumber() - 1);
                        bins = [];
                        for (i_1 = lowerBinId.toNumber(); i_1 <= cappedUpperBinId; i_1++) {
                            bins.push({
                                binId: i_1,
                                amount: compressedBinDepositAmount.get(i_1).toNumber(),
                            });
                        }
                        _o = (_m = instructions).push;
                        return [4 /*yield*/, this.program.methods
                                .addLiquidityOneSidePrecise({
                                bins: bins,
                                decompressMultiplier: decompressMultiplier,
                            })
                                .accounts({
                                position: positionPda,
                                lbPair: this.pubkey,
                                binArrayBitmapExtension: this.binArrayBitmapExtension
                                    ? this.binArrayBitmapExtension.publicKey
                                    : this.program.programId,
                                userToken: seederTokenX,
                                reserve: this.lbPair.reserveX,
                                tokenMint: this.lbPair.tokenXMint,
                                binArrayLower: lowerBinArray,
                                binArrayUpper: upperBinArray,
                                sender: owner,
                            })
                                .instruction()];
                    case 11:
                        _o.apply(_m, [_r.sent()]);
                        if (!(i + 1 >= positionCount.toNumber() && !finalLoss.isZero())) return [3 /*break*/, 13];
                        _q = (_p = instructions).push;
                        return [4 /*yield*/, this.program.methods
                                .addLiquidityOneSide({
                                amount: finalLoss,
                                activeId: this.lbPair.activeId,
                                maxActiveBinSlippage: 0,
                                binLiquidityDist: [
                                    {
                                        binId: cappedUpperBinId,
                                        weight: 1,
                                    },
                                ],
                            })
                                .accounts({
                                position: positionPda,
                                lbPair: this.pubkey,
                                binArrayBitmapExtension: this.binArrayBitmapExtension
                                    ? this.binArrayBitmapExtension.publicKey
                                    : this.program.programId,
                                userToken: seederTokenX,
                                reserve: this.lbPair.reserveX,
                                tokenMint: this.lbPair.tokenXMint,
                                binArrayLower: lowerBinArray,
                                binArrayUpper: upperBinArray,
                                sender: owner,
                            })
                                .instruction()];
                    case 12:
                        _q.apply(_p, [_r.sent()]);
                        _r.label = 13;
                    case 13:
                        addLiquidityIxs.push(__spreadArray([
                            web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                                units: computeUnit_1.DEFAULT_ADD_LIQUIDITY_CU,
                            })
                        ], instructions, true));
                        _r.label = 14;
                    case 14:
                        i++;
                        return [3 /*break*/, 1];
                    case 15: return [2 /*return*/, {
                            initializeBinArraysAndPositionIxs: initializeBinArraysAndPositionIxs,
                            addLiquidityIxs: addLiquidityIxs,
                        }];
                }
            });
        });
    };
    /**
   * The `seedLiquidity` function create multiple grouped instructions. The grouped instructions will be either [initialize bin array + initialize position instructions] or [deposit instruction] combination.
   * @param
   *    - `payer`: The public key of the tx payer.
   *    - `base`: Base key
   *    - `seedAmount`: Token X lamport amount to be seeded to the pool.
   *    - `price`: TokenX/TokenY Price in UI format
   *    - `roundingUp`: Whether to round up the price
   *    - `positionOwner`: The owner of the position
   *    - `feeOwner`: Position fee owner
   *    - `operator`: Operator of the position. Operator able to manage the position on behalf of the position owner. However, liquidity withdrawal issue by the operator can only send to the position owner.
   *    - `lockReleasePoint`: The lock release point of the position.
   *    - `shouldSeedPositionOwner` (optional): Whether to send 1 lamport amount of token X to the position owner to prove ownership.
   *
   * The returned instructions need to be executed sequentially if it was separated into multiple transactions.
   * @returns {Promise<TransactionInstruction[]>}
   */
    DLMM.prototype.seedLiquiditySingleBin = function (payer_1, base_1, seedAmount_1, price_1, roundingUp_1, positionOwner_1, feeOwner_1, operator_1, lockReleasePoint_1) {
        return __awaiter(this, arguments, void 0, function (payer, base, seedAmount, price, roundingUp, positionOwner, feeOwner, operator, lockReleasePoint, shouldSeedPositionOwner) {
            var pricePerLamport, binIdNumber, binId, lowerBinArrayIndex, upperBinArrayIndex, lowerBinArray, upperBinArray, positionPda, preInstructions, _a, _b, userTokenX, createPayerTokenXIx, _c, userTokenY, createPayerTokenYIx, binArrayBitmapExtension, accounts, bitmapExtensionAccount, _d, _e, operatorTokenX, positionOwnerTokenX, positionOwnerTokenXAccount, account, transferIx, createPositionOwnerTokenXIx, transferIx, lowerBinArrayAccount, upperBinArrayAccount, positionAccount, _f, _g, _h, _j, _k, _l, binLiquidityDist, addLiquidityParams, depositLiquidityIx;
            if (shouldSeedPositionOwner === void 0) { shouldSeedPositionOwner = false; }
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        pricePerLamport = DLMM.getPricePerLamport(this.tokenX.decimal, this.tokenY.decimal, price);
                        binIdNumber = DLMM.getBinIdFromPrice(pricePerLamport, this.lbPair.binStep, !roundingUp);
                        binId = new anchor_1.BN(binIdNumber);
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(binId);
                        upperBinArrayIndex = lowerBinArrayIndex.add(new anchor_1.BN(1));
                        lowerBinArray = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        upperBinArray = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        positionPda = (0, helpers_1.derivePosition)(this.pubkey, base, binId, new anchor_1.BN(1), this.program.programId)[0];
                        preInstructions = [];
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, operator, payer),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, operator, payer),
                            ])];
                    case 1:
                        _a = _m.sent(), _b = _a[0], userTokenX = _b.ataPubKey, createPayerTokenXIx = _b.ix, _c = _a[1], userTokenY = _c.ataPubKey, createPayerTokenYIx = _c.ix;
                        // create userTokenX and userTokenY accounts
                        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
                        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
                        binArrayBitmapExtension = (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0];
                        return [4 /*yield*/, this.program.provider.connection.getMultipleAccountsInfo([
                                lowerBinArray,
                                upperBinArray,
                                positionPda,
                                binArrayBitmapExtension,
                            ])];
                    case 2:
                        accounts = _m.sent();
                        if (!(0, helpers_1.isOverflowDefaultBinArrayBitmap)(lowerBinArrayIndex)) return [3 /*break*/, 5];
                        bitmapExtensionAccount = accounts[3];
                        if (!!bitmapExtensionAccount) return [3 /*break*/, 4];
                        _e = (_d = preInstructions).push;
                        return [4 /*yield*/, this.program.methods.initializeBinArrayBitmapExtension().accounts({
                                binArrayBitmapExtension: binArrayBitmapExtension,
                                funder: payer,
                                lbPair: this.pubkey
                            }).instruction()];
                    case 3:
                        _e.apply(_d, [_m.sent()]);
                        _m.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        binArrayBitmapExtension = this.program.programId;
                        _m.label = 6;
                    case 6:
                        operatorTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, operator, true);
                        positionOwnerTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, positionOwner, true);
                        if (!shouldSeedPositionOwner) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.program.provider.connection.getAccountInfo(positionOwnerTokenX)];
                    case 7:
                        positionOwnerTokenXAccount = _m.sent();
                        if (positionOwnerTokenXAccount) {
                            account = spl_token_1.AccountLayout.decode(positionOwnerTokenXAccount.data);
                            if (account.amount == BigInt(0)) {
                                transferIx = (0, spl_token_1.createTransferInstruction)(operatorTokenX, positionOwnerTokenX, payer, 1);
                                preInstructions.push(transferIx);
                            }
                        }
                        else {
                            createPositionOwnerTokenXIx = (0, spl_token_1.createAssociatedTokenAccountInstruction)(payer, positionOwnerTokenX, positionOwner, this.lbPair.tokenXMint);
                            preInstructions.push(createPositionOwnerTokenXIx);
                            transferIx = (0, spl_token_1.createTransferInstruction)(operatorTokenX, positionOwnerTokenX, payer, 1);
                            preInstructions.push(transferIx);
                        }
                        _m.label = 8;
                    case 8:
                        lowerBinArrayAccount = accounts[0];
                        upperBinArrayAccount = accounts[1];
                        positionAccount = accounts[2];
                        if (!!lowerBinArrayAccount) return [3 /*break*/, 10];
                        _g = (_f = preInstructions).push;
                        return [4 /*yield*/, this.program.methods
                                .initializeBinArray(lowerBinArrayIndex)
                                .accounts({
                                binArray: lowerBinArray,
                                funder: payer,
                                lbPair: this.pubkey,
                            })
                                .instruction()];
                    case 9:
                        _g.apply(_f, [_m.sent()]);
                        _m.label = 10;
                    case 10:
                        if (!!upperBinArrayAccount) return [3 /*break*/, 12];
                        _j = (_h = preInstructions).push;
                        return [4 /*yield*/, this.program.methods
                                .initializeBinArray(upperBinArrayIndex)
                                .accounts({
                                binArray: upperBinArray,
                                funder: payer,
                                lbPair: this.pubkey,
                            })
                                .instruction()];
                    case 11:
                        _j.apply(_h, [_m.sent()]);
                        _m.label = 12;
                    case 12:
                        if (!!positionAccount) return [3 /*break*/, 14];
                        _l = (_k = preInstructions).push;
                        return [4 /*yield*/, this.program.methods
                                .initializePositionByOperator(binId.toNumber(), 1, feeOwner, lockReleasePoint)
                                .accounts({
                                payer: payer,
                                base: base,
                                position: positionPda,
                                lbPair: this.pubkey,
                                owner: positionOwner,
                                operator: operator,
                                operatorTokenX: operatorTokenX,
                                ownerTokenX: positionOwnerTokenX,
                            })
                                .instruction()];
                    case 13:
                        _l.apply(_k, [_m.sent()]);
                        _m.label = 14;
                    case 14:
                        binLiquidityDist = {
                            binId: binIdNumber,
                            distributionX: constants_1.BASIS_POINT_MAX,
                            distributionY: 0,
                        };
                        addLiquidityParams = {
                            amountX: seedAmount,
                            amountY: new anchor_1.BN(0),
                            binLiquidityDist: [binLiquidityDist],
                        };
                        return [4 /*yield*/, this.program.methods.addLiquidity(addLiquidityParams).accounts({
                                position: positionPda,
                                lbPair: this.pubkey,
                                binArrayBitmapExtension: binArrayBitmapExtension,
                                userTokenX: userTokenX,
                                userTokenY: userTokenY,
                                reserveX: this.lbPair.reserveX,
                                reserveY: this.lbPair.reserveY,
                                tokenXMint: this.lbPair.tokenXMint,
                                tokenYMint: this.lbPair.tokenYMint,
                                binArrayLower: lowerBinArray,
                                binArrayUpper: upperBinArray,
                                sender: operator,
                                tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            }).instruction()];
                    case 15:
                        depositLiquidityIx = _m.sent();
                        return [2 /*return*/, __spreadArray(__spreadArray([], preInstructions, true), [depositLiquidityIx], false)];
                }
            });
        });
    };
    /**
     * Initializes bin arrays for the given bin array indexes if it wasn't initialized.
     *
     * @param {BN[]} binArrayIndexes - An array of bin array indexes to initialize.
     * @param {PublicKey} funder - The public key of the funder.
     * @return {Promise<TransactionInstruction[]>} An array of transaction instructions to initialize the bin arrays.
     */
    DLMM.prototype.initializeBinArrays = function (binArrayIndexes, funder) {
        return __awaiter(this, void 0, void 0, function () {
            var ixs, _i, binArrayIndexes_1, idx, binArray, binArrayAccount, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        ixs = [];
                        _i = 0, binArrayIndexes_1 = binArrayIndexes;
                        _c.label = 1;
                    case 1:
                        if (!(_i < binArrayIndexes_1.length)) return [3 /*break*/, 5];
                        idx = binArrayIndexes_1[_i];
                        binArray = (0, helpers_1.deriveBinArray)(this.pubkey, idx, this.program.programId)[0];
                        return [4 /*yield*/, this.program.provider.connection.getAccountInfo(binArray)];
                    case 2:
                        binArrayAccount = _c.sent();
                        if (!(binArrayAccount === null)) return [3 /*break*/, 4];
                        _b = (_a = ixs).push;
                        return [4 /*yield*/, this.program.methods
                                .initializeBinArray(idx)
                                .accounts({
                                binArray: binArray,
                                funder: funder,
                                lbPair: this.pubkey,
                            })
                                .instruction()];
                    case 3:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, ixs];
                }
            });
        });
    };
    /**
     *
     * @param
     *    - `lowerBinId`: Lower bin ID of the position. This represent the lowest price of the position
     *    - `positionWidth`: Width of the position. This will decide the upper bin id of the position, which represents the highest price of the position. UpperBinId = lowerBinId + positionWidth
     *    - `owner`: Owner of the position.
     *    - `operator`: Operator of the position. Operator able to manage the position on behalf of the position owner. However, liquidity withdrawal issue by the operator can only send to the position owner.
     *    - `base`: Base key
     *    - `feeOwner`: Owner of the fees earned by the position.
     *    - `payer`: Payer for the position account rental.
     *    - `lockReleasePoint`: The lock release point of the position.
     * @returns
     */
    DLMM.prototype.initializePositionByOperator = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var _c, positionPda, _bump, operatorTokenX, ownerTokenX, initializePositionByOperatorTx, _d, blockhash, lastValidBlockHeight;
            var lowerBinId = _b.lowerBinId, positionWidth = _b.positionWidth, owner = _b.owner, feeOwner = _b.feeOwner, base = _b.base, operator = _b.operator, payer = _b.payer, lockReleasePoint = _b.lockReleasePoint;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _c = (0, helpers_1.derivePosition)(this.pubkey, base, lowerBinId, positionWidth, this.program.programId), positionPda = _c[0], _bump = _c[1];
                        operatorTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, operator, true);
                        ownerTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, owner, true);
                        return [4 /*yield*/, this.program.methods
                                .initializePositionByOperator(lowerBinId.toNumber(), constants_1.MAX_BIN_PER_POSITION.toNumber(), feeOwner, lockReleasePoint)
                                .accounts({
                                lbPair: this.pubkey,
                                position: positionPda,
                                base: base,
                                operator: operator,
                                owner: owner,
                                ownerTokenX: ownerTokenX,
                                operatorTokenX: operatorTokenX,
                                payer: payer,
                            })
                                .transaction()];
                    case 1:
                        initializePositionByOperatorTx = _e.sent();
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 2:
                        _d = _e.sent(), blockhash = _d.blockhash, lastValidBlockHeight = _d.lastValidBlockHeight;
                        return [2 /*return*/, new web3_js_1.Transaction({
                                feePayer: operator,
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                            }).add(initializePositionByOperatorTx)];
                }
            });
        });
    };
    /**
     * The `claimAllRewards` function to claim swap fees and LM rewards for multiple positions owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the positions.
     *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim swap fees and LM rewards from.
     * @returns {Promise<Transaction[]>}
     */
    DLMM.prototype.claimAllRewards = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var preInstructions, pairsToken, tokensInvolved, _loop_2, this_2, i, feeOwners, createATAAccAndIx, claimAllSwapFeeTxs, claimAllLMTxs, chunkedClaimAllTx, postInstructions, closeWrappedSOLIx, _c, blockhash, lastValidBlockHeight;
            var _this = this;
            var owner = _b.owner, positions = _b.positions;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        preInstructions = [];
                        pairsToken = [this.tokenX.publicKey, this.tokenY.publicKey];
                        tokensInvolved = __spreadArray([], pairsToken, true);
                        _loop_2 = function (i) {
                            var rewardMint = this_2.lbPair.rewardInfos[i].mint;
                            if (!tokensInvolved.some(function (pubkey) { return rewardMint.equals(pubkey); }) &&
                                !rewardMint.equals(web3_js_1.PublicKey.default)) {
                                tokensInvolved.push(this_2.lbPair.rewardInfos[i].mint);
                            }
                        };
                        this_2 = this;
                        for (i = 0; i < 2; i++) {
                            _loop_2(i);
                        }
                        // Filter only position with fees and/or rewards
                        positions = positions.filter(function (_a) {
                            var _b = _a.positionData, feeX = _b.feeX, feeY = _b.feeY, rewardOne = _b.rewardOne, rewardTwo = _b.rewardTwo;
                            return !feeX.isZero() ||
                                !feeY.isZero() ||
                                !rewardOne.isZero() ||
                                !rewardTwo.isZero();
                        });
                        feeOwners = __spreadArray([], new Set(__spreadArray([
                            owner.toBase58()
                        ], positions
                            .filter(function (p) { return !p.positionData.feeOwner.equals(web3_js_1.PublicKey.default); })
                            .map(function (p) { return p.positionData.feeOwner.toBase58(); }), true)), true).map(function (pk) { return new web3_js_1.PublicKey(pk); });
                        return [4 /*yield*/, Promise.all(tokensInvolved
                                .map(function (token) {
                                // There's multiple positions, therefore swap fee ATA might includes account from owner, and customized fee owners
                                if (pairsToken.some(function (p) { return p.equals(token); })) {
                                    return feeOwners.map(function (customOwner) {
                                        return (0, helpers_1.getOrCreateATAInstruction)(_this.program.provider.connection, token, customOwner, owner);
                                    });
                                }
                                //
                                return [
                                    (0, helpers_1.getOrCreateATAInstruction)(_this.program.provider.connection, token, owner),
                                ];
                            })
                                .flat())];
                    case 1:
                        createATAAccAndIx = _d.sent();
                        createATAAccAndIx.forEach(function (_a) {
                            var ix = _a.ix;
                            return ix && preInstructions.push(ix);
                        });
                        return [4 /*yield*/, Promise.all(positions
                                .filter(function (_a) {
                                var _b = _a.positionData, feeX = _b.feeX, feeY = _b.feeY;
                                return !feeX.isZero() || !feeY.isZero();
                            })
                                .map(function (position) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.createClaimSwapFeeMethod({
                                                owner: owner,
                                                position: position,
                                                shouldIncludePretIx: false,
                                                shouldIncludePostIx: false,
                                            })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 2:
                        claimAllSwapFeeTxs = (_d.sent()).flat();
                        return [4 /*yield*/, Promise.all(positions
                                .filter(function (_a) {
                                var _b = _a.positionData, rewardOne = _b.rewardOne, rewardTwo = _b.rewardTwo;
                                return !rewardOne.isZero() || !rewardTwo.isZero();
                            })
                                .map(function (position) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.createClaimBuildMethod({
                                                owner: owner,
                                                position: position,
                                                shouldIncludePreIx: false,
                                            })];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 3:
                        claimAllLMTxs = (_d.sent()).flat();
                        chunkedClaimAllTx = (0, helpers_1.chunks)(__spreadArray(__spreadArray([], claimAllSwapFeeTxs, true), claimAllLMTxs, true), constants_1.MAX_CLAIM_ALL_ALLOWED);
                        postInstructions = [];
                        if (!tokensInvolved.some(function (pubkey) { return pubkey.equals(spl_token_1.NATIVE_MINT); })) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(owner)];
                    case 4:
                        closeWrappedSOLIx = _d.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _d.label = 5;
                    case 5: return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 6:
                        _c = _d.sent(), blockhash = _c.blockhash, lastValidBlockHeight = _c.lastValidBlockHeight;
                        return [2 /*return*/, Promise.all(chunkedClaimAllTx.map(function (claimAllTx) { return __awaiter(_this, void 0, void 0, function () {
                                var mainIxs, instructions, setCUIx, tx;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            mainIxs = claimAllTx.map(function (t) { return t.instructions; }).flat();
                                            instructions = __spreadArray(__spreadArray(__spreadArray([], preInstructions, true), mainIxs, true), postInstructions, true);
                                            return [4 /*yield*/, (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, owner)];
                                        case 1:
                                            setCUIx = _a.sent();
                                            tx = new web3_js_1.Transaction({
                                                feePayer: owner,
                                                blockhash: blockhash,
                                                lastValidBlockHeight: lastValidBlockHeight,
                                            }).add(setCUIx);
                                            if (preInstructions.length)
                                                tx.add.apply(tx, preInstructions);
                                            tx.add.apply(tx, claimAllTx);
                                            if (postInstructions.length)
                                                tx.add.apply(tx, postInstructions);
                                            return [2 /*return*/, tx];
                                    }
                                });
                            }); }))];
                }
            });
        });
    };
    DLMM.prototype.canSyncWithMarketPrice = function (marketPrice, activeBinId) {
        var _a, _b;
        var marketPriceBinId = this.getBinIdFromPrice(Number(DLMM.getPricePerLamport(this.tokenX.decimal, this.tokenY.decimal, marketPrice)), false);
        var marketPriceBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(marketPriceBinId));
        var swapForY = marketPriceBinId < activeBinId;
        var toBinArrayIndex = (0, helpers_1.findNextBinArrayIndexWithLiquidity)(swapForY, new anchor_1.BN(activeBinId), this.lbPair, (_b = (_a = this.binArrayBitmapExtension) === null || _a === void 0 ? void 0 : _a.account) !== null && _b !== void 0 ? _b : null);
        if (toBinArrayIndex === null)
            return true;
        return swapForY
            ? marketPriceBinArrayIndex.gt(toBinArrayIndex)
            : marketPriceBinArrayIndex.lt(toBinArrayIndex);
    };
    /**
     * The `syncWithMarketPrice` function is used to sync the liquidity pool with the market price.
     * @param
     *    - `marketPrice`: The market price to sync with.
     *    - `owner`: The public key of the owner of the liquidity pool.
     * @returns {Promise<Transaction>}
     */
    DLMM.prototype.syncWithMarketPrice = function (marketPrice, owner) {
        return __awaiter(this, void 0, void 0, function () {
            var marketPriceBinId, activeBin, activeBinId, fromBinArrayIndex, swapForY, toBinArrayIndex, accountsToFetch, binArrayBitMapExtensionPubkey, fromBinArrayPubkey, toBinArrayPubkey, binArrayAccounts, fromBinArray, toBinArray, binArrayBitmapExtension, _a, blockhash, lastValidBlockHeight, syncWithMarketPriceTx;
            var _this = this;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        marketPriceBinId = this.getBinIdFromPrice(Number(DLMM.getPricePerLamport(this.tokenX.decimal, this.tokenY.decimal, marketPrice)), false);
                        return [4 /*yield*/, this.getActiveBin()];
                    case 1:
                        activeBin = _d.sent();
                        activeBinId = activeBin.binId;
                        if (!this.canSyncWithMarketPrice(marketPrice, activeBinId)) {
                            throw new Error("Unable to sync with market price due to bin with liquidity between current and market price bin");
                        }
                        fromBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(activeBinId));
                        swapForY = marketPriceBinId < activeBinId;
                        toBinArrayIndex = (0, helpers_1.findNextBinArrayIndexWithLiquidity)(swapForY, new anchor_1.BN(activeBinId), this.lbPair, (_c = (_b = this.binArrayBitmapExtension) === null || _b === void 0 ? void 0 : _b.account) !== null && _c !== void 0 ? _c : null);
                        accountsToFetch = [];
                        binArrayBitMapExtensionPubkey = (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0];
                        accountsToFetch.push(binArrayBitMapExtensionPubkey);
                        fromBinArrayPubkey = (0, helpers_1.deriveBinArray)(this.pubkey, fromBinArrayIndex, this.program.programId)[0];
                        accountsToFetch.push(fromBinArrayPubkey);
                        toBinArrayPubkey = (function () {
                            if (!toBinArrayIndex)
                                return null;
                            var toBinArrayPubkey = (0, helpers_1.deriveBinArray)(_this.pubkey, toBinArrayIndex, _this.program.programId)[0];
                            accountsToFetch.push(toBinArrayPubkey);
                            return toBinArrayPubkey;
                        })();
                        return [4 /*yield*/, this.program.provider.connection.getMultipleAccountsInfo(accountsToFetch)];
                    case 2:
                        binArrayAccounts = _d.sent();
                        fromBinArray = null;
                        toBinArray = null;
                        binArrayBitmapExtension = null;
                        if (!!(binArrayAccounts === null || binArrayAccounts === void 0 ? void 0 : binArrayAccounts[0])) {
                            binArrayBitmapExtension = binArrayBitMapExtensionPubkey;
                        }
                        if (!!(binArrayAccounts === null || binArrayAccounts === void 0 ? void 0 : binArrayAccounts[1])) {
                            fromBinArray = fromBinArrayPubkey;
                        }
                        if (!!(binArrayAccounts === null || binArrayAccounts === void 0 ? void 0 : binArrayAccounts[2]) && !!toBinArrayIndex) {
                            toBinArray = toBinArrayPubkey;
                        }
                        return [4 /*yield*/, this.program.provider.connection.getLatestBlockhash("confirmed")];
                    case 3:
                        _a = _d.sent(), blockhash = _a.blockhash, lastValidBlockHeight = _a.lastValidBlockHeight;
                        return [4 /*yield*/, this.program.methods
                                .goToABin(marketPriceBinId)
                                .accounts({
                                lbPair: this.pubkey,
                                binArrayBitmapExtension: binArrayBitmapExtension,
                                fromBinArray: fromBinArray,
                                toBinArray: toBinArray,
                            })
                                .transaction()];
                    case 4:
                        syncWithMarketPriceTx = _d.sent();
                        return [2 /*return*/, new web3_js_1.Transaction({
                                feePayer: owner,
                                blockhash: blockhash,
                                lastValidBlockHeight: lastValidBlockHeight,
                            }).add(syncWithMarketPriceTx)];
                }
            });
        });
    };
    DLMM.prototype.getMaxPriceInBinArrays = function (binArrayAccounts) {
        return __awaiter(this, void 0, void 0, function () {
            var sortedBinArrays, count, binPriceWithLastLiquidity, binArray, bins, lastBinWithLiquidityIndex, i;
            return __generator(this, function (_a) {
                sortedBinArrays = __spreadArray([], binArrayAccounts, true).sort(function (_a, _b) {
                    var indexA = _a.account.index;
                    var indexB = _b.account.index;
                    return indexA.toNumber() - indexB.toNumber();
                });
                count = sortedBinArrays.length - 1;
                while (count >= 0) {
                    binArray = sortedBinArrays[count];
                    if (binArray) {
                        bins = binArray.account.bins;
                        if (bins.every(function (_a) {
                            var amountX = _a.amountX;
                            return amountX.isZero();
                        })) {
                            count--;
                        }
                        else {
                            lastBinWithLiquidityIndex = -1;
                            for (i = bins.length - 1; i >= 0; i--) {
                                if (bins[i].liquiditySupply.toNumber() > 0) {
                                    lastBinWithLiquidityIndex = i;
                                    break;
                                }
                            }
                            binPriceWithLastLiquidity =
                                bins[lastBinWithLiquidityIndex].price.toString();
                            count = -1;
                        }
                    }
                }
                return [2 /*return*/, this.fromPricePerLamport(Number(binPriceWithLastLiquidity) / (Math.pow(2, 64) - 1))];
            });
        });
    };
    DLMM.prototype.getAmountOutWithdrawSingleSide = function (maxLiquidityShare, price, bin, isWithdrawForY) {
        var amountX = (0, math_1.mulDiv)(maxLiquidityShare, bin.amountX, bin.liquiditySupply, math_1.Rounding.Down);
        var amountY = (0, math_1.mulDiv)(maxLiquidityShare, bin.amountY, bin.liquiditySupply, math_1.Rounding.Down);
        var amount0 = isWithdrawForY ? amountX : amountY;
        var amount1 = isWithdrawForY ? amountY : amountX;
        var remainAmountX = bin.amountX.sub(amountX);
        var remainAmountY = bin.amountY.sub(amountY);
        if (amount0.eq(new anchor_1.BN(0))) {
            return {
                withdrawAmount: amount1,
            };
        }
        var maxAmountOut = isWithdrawForY ? remainAmountY : remainAmountX;
        var maxAmountIn = isWithdrawForY
            ? (0, math_1.shlDiv)(remainAmountY, price, constants_1.SCALE_OFFSET, math_1.Rounding.Up)
            : (0, math_1.mulShr)(remainAmountX, price, constants_1.SCALE_OFFSET, math_1.Rounding.Up);
        var maxFee = (0, helpers_1.computeFee)(this.lbPair.binStep, this.lbPair.parameters, this.lbPair.vParameters, maxAmountIn);
        maxAmountIn = maxAmountIn.add(maxFee);
        if (amount0.gt(maxAmountIn)) {
            return {
                withdrawAmount: amount1.add(maxAmountOut),
            };
        }
        var fee = (0, helpers_1.computeFeeFromAmount)(this.lbPair.binStep, this.lbPair.parameters, this.lbPair.vParameters, amount0);
        var amount0AfterFee = amount0.sub(fee);
        var amountOut = isWithdrawForY
            ? (0, math_1.mulShr)(price, amount0AfterFee, constants_1.SCALE_OFFSET, math_1.Rounding.Down)
            : (0, math_1.shlDiv)(amount0AfterFee, price, constants_1.SCALE_OFFSET, math_1.Rounding.Down);
        return {
            withdrawAmount: amount1.add(amountOut),
        };
    };
    DLMM.prototype.getWithdrawSingleSideAmount = function (positionPubkey, isWithdrawForY) {
        return __awaiter(this, void 0, void 0, function () {
            var totalWithdrawAmount, lowerBinArray, upperBinArray, position, lowerBinArrayIdx, lowerBinArrayPubKey, upperBinArrayIdx, upperBinArrayPubKey, idx, shareToRemove, binId, binArrayIndex, binArray, bin, price, withdrawAmount;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        totalWithdrawAmount = new anchor_1.BN(0);
                        return [4 /*yield*/, this.program.account.positionV2.fetch(positionPubkey)];
                    case 1:
                        position = _b.sent();
                        lowerBinArrayIdx = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(position.lowerBinId));
                        lowerBinArrayPubKey = (0, helpers_1.deriveBinArray)(position.lbPair, lowerBinArrayIdx, this.program.programId)[0];
                        upperBinArrayIdx = lowerBinArrayIdx.add(new anchor_1.BN(1));
                        upperBinArrayPubKey = (0, helpers_1.deriveBinArray)(position.lbPair, upperBinArrayIdx, this.program.programId)[0];
                        return [4 /*yield*/, this.program.account.binArray.fetchMultiple([
                                lowerBinArrayPubKey,
                                upperBinArrayPubKey,
                            ])];
                    case 2:
                        _a = _b.sent(), lowerBinArray = _a[0], upperBinArray = _a[1];
                        for (idx = 0; idx < position.liquidityShares.length; idx++) {
                            shareToRemove = position.liquidityShares[idx];
                            if (shareToRemove.eq(new anchor_1.BN(0))) {
                                continue;
                            }
                            binId = new anchor_1.BN(position.lowerBinId).add(new anchor_1.BN(idx));
                            binArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(binId);
                            binArray = binArrayIndex.eq(lowerBinArrayIdx)
                                ? lowerBinArray
                                : upperBinArray;
                            if (!binArray) {
                                throw new Error("BinArray not found");
                            }
                            bin = (0, helpers_1.getBinFromBinArray)(binId.toNumber(), binArray);
                            if (isWithdrawForY) {
                                if (binId.gt(new anchor_1.BN(this.lbPair.activeId))) {
                                    break;
                                }
                            }
                            else {
                                if (binId.lt(new anchor_1.BN(this.lbPair.activeId))) {
                                    continue;
                                }
                            }
                            price = (0, math_1.getQPriceFromId)(binId, new anchor_1.BN(this.lbPair.binStep));
                            withdrawAmount = this.getAmountOutWithdrawSingleSide(shareToRemove, price, bin, isWithdrawForY).withdrawAmount;
                            totalWithdrawAmount = totalWithdrawAmount.add(withdrawAmount);
                        }
                        return [2 /*return*/, totalWithdrawAmount];
                }
            });
        });
    };
    /**
     *
     * @param swapInitiator Address of the swap initiator
     * @returns
     */
    DLMM.prototype.isSwapDisabled = function (swapInitiator) {
        if (this.lbPair.status == types_1.PairStatus.Disabled) {
            return true;
        }
        if (this.lbPair.pairType == types_1.PairType.Permissioned) {
            var currentPoint = this.lbPair.activationType == types_1.ActivationType.Slot
                ? this.clock.slot
                : this.clock.unixTimestamp;
            var preActivationSwapPoint = this.lbPair.activationPoint.sub(this.lbPair.preActivationDuration);
            var activationPoint = !this.lbPair.preActivationSwapAddress.equals(web3_js_1.PublicKey.default) &&
                this.lbPair.preActivationSwapAddress.equals(swapInitiator)
                ? preActivationSwapPoint
                : this.lbPair.activationPoint;
            if (currentPoint < activationPoint) {
                return true;
            }
        }
        return false;
    };
    /** Private static method */
    DLMM.getBinArrays = function (program, lbPairPubkey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, program.account.binArray.all([
                        {
                            memcmp: {
                                bytes: bytes_1.bs58.encode(lbPairPubkey.toBuffer()),
                                offset: 8 + 16,
                            },
                        },
                    ])];
            });
        });
    };
    DLMM.getClaimableLMReward = function (program, positionVersion, lbPair, onChainTimestamp, position, lowerBinArray, upperBinArray) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerBinArrayIdx, rewards, _lowerBinArray, _upperBinArray, lowerBinArrayIdx_1, lowerBinArray_1, upperBinArrayIdx, upperBinArray_1, i, binArrayIdx, binArray, binState, binIdxInPosition, positionRewardInfo, liquidityShare, j, pairRewardInfo, rewardPerTokenStored, currentTime, delta_1, liquiditySupply, rewardPerTokenStoredDelta, delta, newReward;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        lowerBinArrayIdx = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(position.lowerBinId));
                        rewards = [new anchor_1.BN(0), new anchor_1.BN(0)];
                        _lowerBinArray = lowerBinArray;
                        _upperBinArray = upperBinArray;
                        if (!(!lowerBinArray || !upperBinArray)) return [3 /*break*/, 2];
                        lowerBinArrayIdx_1 = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(position.lowerBinId));
                        lowerBinArray_1 = (0, helpers_1.deriveBinArray)(position.lbPair, lowerBinArrayIdx_1, program.programId)[0];
                        upperBinArrayIdx = lowerBinArrayIdx_1.add(new anchor_1.BN(1));
                        upperBinArray_1 = (0, helpers_1.deriveBinArray)(position.lbPair, upperBinArrayIdx, program.programId)[0];
                        return [4 /*yield*/, program.account.binArray.fetchMultiple([
                                lowerBinArray_1,
                                upperBinArray_1,
                            ])];
                    case 1:
                        _a = _b.sent(), _lowerBinArray = _a[0], _upperBinArray = _a[1];
                        _b.label = 2;
                    case 2:
                        if (!_lowerBinArray || !_upperBinArray)
                            throw new Error("BinArray not found");
                        for (i = position.lowerBinId; i <= position.upperBinId; i++) {
                            binArrayIdx = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(i));
                            binArray = binArrayIdx.eq(lowerBinArrayIdx)
                                ? _lowerBinArray
                                : _upperBinArray;
                            binState = (0, helpers_1.getBinFromBinArray)(i, binArray);
                            binIdxInPosition = i - position.lowerBinId;
                            positionRewardInfo = position.rewardInfos[binIdxInPosition];
                            liquidityShare = positionVersion === types_1.PositionVersion.V1
                                ? position.liquidityShares[binIdxInPosition]
                                : position.liquidityShares[binIdxInPosition].shrn(64);
                            for (j = 0; j < 2; j++) {
                                pairRewardInfo = lbPair.rewardInfos[j];
                                if (!pairRewardInfo.mint.equals(web3_js_1.PublicKey.default)) {
                                    rewardPerTokenStored = binState.rewardPerTokenStored[j];
                                    if (i == lbPair.activeId && !binState.liquiditySupply.isZero()) {
                                        currentTime = new anchor_1.BN(Math.min(onChainTimestamp, pairRewardInfo.rewardDurationEnd.toNumber()));
                                        delta_1 = currentTime.sub(pairRewardInfo.lastUpdateTime);
                                        liquiditySupply = binArray.version == 0
                                            ? binState.liquiditySupply
                                            : binState.liquiditySupply.shrn(64);
                                        rewardPerTokenStoredDelta = pairRewardInfo.rewardRate
                                            .mul(delta_1)
                                            .div(new anchor_1.BN(15))
                                            .div(liquiditySupply);
                                        rewardPerTokenStored = rewardPerTokenStored.add(rewardPerTokenStoredDelta);
                                    }
                                    delta = rewardPerTokenStored.sub(positionRewardInfo.rewardPerTokenCompletes[j]);
                                    newReward = (0, math_1.mulShr)(delta, liquidityShare, constants_1.SCALE_OFFSET, math_1.Rounding.Down);
                                    rewards[j] = rewards[j]
                                        .add(newReward)
                                        .add(positionRewardInfo.rewardPendings[j]);
                                }
                            }
                        }
                        return [2 /*return*/, {
                                rewardOne: rewards[0],
                                rewardTwo: rewards[1],
                            }];
                }
            });
        });
    };
    DLMM.getClaimableSwapFee = function (program, positionVersion, position, lowerBinArray, upperBinArray) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerBinArrayIdx, feeX, feeY, _lowerBinArray, _upperBinArray, lowerBinArrayIdx_2, lowerBinArray_2, upperBinArrayIdx, upperBinArray_2, i, binArrayIdx, binArray, binState, binIdxInPosition, feeInfos, liquidityShare, newFeeX, newFeeY;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        lowerBinArrayIdx = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(position.lowerBinId));
                        feeX = new anchor_1.BN(0);
                        feeY = new anchor_1.BN(0);
                        _lowerBinArray = lowerBinArray;
                        _upperBinArray = upperBinArray;
                        if (!(!lowerBinArray || !upperBinArray)) return [3 /*break*/, 2];
                        lowerBinArrayIdx_2 = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(position.lowerBinId));
                        lowerBinArray_2 = (0, helpers_1.deriveBinArray)(position.lbPair, lowerBinArrayIdx_2, program.programId)[0];
                        upperBinArrayIdx = lowerBinArrayIdx_2.add(new anchor_1.BN(1));
                        upperBinArray_2 = (0, helpers_1.deriveBinArray)(position.lbPair, upperBinArrayIdx, program.programId)[0];
                        return [4 /*yield*/, program.account.binArray.fetchMultiple([
                                lowerBinArray_2,
                                upperBinArray_2,
                            ])];
                    case 1:
                        _a = _b.sent(), _lowerBinArray = _a[0], _upperBinArray = _a[1];
                        _b.label = 2;
                    case 2:
                        if (!_lowerBinArray || !_upperBinArray)
                            throw new Error("BinArray not found");
                        for (i = position.lowerBinId; i <= position.upperBinId; i++) {
                            binArrayIdx = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(i));
                            binArray = binArrayIdx.eq(lowerBinArrayIdx)
                                ? _lowerBinArray
                                : _upperBinArray;
                            binState = (0, helpers_1.getBinFromBinArray)(i, binArray);
                            binIdxInPosition = i - position.lowerBinId;
                            feeInfos = position.feeInfos[binIdxInPosition];
                            liquidityShare = positionVersion === types_1.PositionVersion.V1
                                ? position.liquidityShares[binIdxInPosition]
                                : position.liquidityShares[binIdxInPosition].shrn(64);
                            newFeeX = (0, math_1.mulShr)(liquidityShare, binState.feeAmountXPerTokenStored.sub(feeInfos.feeXPerTokenComplete), constants_1.SCALE_OFFSET, math_1.Rounding.Down);
                            newFeeY = (0, math_1.mulShr)(liquidityShare, binState.feeAmountYPerTokenStored.sub(feeInfos.feeYPerTokenComplete), constants_1.SCALE_OFFSET, math_1.Rounding.Down);
                            feeX = feeX.add(newFeeX).add(feeInfos.feeXPending);
                            feeY = feeY.add(newFeeY).add(feeInfos.feeYPending);
                        }
                        return [2 /*return*/, { feeX: feeX, feeY: feeY }];
                }
            });
        });
    };
    DLMM.processPosition = function (program, version, lbPair, onChainTimestamp, position, baseTokenDecimal, quoteTokenDecimal, lowerBinArray, upperBinArray, feeOwner) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerBinId, upperBinId, posShares, lastUpdatedAt, totalClaimedFeeXAmount, totalClaimedFeeYAmount, bins, positionData, totalXAmount, totalYAmount, _a, feeX, feeY, _b, rewardOne, rewardTwo;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        lowerBinId = position.lowerBinId, upperBinId = position.upperBinId, posShares = position.liquidityShares, lastUpdatedAt = position.lastUpdatedAt, totalClaimedFeeXAmount = position.totalClaimedFeeXAmount, totalClaimedFeeYAmount = position.totalClaimedFeeYAmount;
                        bins = this.getBinsBetweenLowerAndUpperBound(lbPair, lowerBinId, upperBinId, baseTokenDecimal, quoteTokenDecimal, lowerBinArray, upperBinArray);
                        if (!bins.length)
                            return [2 /*return*/, null];
                        /// assertion
                        if (bins[0].binId !== lowerBinId ||
                            bins[bins.length - 1].binId !== upperBinId)
                            throw new Error("Bin ID mismatch");
                        positionData = [];
                        totalXAmount = new decimal_js_1.default(0);
                        totalYAmount = new decimal_js_1.default(0);
                        bins.forEach(function (bin, idx) {
                            var binSupply = new decimal_js_1.default(bin.supply.toString());
                            var posShare = new decimal_js_1.default(posShares[idx].toString());
                            var positionXAmount = binSupply.eq(new decimal_js_1.default("0"))
                                ? new decimal_js_1.default("0")
                                : posShare.mul(bin.xAmount.toString()).div(binSupply);
                            var positionYAmount = binSupply.eq(new decimal_js_1.default("0"))
                                ? new decimal_js_1.default("0")
                                : posShare.mul(bin.yAmount.toString()).div(binSupply);
                            totalXAmount = totalXAmount.add(positionXAmount);
                            totalYAmount = totalYAmount.add(positionYAmount);
                            positionData.push({
                                binId: bin.binId,
                                price: bin.price,
                                pricePerToken: bin.pricePerToken,
                                binXAmount: bin.xAmount.toString(),
                                binYAmount: bin.yAmount.toString(),
                                binLiquidity: binSupply.toString(),
                                positionLiquidity: posShare.toString(),
                                positionXAmount: positionXAmount.toString(),
                                positionYAmount: positionYAmount.toString(),
                            });
                        });
                        return [4 /*yield*/, this.getClaimableSwapFee(program, version, position, lowerBinArray, upperBinArray)];
                    case 1:
                        _a = _c.sent(), feeX = _a.feeX, feeY = _a.feeY;
                        return [4 /*yield*/, this.getClaimableLMReward(program, version, lbPair, onChainTimestamp, position, lowerBinArray, upperBinArray)];
                    case 2:
                        _b = _c.sent(), rewardOne = _b.rewardOne, rewardTwo = _b.rewardTwo;
                        return [2 /*return*/, {
                                totalXAmount: totalXAmount.toString(),
                                totalYAmount: totalYAmount.toString(),
                                positionBinData: positionData,
                                lastUpdatedAt: lastUpdatedAt,
                                lowerBinId: lowerBinId,
                                upperBinId: upperBinId,
                                feeX: feeX,
                                feeY: feeY,
                                rewardOne: rewardOne,
                                rewardTwo: rewardTwo,
                                feeOwner: feeOwner,
                                totalClaimedFeeXAmount: totalClaimedFeeXAmount,
                                totalClaimedFeeYAmount: totalClaimedFeeYAmount,
                            }];
                }
            });
        });
    };
    DLMM.getBinsBetweenLowerAndUpperBound = function (lbPair, lowerBinId, upperBinId, baseTokenDecimal, quoteTokenDecimal, lowerBinArrays, upperBinArrays) {
        var lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
        var upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId));
        var bins = [];
        if (lowerBinArrayIndex.eq(upperBinArrayIndex)) {
            var binArray_1 = lowerBinArrays;
            var lowerBinIdForBinArray_1 = (0, helpers_1.getBinArrayLowerUpperBinId)(binArray_1.index)[0];
            binArray_1.bins.forEach(function (bin, idx) {
                var binId = lowerBinIdForBinArray_1.toNumber() + idx;
                if (binId >= lowerBinId && binId <= upperBinId) {
                    var pricePerLamport = (0, helpers_1.getPriceOfBinByBinId)(binId, lbPair.binStep).toString();
                    bins.push({
                        binId: binId,
                        xAmount: bin.amountX,
                        yAmount: bin.amountY,
                        supply: bin.liquiditySupply,
                        price: pricePerLamport,
                        version: binArray_1.version,
                        pricePerToken: new decimal_js_1.default(pricePerLamport)
                            .mul(new decimal_js_1.default(Math.pow(10, (baseTokenDecimal - quoteTokenDecimal))))
                            .toString(),
                    });
                }
            });
        }
        else {
            var binArrays = [lowerBinArrays, upperBinArrays];
            binArrays.forEach(function (binArray) {
                var lowerBinIdForBinArray = (0, helpers_1.getBinArrayLowerUpperBinId)(binArray.index)[0];
                binArray.bins.forEach(function (bin, idx) {
                    var binId = lowerBinIdForBinArray.toNumber() + idx;
                    if (binId >= lowerBinId && binId <= upperBinId) {
                        var pricePerLamport = (0, helpers_1.getPriceOfBinByBinId)(binId, lbPair.binStep).toString();
                        bins.push({
                            binId: binId,
                            xAmount: bin.amountX,
                            yAmount: bin.amountY,
                            supply: bin.liquiditySupply,
                            price: pricePerLamport,
                            version: binArray.version,
                            pricePerToken: new decimal_js_1.default(pricePerLamport)
                                .mul(new decimal_js_1.default(Math.pow(10, (baseTokenDecimal - quoteTokenDecimal))))
                                .toString(),
                        });
                    }
                });
            });
        }
        return bins;
    };
    /** Private method */
    DLMM.prototype.processXYAmountDistribution = function (xYAmountDistribution) {
        var currentBinId = null;
        var xAmountDistribution = [];
        var yAmountDistribution = [];
        var binIds = [];
        xYAmountDistribution.forEach(function (binAndAmount) {
            xAmountDistribution.push(binAndAmount.xAmountBpsOfTotal);
            yAmountDistribution.push(binAndAmount.yAmountBpsOfTotal);
            binIds.push(binAndAmount.binId);
            if (currentBinId && binAndAmount.binId !== currentBinId + 1) {
                throw new Error("Discontinuous Bin ID");
            }
            else {
                currentBinId = binAndAmount.binId;
            }
        });
        return {
            lowerBinId: xYAmountDistribution[0].binId,
            upperBinId: xYAmountDistribution[xYAmountDistribution.length - 1].binId,
            xAmountDistribution: xAmountDistribution,
            yAmountDistribution: yAmountDistribution,
            binIds: binIds,
        };
    };
    DLMM.prototype.getBins = function (lbPairPubKey, lowerBinId, upperBinId, baseTokenDecimal, quoteTokenDecimal, lowerBinArray, upperBinArray) {
        return __awaiter(this, void 0, void 0, function () {
            var lowerBinArrayIndex, upperBinArrayIndex, hasCachedLowerBinArray, hasCachedUpperBinArray, isSingleBinArray, lowerBinArrayIndexOffset, upperBinArrayIndexOffset, binArrayPubkeys, fetchedBinArrays, _a, binArrays, binsById, version;
            var _this = this;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
                        upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId));
                        hasCachedLowerBinArray = lowerBinArray != null;
                        hasCachedUpperBinArray = upperBinArray != null;
                        isSingleBinArray = lowerBinArrayIndex.eq(upperBinArrayIndex);
                        lowerBinArrayIndexOffset = hasCachedLowerBinArray ? 1 : 0;
                        upperBinArrayIndexOffset = hasCachedUpperBinArray ? -1 : 0;
                        binArrayPubkeys = (0, helpers_1.range)(lowerBinArrayIndex.toNumber() + lowerBinArrayIndexOffset, upperBinArrayIndex.toNumber() + upperBinArrayIndexOffset, function (i) { return (0, helpers_1.deriveBinArray)(lbPairPubKey, new anchor_1.BN(i), _this.program.programId)[0]; });
                        if (!(binArrayPubkeys.length !== 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.program.account.binArray.fetchMultiple(binArrayPubkeys)];
                    case 1:
                        _a = _d.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = [];
                        _d.label = 3;
                    case 3:
                        fetchedBinArrays = _a;
                        binArrays = __spreadArray(__spreadArray(__spreadArray([], (hasCachedLowerBinArray ? [lowerBinArray] : []), true), fetchedBinArrays, true), ((hasCachedUpperBinArray && !isSingleBinArray) ? [upperBinArray] : []), true);
                        binsById = new Map(binArrays
                            .filter(function (x) { return x != null; })
                            .flatMap(function (_a) {
                            var bins = _a.bins, index = _a.index;
                            var lowerBinId = (0, helpers_1.getBinArrayLowerUpperBinId)(index)[0];
                            return bins.map(function (b, i) { return [lowerBinId.toNumber() + i, b]; });
                        }));
                        version = (_c = (_b = binArrays.find(function (binArray) { return binArray != null; })) === null || _b === void 0 ? void 0 : _b.version) !== null && _c !== void 0 ? _c : 1;
                        return [2 /*return*/, Array.from((0, helpers_1.enumerateBins)(binsById, lowerBinId, upperBinId, this.lbPair.binStep, baseTokenDecimal, quoteTokenDecimal, version))];
                }
            });
        });
    };
    DLMM.prototype.binArraysToBeCreate = function (lowerBinArrayIndex, upperBinArrayIndex) {
        return __awaiter(this, void 0, void 0, function () {
            var binArrayIndexes, binArrays, _i, binArrayIndexes_2, idx, binArrayPubKey, binArrayAccounts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        binArrayIndexes = Array.from({ length: upperBinArrayIndex.sub(lowerBinArrayIndex).toNumber() + 1 }, function (_, index) { return index + lowerBinArrayIndex.toNumber(); }).map(function (idx) { return new anchor_1.BN(idx); });
                        binArrays = [];
                        for (_i = 0, binArrayIndexes_2 = binArrayIndexes; _i < binArrayIndexes_2.length; _i++) {
                            idx = binArrayIndexes_2[_i];
                            binArrayPubKey = (0, helpers_1.deriveBinArray)(this.pubkey, idx, this.program.programId)[0];
                            binArrays.push(binArrayPubKey);
                        }
                        return [4 /*yield*/, this.program.provider.connection.getMultipleAccountsInfo(binArrays)];
                    case 1:
                        binArrayAccounts = _a.sent();
                        return [2 /*return*/, binArrayAccounts
                                .filter(function (binArray) { return binArray === null; })
                                .map(function (_, index) { return binArrays[index]; })];
                }
            });
        });
    };
    DLMM.prototype.createBinArraysIfNeeded = function (upperBinArrayIndex, lowerBinArrayIndex, funder) {
        return __awaiter(this, void 0, void 0, function () {
            var ixs, binArrayIndexes, _i, binArrayIndexes_3, idx, binArray, binArrayAccount, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        ixs = [];
                        binArrayIndexes = Array.from({ length: upperBinArrayIndex.sub(lowerBinArrayIndex).toNumber() + 1 }, function (_, index) { return index + lowerBinArrayIndex.toNumber(); }).map(function (idx) { return new anchor_1.BN(idx); });
                        _i = 0, binArrayIndexes_3 = binArrayIndexes;
                        _c.label = 1;
                    case 1:
                        if (!(_i < binArrayIndexes_3.length)) return [3 /*break*/, 5];
                        idx = binArrayIndexes_3[_i];
                        binArray = (0, helpers_1.deriveBinArray)(this.pubkey, idx, this.program.programId)[0];
                        return [4 /*yield*/, this.program.provider.connection.getAccountInfo(binArray)];
                    case 2:
                        binArrayAccount = _c.sent();
                        if (!(binArrayAccount === null)) return [3 /*break*/, 4];
                        _b = (_a = ixs).push;
                        return [4 /*yield*/, this.program.methods
                                .initializeBinArray(idx)
                                .accounts({
                                binArray: binArray,
                                funder: funder,
                                lbPair: this.pubkey,
                            })
                                .instruction()];
                    case 3:
                        _b.apply(_a, [_c.sent()]);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, ixs];
                }
            });
        });
    };
    DLMM.prototype.updateVolatilityAccumulator = function (vParameter, sParameter, activeId) {
        var deltaId = Math.abs(vParameter.indexReference - activeId);
        var newVolatilityAccumulator = vParameter.volatilityReference + deltaId * constants_1.BASIS_POINT_MAX;
        vParameter.volatilityAccumulator = Math.min(newVolatilityAccumulator, sParameter.maxVolatilityAccumulator);
    };
    DLMM.prototype.updateReference = function (activeId, vParameter, sParameter, currentTimestamp) {
        var elapsed = currentTimestamp - vParameter.lastUpdateTimestamp.toNumber();
        if (elapsed >= sParameter.filterPeriod) {
            vParameter.indexReference = activeId;
            if (elapsed < sParameter.decayPeriod) {
                var decayedVolatilityReference = Math.floor((vParameter.volatilityAccumulator * sParameter.reductionFactor) /
                    constants_1.BASIS_POINT_MAX);
                vParameter.volatilityReference = decayedVolatilityReference;
            }
            else {
                vParameter.volatilityReference = 0;
            }
        }
    };
    DLMM.prototype.createClaimBuildMethod = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var lowerBinArrayIndex, binArrayLower, upperBinArrayIndex, binArrayUpper, claimTransactions, i, rewardInfo, preInstructions, _c, ataPubKey, ix, claimTransaction;
            var owner = _b.owner, position = _b.position, _d = _b.shouldIncludePreIx, shouldIncludePreIx = _d === void 0 ? true : _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(position.positionData.lowerBinId));
                        binArrayLower = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        upperBinArrayIndex = lowerBinArrayIndex.add(new anchor_1.BN(1));
                        binArrayUpper = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        claimTransactions = [];
                        i = 0;
                        _e.label = 1;
                    case 1:
                        if (!(i < 2)) return [3 /*break*/, 5];
                        rewardInfo = this.lbPair.rewardInfos[i];
                        if (!rewardInfo || rewardInfo.mint.equals(web3_js_1.PublicKey.default))
                            return [3 /*break*/, 4];
                        preInstructions = [];
                        return [4 /*yield*/, (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, rewardInfo.mint, owner)];
                    case 2:
                        _c = _e.sent(), ataPubKey = _c.ataPubKey, ix = _c.ix;
                        ix && preInstructions.push(ix);
                        return [4 /*yield*/, this.program.methods
                                .claimReward(new anchor_1.BN(i))
                                .accounts({
                                lbPair: this.pubkey,
                                sender: owner,
                                position: position.publicKey,
                                binArrayLower: binArrayLower,
                                binArrayUpper: binArrayUpper,
                                rewardVault: rewardInfo.vault,
                                rewardMint: rewardInfo.mint,
                                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                                userTokenAccount: ataPubKey,
                            })
                                .preInstructions(shouldIncludePreIx ? preInstructions : [])
                                .transaction()];
                    case 3:
                        claimTransaction = _e.sent();
                        claimTransactions.push(claimTransaction);
                        _e.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, claimTransactions];
                }
            });
        });
    };
    DLMM.prototype.createClaimSwapFeeMethod = function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var _c, lowerBinId, feeOwner, lowerBinArrayIndex, binArrayLower, upperBinArrayIndex, binArrayUpper, reserveX, reserveY, walletToReceiveFee, preInstructions, _d, _e, userTokenX, createInTokenAccountIx, _f, userTokenY, createOutTokenAccountIx, postInstructions, closeWrappedSOLIx, claimFeeTx;
            var owner = _b.owner, position = _b.position, _g = _b.shouldIncludePretIx, shouldIncludePretIx = _g === void 0 ? true : _g, _h = _b.shouldIncludePostIx, shouldIncludePostIx = _h === void 0 ? true : _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _c = position.positionData, lowerBinId = _c.lowerBinId, feeOwner = _c.feeOwner;
                        lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
                        binArrayLower = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId)[0];
                        upperBinArrayIndex = lowerBinArrayIndex.add(new anchor_1.BN(1));
                        binArrayUpper = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId)[0];
                        reserveX = (0, helpers_1.deriveReserve)(this.tokenX.publicKey, this.pubkey, this.program.programId)[0];
                        reserveY = (0, helpers_1.deriveReserve)(this.tokenY.publicKey, this.pubkey, this.program.programId)[0];
                        walletToReceiveFee = feeOwner.equals(web3_js_1.PublicKey.default)
                            ? owner
                            : feeOwner;
                        preInstructions = [];
                        return [4 /*yield*/, Promise.all([
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, walletToReceiveFee, owner),
                                (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, walletToReceiveFee, owner),
                            ])];
                    case 1:
                        _d = _j.sent(), _e = _d[0], userTokenX = _e.ataPubKey, createInTokenAccountIx = _e.ix, _f = _d[1], userTokenY = _f.ataPubKey, createOutTokenAccountIx = _f.ix;
                        createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
                        createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
                        postInstructions = [];
                        if (![
                            this.tokenX.publicKey.toBase58(),
                            this.tokenY.publicKey.toBase58(),
                        ].includes(spl_token_1.NATIVE_MINT.toBase58())) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, helpers_1.unwrapSOLInstruction)(owner)];
                    case 2:
                        closeWrappedSOLIx = _j.sent();
                        closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
                        _j.label = 3;
                    case 3: return [4 /*yield*/, this.program.methods
                            .claimFee()
                            .accounts({
                            binArrayLower: binArrayLower,
                            binArrayUpper: binArrayUpper,
                            lbPair: this.pubkey,
                            sender: owner,
                            position: position.publicKey,
                            reserveX: reserveX,
                            reserveY: reserveY,
                            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                            tokenXMint: this.tokenX.publicKey,
                            tokenYMint: this.tokenY.publicKey,
                            userTokenX: userTokenX,
                            userTokenY: userTokenY,
                        })
                            .preInstructions(shouldIncludePretIx ? preInstructions : [])
                            .postInstructions(shouldIncludePostIx ? postInstructions : [])
                            .transaction()];
                    case 4:
                        claimFeeTx = _j.sent();
                        return [2 /*return*/, claimFeeTx];
                }
            });
        });
    };
    return DLMM;
}());
exports.DLMM = DLMM;
