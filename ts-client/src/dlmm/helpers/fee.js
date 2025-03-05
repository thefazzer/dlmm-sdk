"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseFee = getBaseFee;
exports.getVariableFee = getVariableFee;
exports.getTotalFee = getTotalFee;
exports.computeFee = computeFee;
exports.computeFeeFromAmount = computeFeeFromAmount;
exports.computeProtocolFee = computeProtocolFee;
exports.swapExactOutQuoteAtBin = swapExactOutQuoteAtBin;
exports.swapExactInQuoteAtBin = swapExactInQuoteAtBin;
var anchor_1 = require("@coral-xyz/anchor");
var constants_1 = require("../constants");
var math_1 = require("./math");
var _1 = require(".");
function getBaseFee(binStep, sParameter) {
    return new anchor_1.BN(sParameter.baseFactor).mul(new anchor_1.BN(binStep)).mul(new anchor_1.BN(10));
}
function getVariableFee(binStep, sParameter, vParameter) {
    if (sParameter.variableFeeControl > 0) {
        var square_vfa_bin = new anchor_1.BN(vParameter.volatilityAccumulator)
            .mul(new anchor_1.BN(binStep))
            .pow(new anchor_1.BN(2));
        var v_fee = new anchor_1.BN(sParameter.variableFeeControl).mul(square_vfa_bin);
        return v_fee.add(new anchor_1.BN(99999999999)).div(new anchor_1.BN(100000000000));
    }
    return new anchor_1.BN(0);
}
function getTotalFee(binStep, sParameter, vParameter) {
    var totalFee = getBaseFee(binStep, sParameter).add(getVariableFee(binStep, sParameter, vParameter));
    return totalFee.gt(constants_1.MAX_FEE_RATE) ? constants_1.MAX_FEE_RATE : totalFee;
}
function computeFee(binStep, sParameter, vParameter, inAmount) {
    var totalFee = getTotalFee(binStep, sParameter, vParameter);
    var denominator = constants_1.FEE_PRECISION.sub(totalFee);
    return inAmount
        .mul(totalFee)
        .add(denominator)
        .sub(new anchor_1.BN(1))
        .div(denominator);
}
function computeFeeFromAmount(binStep, sParameter, vParameter, inAmountWithFees) {
    var totalFee = getTotalFee(binStep, sParameter, vParameter);
    return inAmountWithFees
        .mul(totalFee)
        .add(constants_1.FEE_PRECISION.sub(new anchor_1.BN(1)))
        .div(constants_1.FEE_PRECISION);
}
function computeProtocolFee(feeAmount, sParameter) {
    return feeAmount
        .mul(new anchor_1.BN(sParameter.protocolShare))
        .div(new anchor_1.BN(constants_1.BASIS_POINT_MAX));
}
function swapExactOutQuoteAtBin(bin, binStep, sParameter, vParameter, outAmount, swapForY) {
    if (swapForY && bin.amountY.isZero()) {
        return {
            amountIn: new anchor_1.BN(0),
            amountOut: new anchor_1.BN(0),
            fee: new anchor_1.BN(0),
            protocolFee: new anchor_1.BN(0),
        };
    }
    if (!swapForY && bin.amountX.isZero()) {
        return {
            amountIn: new anchor_1.BN(0),
            amountOut: new anchor_1.BN(0),
            fee: new anchor_1.BN(0),
            protocolFee: new anchor_1.BN(0),
        };
    }
    var maxAmountOut;
    var maxAmountIn;
    if (swapForY) {
        maxAmountOut = bin.amountY;
        maxAmountIn = (0, math_1.shlDiv)(bin.amountY, bin.price, constants_1.SCALE_OFFSET, math_1.Rounding.Up);
    }
    else {
        maxAmountOut = bin.amountX;
        maxAmountIn = (0, math_1.mulShr)(bin.amountX, bin.price, constants_1.SCALE_OFFSET, math_1.Rounding.Up);
    }
    if (outAmount.gte(maxAmountOut)) {
        var maxFee = computeFee(binStep, sParameter, vParameter, maxAmountIn);
        var protocolFee = computeProtocolFee(maxFee, sParameter);
        return {
            amountIn: maxAmountIn,
            amountOut: maxAmountOut,
            fee: maxFee,
            protocolFee: protocolFee,
        };
    }
    else {
        var amountIn = getAmountIn(outAmount, bin.price, swapForY);
        var fee = computeFee(binStep, sParameter, vParameter, amountIn);
        var protocolFee = computeProtocolFee(fee, sParameter);
        return {
            amountIn: amountIn,
            amountOut: outAmount,
            fee: fee,
            protocolFee: protocolFee,
        };
    }
}
function swapExactInQuoteAtBin(bin, binStep, sParameter, vParameter, inAmount, swapForY) {
    if (swapForY && bin.amountY.isZero()) {
        return {
            amountIn: new anchor_1.BN(0),
            amountOut: new anchor_1.BN(0),
            fee: new anchor_1.BN(0),
            protocolFee: new anchor_1.BN(0),
        };
    }
    if (!swapForY && bin.amountX.isZero()) {
        return {
            amountIn: new anchor_1.BN(0),
            amountOut: new anchor_1.BN(0),
            fee: new anchor_1.BN(0),
            protocolFee: new anchor_1.BN(0),
        };
    }
    var maxAmountOut;
    var maxAmountIn;
    if (swapForY) {
        maxAmountOut = bin.amountY;
        maxAmountIn = (0, math_1.shlDiv)(bin.amountY, bin.price, constants_1.SCALE_OFFSET, math_1.Rounding.Up);
    }
    else {
        maxAmountOut = bin.amountX;
        maxAmountIn = (0, math_1.mulShr)(bin.amountX, bin.price, constants_1.SCALE_OFFSET, math_1.Rounding.Up);
    }
    var maxFee = computeFee(binStep, sParameter, vParameter, maxAmountIn);
    maxAmountIn = maxAmountIn.add(maxFee);
    var amountInWithFees;
    var amountOut;
    var fee;
    var protocolFee;
    if (inAmount.gt(maxAmountIn)) {
        amountInWithFees = maxAmountIn;
        amountOut = maxAmountOut;
        fee = maxFee;
        protocolFee = computeProtocolFee(maxFee, sParameter);
    }
    else {
        fee = computeFeeFromAmount(binStep, sParameter, vParameter, inAmount);
        var amountInAfterFee = inAmount.sub(fee);
        var computedOutAmount = (0, _1.getOutAmount)(bin, amountInAfterFee, swapForY);
        amountOut = computedOutAmount.gt(maxAmountOut)
            ? maxAmountOut
            : computedOutAmount;
        protocolFee = computeProtocolFee(fee, sParameter);
        amountInWithFees = inAmount;
    }
    return {
        amountIn: amountInWithFees,
        amountOut: amountOut,
        fee: fee,
        protocolFee: protocolFee,
    };
}
function getAmountIn(amountOut, price, swapForY) {
    if (swapForY) {
        return (0, math_1.shlDiv)(amountOut, price, constants_1.SCALE_OFFSET, math_1.Rounding.Up);
    }
    else {
        return (0, math_1.mulShr)(amountOut, price, constants_1.SCALE_OFFSET, math_1.Rounding.Up);
    }
}
