"use strict";
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
exports.toAmountsBothSideByStrategy = toAmountsBothSideByStrategy;
exports.autoFillYByStrategy = autoFillYByStrategy;
exports.autoFillXByStrategy = autoFillXByStrategy;
exports.toStrategyParameters = toStrategyParameters;
var anchor_1 = require("@coral-xyz/anchor");
var types_1 = require("../types");
var weightToAmounts_1 = require("./weightToAmounts");
var DEFAULT_MAX_WEIGHT = 2000;
var DEFAULT_MIN_WEIGHT = 200;
function toWeightSpotBalanced(minBinId, maxBinId) {
    var distributions = [];
    for (var i = minBinId; i <= maxBinId; i++) {
        distributions.push({
            binId: i,
            weight: 1,
        });
    }
    return distributions;
}
function toWeightDecendingOrder(minBinId, maxBinId) {
    var distributions = [];
    for (var i = minBinId; i <= maxBinId; i++) {
        distributions.push({
            binId: i,
            weight: maxBinId - i + 1,
        });
    }
    return distributions;
}
function toWeightAscendingOrder(minBinId, maxBinId) {
    var distributions = [];
    for (var i = minBinId; i <= maxBinId; i++) {
        distributions.push({
            binId: i,
            weight: i - minBinId + 1,
        });
    }
    return distributions;
}
function toWeightCurve(minBinId, maxBinId, activeId) {
    if (activeId < minBinId || activeId > maxBinId) {
        throw "Invalid strategy params";
    }
    var maxWeight = DEFAULT_MAX_WEIGHT;
    var minWeight = DEFAULT_MIN_WEIGHT;
    var diffWeight = maxWeight - minWeight;
    var diffMinWeight = activeId > minBinId ? Math.floor(diffWeight / (activeId - minBinId)) : 0;
    var diffMaxWeight = maxBinId > activeId ? Math.floor(diffWeight / (maxBinId - activeId)) : 0;
    var distributions = [];
    for (var i = minBinId; i <= maxBinId; i++) {
        if (i < activeId) {
            distributions.push({
                binId: i,
                weight: maxWeight - (activeId - i) * diffMinWeight,
            });
        }
        else if (i > activeId) {
            distributions.push({
                binId: i,
                weight: maxWeight - (i - activeId) * diffMaxWeight,
            });
        }
        else {
            distributions.push({
                binId: i,
                weight: maxWeight,
            });
        }
    }
    return distributions;
}
function toWeightBidAsk(minBinId, maxBinId, activeId) {
    if (activeId < minBinId || activeId > maxBinId) {
        throw "Invalid strategy params";
    }
    var maxWeight = DEFAULT_MAX_WEIGHT;
    var minWeight = DEFAULT_MIN_WEIGHT;
    var diffWeight = maxWeight - minWeight;
    var diffMinWeight = activeId > minBinId ? Math.floor(diffWeight / (activeId - minBinId)) : 0;
    var diffMaxWeight = maxBinId > activeId ? Math.floor(diffWeight / (maxBinId - activeId)) : 0;
    var distributions = [];
    for (var i = minBinId; i <= maxBinId; i++) {
        if (i < activeId) {
            distributions.push({
                binId: i,
                weight: minWeight + (activeId - i) * diffMinWeight,
            });
        }
        else if (i > activeId) {
            distributions.push({
                binId: i,
                weight: minWeight + (i - activeId) * diffMaxWeight,
            });
        }
        else {
            distributions.push({
                binId: i,
                weight: minWeight,
            });
        }
    }
    return distributions;
}
function toAmountsBothSideByStrategy(activeId, binStep, minBinId, maxBinId, amountX, amountY, amountXInActiveBin, amountYInActiveBin, strategyType) {
    var isSingleSideX = amountY.isZero();
    switch (strategyType) {
        case types_1.StrategyType.SpotImBalanced: {
            if (activeId < minBinId || activeId > maxBinId) {
                var weights = toWeightSpotBalanced(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights);
            }
            var amountsInBin = [];
            if (!isSingleSideX) {
                if (minBinId <= activeId) {
                    var weights = toWeightSpotBalanced(minBinId, activeId);
                    var amounts = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights);
                    for (var _i = 0, amounts_1 = amounts; _i < amounts_1.length; _i++) {
                        var bin = amounts_1[_i];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId < maxBinId) {
                    var weights = toWeightSpotBalanced(activeId + 1, maxBinId);
                    var amounts = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights);
                    for (var _a = 0, amounts_2 = amounts; _a < amounts_2.length; _a++) {
                        var bin = amounts_2[_a];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            else {
                if (minBinId < activeId) {
                    var weights = toWeightSpotBalanced(minBinId, activeId - 1);
                    var amountsIntoBidSide = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights);
                    for (var _b = 0, amountsIntoBidSide_1 = amountsIntoBidSide; _b < amountsIntoBidSide_1.length; _b++) {
                        var bin = amountsIntoBidSide_1[_b];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId <= maxBinId) {
                    var weights = toWeightSpotBalanced(activeId, maxBinId);
                    var amountsIntoAskSide = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights);
                    for (var _c = 0, amountsIntoAskSide_1 = amountsIntoAskSide; _c < amountsIntoAskSide_1.length; _c++) {
                        var bin = amountsIntoAskSide_1[_c];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            return amountsInBin;
        }
        case types_1.StrategyType.CurveImBalanced: {
            // ask side
            if (activeId < minBinId) {
                var weights = toWeightDecendingOrder(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights);
            }
            // bid side
            if (activeId > maxBinId) {
                var weights = toWeightAscendingOrder(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights);
            }
            var amountsInBin = [];
            if (!isSingleSideX) {
                if (minBinId <= activeId) {
                    var weights = toWeightAscendingOrder(minBinId, activeId);
                    var amounts = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights);
                    for (var _d = 0, amounts_3 = amounts; _d < amounts_3.length; _d++) {
                        var bin = amounts_3[_d];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId < maxBinId) {
                    var weights = toWeightDecendingOrder(activeId + 1, maxBinId);
                    var amounts = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights);
                    for (var _e = 0, amounts_4 = amounts; _e < amounts_4.length; _e++) {
                        var bin = amounts_4[_e];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            else {
                if (minBinId < activeId) {
                    var weights = toWeightAscendingOrder(minBinId, activeId - 1);
                    var amountsIntoBidSide = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights);
                    for (var _f = 0, amountsIntoBidSide_2 = amountsIntoBidSide; _f < amountsIntoBidSide_2.length; _f++) {
                        var bin = amountsIntoBidSide_2[_f];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId <= maxBinId) {
                    var weights = toWeightDecendingOrder(activeId, maxBinId);
                    var amountsIntoAskSide = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights);
                    for (var _g = 0, amountsIntoAskSide_2 = amountsIntoAskSide; _g < amountsIntoAskSide_2.length; _g++) {
                        var bin = amountsIntoAskSide_2[_g];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            return amountsInBin;
        }
        case types_1.StrategyType.BidAskImBalanced: {
            // ask side
            if (activeId < minBinId) {
                var weights = toWeightAscendingOrder(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights);
            }
            // bid side
            if (activeId > maxBinId) {
                var weights = toWeightDecendingOrder(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights);
            }
            var amountsInBin = [];
            if (!isSingleSideX) {
                if (minBinId <= activeId) {
                    var weights = toWeightDecendingOrder(minBinId, activeId);
                    var amounts = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights);
                    for (var _h = 0, amounts_5 = amounts; _h < amounts_5.length; _h++) {
                        var bin = amounts_5[_h];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId < maxBinId) {
                    var weights = toWeightAscendingOrder(activeId + 1, maxBinId);
                    var amounts = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights);
                    for (var _j = 0, amounts_6 = amounts; _j < amounts_6.length; _j++) {
                        var bin = amounts_6[_j];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            else {
                if (minBinId < activeId) {
                    var weights = toWeightDecendingOrder(minBinId, activeId - 1);
                    var amountsIntoBidSide = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights);
                    for (var _k = 0, amountsIntoBidSide_3 = amountsIntoBidSide; _k < amountsIntoBidSide_3.length; _k++) {
                        var bin = amountsIntoBidSide_3[_k];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId <= maxBinId) {
                    var weights = toWeightAscendingOrder(activeId, maxBinId);
                    var amountsIntoAskSide = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights);
                    for (var _l = 0, amountsIntoAskSide_3 = amountsIntoAskSide; _l < amountsIntoAskSide_3.length; _l++) {
                        var bin = amountsIntoAskSide_3[_l];
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            return amountsInBin;
        }
        case types_1.StrategyType.SpotBalanced: {
            var weights = toWeightSpotBalanced(minBinId, maxBinId);
            return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.CurveBalanced: {
            var weights = toWeightCurve(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.BidAskBalanced: {
            var weights = toWeightBidAsk(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights);
        }
    }
}
// only apply for
function autoFillYByStrategy(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, minBinId, maxBinId, strategyType) {
    switch (strategyType) {
        case types_1.StrategyType.SpotImBalanced:
        case types_1.StrategyType.CurveImBalanced:
        case types_1.StrategyType.BidAskImBalanced: {
            throw "Invalid Strategy Parameters";
        }
        case types_1.StrategyType.SpotBalanced: {
            var weights = toWeightSpotBalanced(minBinId, maxBinId);
            return (0, weightToAmounts_1.autoFillYByWeight)(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.CurveBalanced: {
            var weights = toWeightCurve(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.autoFillYByWeight)(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.BidAskBalanced: {
            var weights = toWeightBidAsk(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.autoFillYByWeight)(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, weights);
        }
    }
}
// only apply for balanced deposit
function autoFillXByStrategy(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, minBinId, maxBinId, strategyType) {
    switch (strategyType) {
        case types_1.StrategyType.SpotImBalanced:
        case types_1.StrategyType.CurveImBalanced:
        case types_1.StrategyType.BidAskImBalanced: {
            throw "Invalid Strategy Parameters";
        }
        case types_1.StrategyType.SpotBalanced: {
            var weights = toWeightSpotBalanced(minBinId, maxBinId);
            return (0, weightToAmounts_1.autoFillXByWeight)(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.CurveBalanced: {
            var weights = toWeightCurve(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.autoFillXByWeight)(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.BidAskBalanced: {
            var weights = toWeightBidAsk(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.autoFillXByWeight)(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, weights);
        }
    }
}
// this this function to convert correct type for program
function toStrategyParameters(_a) {
    var maxBinId = _a.maxBinId, minBinId = _a.minBinId, strategyType = _a.strategyType, singleSidedX = _a.singleSidedX;
    var parameters = __spreadArray([singleSidedX ? 1 : 0], new Array(63).fill(0), true);
    switch (strategyType) {
        case types_1.StrategyType.SpotBalanced: {
            return {
                minBinId: minBinId,
                maxBinId: maxBinId,
                strategyType: { spotBalanced: {} },
                parameteres: Buffer.from(parameters).toJSON().data,
            };
        }
        case types_1.StrategyType.CurveBalanced: {
            return {
                minBinId: minBinId,
                maxBinId: maxBinId,
                strategyType: { curveBalanced: {} },
                parameteres: Buffer.from(parameters).toJSON().data,
            };
        }
        case types_1.StrategyType.BidAskBalanced: {
            return {
                minBinId: minBinId,
                maxBinId: maxBinId,
                strategyType: { bidAskBalanced: {} },
                parameteres: Buffer.from(parameters).toJSON().data,
            };
        }
        case types_1.StrategyType.SpotImBalanced: {
            return {
                minBinId: minBinId,
                maxBinId: maxBinId,
                strategyType: { spotImBalanced: {} },
                parameteres: Buffer.from(parameters).toJSON().data,
            };
        }
        case types_1.StrategyType.CurveImBalanced: {
            return {
                minBinId: minBinId,
                maxBinId: maxBinId,
                strategyType: { curveImBalanced: {} },
                parameteres: Buffer.from(parameters).toJSON().data,
            };
        }
        case types_1.StrategyType.BidAskImBalanced: {
            return {
                minBinId: minBinId,
                maxBinId: maxBinId,
                strategyType: { bidAskImBalanced: {} },
                parameteres: Buffer.from(parameters).toJSON().data,
            };
        }
    }
}
