"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rounding = void 0;
exports.mulShr = mulShr;
exports.shlDiv = shlDiv;
exports.mulDiv = mulDiv;
exports.computeBaseFactorFromFeeBps = computeBaseFactorFromFeeBps;
exports.getQPriceFromId = getQPriceFromId;
exports.findSwappableMinMaxBinId = findSwappableMinMaxBinId;
exports.getC = getC;
exports.distributeAmountToCompressedBinsByRatio = distributeAmountToCompressedBinsByRatio;
exports.getPositionCount = getPositionCount;
exports.compressBinAmount = compressBinAmount;
exports.generateAmountForBinRange = generateAmountForBinRange;
exports.generateBinAmount = generateBinAmount;
var anchor_1 = require("@coral-xyz/anchor");
var constants_1 = require("../constants");
var decimal_js_1 = require("decimal.js");
var u64xu64_math_1 = require("./u64xu64_math");
var weight_1 = require("./weight");
var Rounding;
(function (Rounding) {
    Rounding[Rounding["Up"] = 0] = "Up";
    Rounding[Rounding["Down"] = 1] = "Down";
})(Rounding || (exports.Rounding = Rounding = {}));
function mulShr(x, y, offset, rounding) {
    var denominator = new anchor_1.BN(1).shln(offset);
    return mulDiv(x, y, denominator, rounding);
}
function shlDiv(x, y, offset, rounding) {
    var scale = new anchor_1.BN(1).shln(offset);
    return mulDiv(x, scale, y, rounding);
}
function mulDiv(x, y, denominator, rounding) {
    var _a = x.mul(y).divmod(denominator), div = _a.div, mod = _a.mod;
    if (rounding == Rounding.Up && !mod.isZero()) {
        return div.add(new anchor_1.BN(1));
    }
    return div;
}
function computeBaseFactorFromFeeBps(binStep, feeBps) {
    var U16_MAX = 65535;
    var computedBaseFactor = (feeBps.toNumber() * constants_1.BASIS_POINT_MAX) / binStep.toNumber();
    // Sanity check
    var computedBaseFactorFloor = Math.floor(computedBaseFactor);
    if (computedBaseFactor != computedBaseFactorFloor) {
        if (computedBaseFactorFloor >= U16_MAX) {
            throw "base factor for the give fee bps overflow u16";
        }
        if (computedBaseFactorFloor == 0) {
            throw "base factor for the give fee bps underflow";
        }
        if (computedBaseFactor % 1 != 0) {
            throw "couldn't compute base factor for the exact fee bps";
        }
    }
    return new anchor_1.BN(computedBaseFactor);
}
function getQPriceFromId(binId, binStep) {
    var bps = binStep.shln(constants_1.SCALE_OFFSET).div(new anchor_1.BN(constants_1.BASIS_POINT_MAX));
    var base = u64xu64_math_1.ONE.add(bps);
    return (0, u64xu64_math_1.pow)(base, binId);
}
function findSwappableMinMaxBinId(binStep) {
    var base = 1 + binStep.toNumber() / constants_1.BASIS_POINT_MAX;
    var maxQPriceSupported = new decimal_js_1.default("18446744073709551615");
    var n = maxQPriceSupported.log(10).div(new decimal_js_1.default(base).log(10)).floor();
    var minBinId = new anchor_1.BN(n.neg().toString());
    var maxBinId = new anchor_1.BN(n.toString());
    var minQPrice = new anchor_1.BN(1);
    var maxQPrice = new anchor_1.BN("340282366920938463463374607431768211455");
    while (true) {
        var qPrice = getQPriceFromId(minBinId, binStep);
        if (qPrice.gt(minQPrice) && !qPrice.isZero()) {
            break;
        }
        else {
            minBinId = minBinId.add(new anchor_1.BN(1));
        }
    }
    while (true) {
        var qPrice = getQPriceFromId(maxBinId, binStep);
        if (qPrice.lt(maxQPrice) && !qPrice.isZero()) {
            break;
        }
        else {
            maxBinId = maxBinId.sub(new anchor_1.BN(1));
        }
    }
    return {
        minBinId: minBinId,
        maxBinId: maxBinId,
    };
}
function getC(amount, binStep, binId, baseTokenDecimal, quoteTokenDecimal, minPrice, maxPrice, k) {
    var currentPricePerLamport = new decimal_js_1.default(1 + binStep / 10000).pow(binId.toNumber());
    var currentPricePerToken = currentPricePerLamport.mul(new decimal_js_1.default(Math.pow(10, (baseTokenDecimal - quoteTokenDecimal))));
    var priceRange = maxPrice.sub(minPrice);
    var currentPriceDeltaFromMin = currentPricePerToken.sub(new decimal_js_1.default(minPrice));
    var c = new decimal_js_1.default(amount.toString()).mul(currentPriceDeltaFromMin.div(priceRange).pow(k));
    return c.floor();
}
function distributeAmountToCompressedBinsByRatio(compressedBinAmount, uncompressedAmount, multiplier, binCapAmount) {
    var newCompressedBinAmount = new Map();
    var totalCompressedAmount = new anchor_1.BN(0);
    for (var _i = 0, _a = compressedBinAmount.values(); _i < _a.length; _i++) {
        var compressedAmount = _a[_i];
        totalCompressedAmount = totalCompressedAmount.add(compressedAmount);
    }
    var totalDepositedAmount = new anchor_1.BN(0);
    for (var _b = 0, _c = compressedBinAmount.entries(); _b < _c.length; _b++) {
        var _d = _c[_b], binId = _d[0], compressedAmount = _d[1];
        var depositAmount = compressedAmount
            .mul(uncompressedAmount)
            .div(totalCompressedAmount);
        var compressedDepositAmount = depositAmount.div(multiplier);
        var newCompressedAmount = compressedAmount.add(compressedDepositAmount);
        if (newCompressedAmount.gt(binCapAmount)) {
            compressedDepositAmount = compressedDepositAmount.sub(newCompressedAmount.sub(binCapAmount));
            newCompressedAmount = binCapAmount;
        }
        newCompressedBinAmount.set(binId, newCompressedAmount);
        totalDepositedAmount = totalDepositedAmount.add(compressedDepositAmount.mul(multiplier));
    }
    var loss = uncompressedAmount.sub(totalDepositedAmount);
    return {
        newCompressedBinAmount: newCompressedBinAmount,
        loss: loss,
    };
}
function getPositionCount(minBinId, maxBinId) {
    var binDelta = maxBinId.sub(minBinId);
    var positionCount = binDelta.div(constants_1.MAX_BIN_PER_POSITION);
    return positionCount.add(new anchor_1.BN(1));
}
function compressBinAmount(binAmount, multiplier) {
    var compressedBinAmount = new Map();
    var totalAmount = new anchor_1.BN(0);
    var compressionLoss = new anchor_1.BN(0);
    for (var _i = 0, binAmount_1 = binAmount; _i < binAmount_1.length; _i++) {
        var _a = binAmount_1[_i], binId = _a[0], amount = _a[1];
        totalAmount = totalAmount.add(amount);
        var compressedAmount = amount.div(multiplier);
        compressedBinAmount.set(binId, compressedAmount);
        var loss = amount.sub(compressedAmount.mul(multiplier));
        compressionLoss = compressionLoss.add(loss);
    }
    return {
        compressedBinAmount: compressedBinAmount,
        compressionLoss: compressionLoss,
    };
}
function generateAmountForBinRange(amount, binStep, tokenXDecimal, tokenYDecimal, minBinId, maxBinId, k) {
    var toTokenMultiplier = new decimal_js_1.default(Math.pow(10, (tokenXDecimal - tokenYDecimal)));
    var minPrice = (0, weight_1.getPriceOfBinByBinId)(minBinId.toNumber(), binStep).mul(toTokenMultiplier);
    var maxPrice = (0, weight_1.getPriceOfBinByBinId)(maxBinId.toNumber(), binStep).mul(toTokenMultiplier);
    var binAmounts = new Map();
    for (var i = minBinId.toNumber(); i < maxBinId.toNumber(); i++) {
        var binAmount = generateBinAmount(amount, binStep, new anchor_1.BN(i), tokenXDecimal, tokenYDecimal, minPrice, maxPrice, k);
        binAmounts.set(i, binAmount);
    }
    return binAmounts;
}
function generateBinAmount(amount, binStep, binId, tokenXDecimal, tokenYDecimal, minPrice, maxPrice, k) {
    var c1 = getC(amount, binStep, binId.add(new anchor_1.BN(1)), tokenXDecimal, tokenYDecimal, minPrice, maxPrice, k);
    var c0 = getC(amount, binStep, binId, tokenXDecimal, tokenYDecimal, minPrice, maxPrice, k);
    return new anchor_1.BN(c1.sub(c0).floor().toString());
}
