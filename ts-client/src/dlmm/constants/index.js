"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ILM_BASE = exports.MAX_ACTIVE_BIN_SLIPPAGE = exports.MAX_BIN_PER_TX = exports.MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX = exports.MAX_CLAIM_ALL_ALLOWED = exports.PRECISION = exports.SIMULATION_USER = exports.EXTENSION_BINARRAY_BITMAP_SIZE = exports.BIN_ARRAY_BITMAP_SIZE = exports.MAX_BIN_PER_POSITION = exports.MAX_BIN_ARRAY_SIZE = exports.POSITION_FEE = exports.BIN_ARRAY_FEE = exports.MAX_FEE_RATE = exports.FEE_PRECISION = exports.SCALE = exports.SCALE_OFFSET = exports.BASIS_POINT_MAX = exports.Network = exports.ADMIN = exports.LBCLMM_PROGRAM_IDS = void 0;
var web3_js_1 = require("@solana/web3.js");
var idl_1 = require("../idl");
var anchor_1 = require("@coral-xyz/anchor");
exports.LBCLMM_PROGRAM_IDS = {
    devnet: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
    localhost: "LbVRzDTvBDEcrthxfZ4RL6yiq3uZw8bS6MwtdY6UhFQ",
    "mainnet-beta": "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
};
exports.ADMIN = {
    devnet: "6WaLrrRfReGKBYUSkmx2K6AuT21ida4j8at2SUiZdXu8",
    localhost: "bossj3JvwiNK7pvjr149DqdtJxf2gdygbcmEPTkb2F1",
};
var Network;
(function (Network) {
    Network["MAINNET"] = "mainnet-beta";
    Network["TESTNET"] = "testnet";
    Network["DEVNET"] = "devnet";
    Network["LOCAL"] = "localhost";
})(Network || (exports.Network = Network = {}));
exports.BASIS_POINT_MAX = 10000;
exports.SCALE_OFFSET = 64;
exports.SCALE = new anchor_1.BN(1).shln(exports.SCALE_OFFSET);
exports.FEE_PRECISION = new anchor_1.BN(1000000000);
exports.MAX_FEE_RATE = new anchor_1.BN(100000000);
exports.BIN_ARRAY_FEE = 0.07054656;
exports.POSITION_FEE = 0.0565152;
var CONSTANTS = Object.entries(idl_1.IDL.constants);
exports.MAX_BIN_ARRAY_SIZE = new anchor_1.BN((_b = (_a = CONSTANTS.find(function (_a) {
    var k = _a[0], v = _a[1];
    return v.name == "MAX_BIN_PER_ARRAY";
})) === null || _a === void 0 ? void 0 : _a[1].value) !== null && _b !== void 0 ? _b : 0);
exports.MAX_BIN_PER_POSITION = new anchor_1.BN((_d = (_c = CONSTANTS.find(function (_a) {
    var k = _a[0], v = _a[1];
    return v.name == "MAX_BIN_PER_POSITION";
})) === null || _c === void 0 ? void 0 : _c[1].value) !== null && _d !== void 0 ? _d : 0);
exports.BIN_ARRAY_BITMAP_SIZE = new anchor_1.BN((_f = (_e = CONSTANTS.find(function (_a) {
    var k = _a[0], v = _a[1];
    return v.name == "BIN_ARRAY_BITMAP_SIZE";
})) === null || _e === void 0 ? void 0 : _e[1].value) !== null && _f !== void 0 ? _f : 0);
exports.EXTENSION_BINARRAY_BITMAP_SIZE = new anchor_1.BN((_h = (_g = CONSTANTS.find(function (_a) {
    var k = _a[0], v = _a[1];
    return v.name == "EXTENSION_BINARRAY_BITMAP_SIZE";
})) === null || _g === void 0 ? void 0 : _g[1].value) !== null && _h !== void 0 ? _h : 0);
exports.SIMULATION_USER = new web3_js_1.PublicKey("HrY9qR5TiB2xPzzvbBu5KrBorMfYGQXh9osXydz4jy9s");
exports.PRECISION = 18446744073709551616;
exports.MAX_CLAIM_ALL_ALLOWED = 3;
exports.MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX = 26;
exports.MAX_BIN_PER_TX = 69;
exports.MAX_ACTIVE_BIN_SLIPPAGE = 3;
exports.ILM_BASE = new web3_js_1.PublicKey("MFGQxwAmB91SwuYX36okv2Qmdc9aMuHTwWGUrp4AtB1");
