"use strict";
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
exports.isOverflowDefaultBinArrayBitmap = isOverflowDefaultBinArrayBitmap;
exports.deriveBinArrayBitmapExtension = deriveBinArrayBitmapExtension;
exports.binIdToBinArrayIndex = binIdToBinArrayIndex;
exports.getBinArrayLowerUpperBinId = getBinArrayLowerUpperBinId;
exports.isBinIdWithinBinArray = isBinIdWithinBinArray;
exports.getBinFromBinArray = getBinFromBinArray;
exports.findNextBinArrayIndexWithLiquidity = findNextBinArrayIndexWithLiquidity;
exports.findNextBinArrayWithLiquidity = findNextBinArrayWithLiquidity;
exports.getBinArraysRequiredByPositionRange = getBinArraysRequiredByPositionRange;
exports.enumerateBins = enumerateBins;
var anchor_1 = require("@coral-xyz/anchor");
var web3_js_1 = require("@solana/web3.js");
var constants_1 = require("../constants");
var types_1 = require("../types");
var constants_2 = require("../constants");
var math_1 = require("./math");
var derive_1 = require("./derive");
/** private */
function internalBitmapRange() {
    var lowerBinArrayIndex = constants_2.BIN_ARRAY_BITMAP_SIZE.neg();
    var upperBinArrayIndex = constants_2.BIN_ARRAY_BITMAP_SIZE.sub(new anchor_1.BN(1));
    return [lowerBinArrayIndex, upperBinArrayIndex];
}
function buildBitmapFromU64Arrays(u64Arrays, type) {
    var buffer = Buffer.concat(u64Arrays.map(function (b) {
        return b.toArrayLike(Buffer, "le", 8);
    }));
    return new anchor_1.BN(buffer, "le");
}
function bitmapTypeDetail(type) {
    if (type == types_1.BitmapType.U1024) {
        return {
            bits: 1024,
            bytes: 1024 / 8,
        };
    }
    else {
        return {
            bits: 512,
            bytes: 512 / 8,
        };
    }
}
function mostSignificantBit(number, bitLength) {
    var highestIndex = bitLength - 1;
    if (number.isZero()) {
        return null;
    }
    for (var i = highestIndex; i >= 0; i--) {
        if (number.testn(i)) {
            return highestIndex - i;
        }
    }
    return null;
}
function leastSignificantBit(number, bitLength) {
    if (number.isZero()) {
        return null;
    }
    for (var i = 0; i < bitLength; i++) {
        if (number.testn(i)) {
            return i;
        }
    }
    return null;
}
function extensionBitmapRange() {
    return [
        constants_2.BIN_ARRAY_BITMAP_SIZE.neg().mul(constants_2.EXTENSION_BINARRAY_BITMAP_SIZE.add(new anchor_1.BN(1))),
        constants_2.BIN_ARRAY_BITMAP_SIZE.mul(constants_2.EXTENSION_BINARRAY_BITMAP_SIZE.add(new anchor_1.BN(1))).sub(new anchor_1.BN(1)),
    ];
}
function findSetBit(startIndex, endIndex, binArrayBitmapExtension) {
    var getBinArrayOffset = function (binArrayIndex) {
        return binArrayIndex.gt(new anchor_1.BN(0))
            ? binArrayIndex.mod(constants_2.BIN_ARRAY_BITMAP_SIZE)
            : binArrayIndex.add(new anchor_1.BN(1)).neg().mod(constants_2.BIN_ARRAY_BITMAP_SIZE);
    };
    var getBitmapOffset = function (binArrayIndex) {
        return binArrayIndex.gt(new anchor_1.BN(0))
            ? binArrayIndex.div(constants_2.BIN_ARRAY_BITMAP_SIZE).sub(new anchor_1.BN(1))
            : binArrayIndex
                .add(new anchor_1.BN(1))
                .neg()
                .div(constants_2.BIN_ARRAY_BITMAP_SIZE)
                .sub(new anchor_1.BN(1));
    };
    if (startIndex <= endIndex) {
        for (var i = startIndex; i <= endIndex; i++) {
            var binArrayOffset = getBinArrayOffset(new anchor_1.BN(i)).toNumber();
            var bitmapOffset = getBitmapOffset(new anchor_1.BN(i)).toNumber();
            var bitmapChunks = i > 0
                ? binArrayBitmapExtension.positiveBinArrayBitmap[bitmapOffset]
                : binArrayBitmapExtension.negativeBinArrayBitmap[bitmapOffset];
            var bitmap = buildBitmapFromU64Arrays(bitmapChunks, types_1.BitmapType.U512);
            if (bitmap.testn(binArrayOffset)) {
                return i;
            }
        }
    }
    else {
        for (var i = startIndex; i >= endIndex; i--) {
            var binArrayOffset = getBinArrayOffset(new anchor_1.BN(i)).toNumber();
            var bitmapOffset = getBitmapOffset(new anchor_1.BN(i)).toNumber();
            var bitmapChunks = i > 0
                ? binArrayBitmapExtension.positiveBinArrayBitmap[bitmapOffset]
                : binArrayBitmapExtension.negativeBinArrayBitmap[bitmapOffset];
            var bitmap = buildBitmapFromU64Arrays(bitmapChunks, types_1.BitmapType.U512);
            if (bitmap.testn(binArrayOffset)) {
                return i;
            }
        }
    }
    return null;
}
/** private */
function isOverflowDefaultBinArrayBitmap(binArrayIndex) {
    var _a = internalBitmapRange(), minBinArrayIndex = _a[0], maxBinArrayIndex = _a[1];
    return (binArrayIndex.gt(maxBinArrayIndex) || binArrayIndex.lt(minBinArrayIndex));
}
function deriveBinArrayBitmapExtension(lbPair, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from("bitmap"), lbPair.toBytes()], programId);
}
function binIdToBinArrayIndex(binId) {
    var _a = binId.divmod(constants_1.MAX_BIN_ARRAY_SIZE), idx = _a.div, mod = _a.mod;
    return binId.isNeg() && !mod.isZero() ? idx.sub(new anchor_1.BN(1)) : idx;
}
function getBinArrayLowerUpperBinId(binArrayIndex) {
    var lowerBinId = binArrayIndex.mul(constants_1.MAX_BIN_ARRAY_SIZE);
    var upperBinId = lowerBinId.add(constants_1.MAX_BIN_ARRAY_SIZE).sub(new anchor_1.BN(1));
    return [lowerBinId, upperBinId];
}
function isBinIdWithinBinArray(activeId, binArrayIndex) {
    var _a = getBinArrayLowerUpperBinId(binArrayIndex), lowerBinId = _a[0], upperBinId = _a[1];
    return activeId.gte(lowerBinId) && activeId.lte(upperBinId);
}
function getBinFromBinArray(binId, binArray) {
    var _a = getBinArrayLowerUpperBinId(binArray.index), lowerBinId = _a[0], upperBinId = _a[1];
    var index = 0;
    if (binId > 0) {
        index = binId - lowerBinId.toNumber();
    }
    else {
        var delta = upperBinId.toNumber() - binId;
        index = constants_1.MAX_BIN_ARRAY_SIZE.toNumber() - delta - 1;
    }
    return binArray.bins[index];
}
function findNextBinArrayIndexWithLiquidity(swapForY, activeId, lbPairState, binArrayBitmapExtension) {
    var _a = internalBitmapRange(), lowerBinArrayIndex = _a[0], upperBinArrayIndex = _a[1];
    var startBinArrayIndex = binIdToBinArrayIndex(activeId);
    while (true) {
        if (isOverflowDefaultBinArrayBitmap(startBinArrayIndex)) {
            if (binArrayBitmapExtension === null) {
                return null;
            }
            // When bin array index is negative, the MSB is smallest bin array index.
            var _b = extensionBitmapRange(), minBinArrayIndex = _b[0], maxBinArrayIndex = _b[1];
            if (startBinArrayIndex.isNeg()) {
                if (swapForY) {
                    var binArrayIndex = findSetBit(startBinArrayIndex.toNumber(), minBinArrayIndex.toNumber(), binArrayBitmapExtension);
                    if (binArrayIndex !== null) {
                        return new anchor_1.BN(binArrayIndex);
                    }
                    else {
                        return null;
                    }
                }
                else {
                    var binArrayIndex = findSetBit(startBinArrayIndex.toNumber(), constants_2.BIN_ARRAY_BITMAP_SIZE.neg().sub(new anchor_1.BN(1)).toNumber(), binArrayBitmapExtension);
                    if (binArrayIndex !== null) {
                        return new anchor_1.BN(binArrayIndex);
                    }
                    else {
                        // Move to internal bitmap
                        startBinArrayIndex = constants_2.BIN_ARRAY_BITMAP_SIZE.neg();
                    }
                }
            }
            else {
                if (swapForY) {
                    var binArrayIndex = findSetBit(startBinArrayIndex.toNumber(), constants_2.BIN_ARRAY_BITMAP_SIZE.toNumber(), binArrayBitmapExtension);
                    if (binArrayIndex !== null) {
                        return new anchor_1.BN(binArrayIndex);
                    }
                    else {
                        // Move to internal bitmap
                        startBinArrayIndex = constants_2.BIN_ARRAY_BITMAP_SIZE.sub(new anchor_1.BN(1));
                    }
                }
                else {
                    var binArrayIndex = findSetBit(startBinArrayIndex.toNumber(), maxBinArrayIndex.toNumber(), binArrayBitmapExtension);
                    if (binArrayIndex !== null) {
                        return new anchor_1.BN(binArrayIndex);
                    }
                    else {
                        return null;
                    }
                }
            }
        }
        else {
            // Internal bitmap
            var bitmapType = types_1.BitmapType.U1024;
            var bitmapDetail = bitmapTypeDetail(bitmapType);
            var offset = startBinArrayIndex.add(constants_2.BIN_ARRAY_BITMAP_SIZE);
            var bitmap = buildBitmapFromU64Arrays(lbPairState.binArrayBitmap, bitmapType);
            if (swapForY) {
                var upperBitRange = new anchor_1.BN(bitmapDetail.bits - 1).sub(offset);
                var croppedBitmap = bitmap.shln(upperBitRange.toNumber());
                var msb = mostSignificantBit(croppedBitmap, bitmapDetail.bits);
                if (msb !== null) {
                    return startBinArrayIndex.sub(new anchor_1.BN(msb));
                }
                else {
                    // Move to extension
                    startBinArrayIndex = lowerBinArrayIndex.sub(new anchor_1.BN(1));
                }
            }
            else {
                var lowerBitRange = offset;
                var croppedBitmap = bitmap.shrn(lowerBitRange.toNumber());
                var lsb = leastSignificantBit(croppedBitmap, bitmapDetail.bits);
                if (lsb !== null) {
                    return startBinArrayIndex.add(new anchor_1.BN(lsb));
                }
                else {
                    // Move to extension
                    startBinArrayIndex = upperBinArrayIndex.add(new anchor_1.BN(1));
                }
            }
        }
    }
}
function findNextBinArrayWithLiquidity(swapForY, activeBinId, lbPairState, binArrayBitmapExtension, binArrays) {
    var nearestBinArrayIndexWithLiquidity = findNextBinArrayIndexWithLiquidity(swapForY, activeBinId, lbPairState, binArrayBitmapExtension);
    if (nearestBinArrayIndexWithLiquidity == null) {
        return null;
    }
    var binArrayAccount = binArrays.find(function (ba) {
        return ba.account.index.eq(nearestBinArrayIndexWithLiquidity);
    });
    if (!binArrayAccount) {
        // Cached bin array couldn't cover more bins, partial quoted.
        return null;
    }
    return binArrayAccount;
}
/**
 * Retrieves the bin arrays required to initialize multiple positions in continuous range.
 *
 * @param {PublicKey} pair - The public key of the pair.
 * @param {BN} fromBinId - The starting bin ID.
 * @param {BN} toBinId - The ending bin ID.
 * @return {[{key: PublicKey, index: BN }]} An array of bin arrays required for the given position range.
 */
function getBinArraysRequiredByPositionRange(pair, fromBinId, toBinId, programId) {
    var _a = fromBinId.lt(toBinId)
        ? [fromBinId, toBinId]
        : [toBinId, fromBinId], minBinId = _a[0], maxBinId = _a[1];
    var positionCount = (0, math_1.getPositionCount)(minBinId, maxBinId);
    var binArrays = new Map();
    for (var i = 0; i < positionCount.toNumber(); i++) {
        var lowerBinId = minBinId.add(constants_1.MAX_BIN_PER_POSITION.mul(new anchor_1.BN(i)));
        var lowerBinArrayIndex = binIdToBinArrayIndex(lowerBinId);
        var upperBinArrayIndex = lowerBinArrayIndex.add(new anchor_1.BN(1));
        var lowerBinArray = (0, derive_1.deriveBinArray)(pair, lowerBinArrayIndex, programId)[0];
        var upperBinArray = (0, derive_1.deriveBinArray)(pair, upperBinArrayIndex, programId)[0];
        binArrays.set(lowerBinArray.toBase58(), lowerBinArrayIndex);
        binArrays.set(upperBinArray.toBase58(), upperBinArrayIndex);
    }
    return Array.from(binArrays, function (_a) {
        var key = _a[0], index = _a[1];
        return ({
            key: new web3_js_1.PublicKey(key),
            index: index,
        });
    });
}
function enumerateBins(binsById, lowerBinId, upperBinId, binStep, baseTokenDecimal, quoteTokenDecimal, version) {
    var currentBinId, bin;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                currentBinId = lowerBinId;
                _a.label = 1;
            case 1:
                if (!(currentBinId <= upperBinId)) return [3 /*break*/, 6];
                bin = binsById.get(currentBinId);
                if (!(bin != null)) return [3 /*break*/, 3];
                return [4 /*yield*/, types_1.BinLiquidity.fromBin(bin, currentBinId, binStep, baseTokenDecimal, quoteTokenDecimal, version)];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, types_1.BinLiquidity.empty(currentBinId, binStep, baseTokenDecimal, quoteTokenDecimal, version)];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5:
                currentBinId++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}
