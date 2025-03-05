"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceOfBinByBinId = getPriceOfBinByBinId;
exports.toWeightDistribution = toWeightDistribution;
exports.calculateSpotDistribution = calculateSpotDistribution;
exports.calculateBidAskDistribution = calculateBidAskDistribution;
exports.calculateNormalDistribution = calculateNormalDistribution;
exports.fromWeightDistributionToAmountOneSide = fromWeightDistributionToAmountOneSide;
exports.fromWeightDistributionToAmount = fromWeightDistributionToAmount;
var anchor_1 = require("@coral-xyz/anchor");
var gaussian_1 = require("gaussian");
var constants_1 = require("../constants");
var decimal_js_1 = require("decimal.js");
var weightToAmounts_1 = require("./weightToAmounts");
function getPriceOfBinByBinId(binId, binStep) {
    var binStepNum = new decimal_js_1.default(binStep).div(new decimal_js_1.default(constants_1.BASIS_POINT_MAX));
    return new decimal_js_1.default(1).add(new decimal_js_1.default(binStepNum)).pow(new decimal_js_1.default(binId));
}
/// Build a gaussian distribution from the bins, with active bin as the mean.
function buildGaussianFromBins(activeBin, binIds) {
    var smallestBin = Math.min.apply(Math, binIds);
    var largestBin = Math.max.apply(Math, binIds);
    // Define the Gaussian distribution. The mean will be active bin when active bin is within the bin ids. Else, use left or right most bin id as the mean.
    var mean = 0;
    var isAroundActiveBin = binIds.find(function (bid) { return bid == activeBin; });
    // The liquidity will be distributed surrounding active bin
    if (isAroundActiveBin) {
        mean = activeBin;
    }
    // The liquidity will be distributed to the right side of the active bin.
    else if (activeBin < smallestBin) {
        mean = smallestBin;
    }
    // The liquidity will be distributed to the left side of the active bin.
    else {
        mean = largestBin;
    }
    var TWO_STANDARD_DEVIATION = 4;
    var stdDev = (largestBin - smallestBin) / TWO_STANDARD_DEVIATION;
    var variance = Math.max(Math.pow(stdDev, 2), 1);
    return (0, gaussian_1.default)(mean, variance);
}
/// Find the probability of the bin id over the gaussian. The probability ranged from 0 - 1 and will be used as liquidity allocation for that particular bin.
function generateBinLiquidityAllocation(gaussian, binIds, invert) {
    var allocations = binIds.map(function (bid) {
        return invert ? 1 / gaussian.pdf(bid) : gaussian.pdf(bid);
    });
    var totalAllocations = allocations.reduce(function (acc, v) { return acc + v; }, 0);
    // Gaussian impossible to cover 100%, normalized it to have total of 100%
    return allocations.map(function (a) { return a / totalAllocations; });
}
/// Convert liquidity allocation from 0..1 to 0..10000 bps unit. The sum of allocations must be 1. Return BPS and the loss after conversion.
function computeAllocationBps(allocations) {
    var totalAllocation = new anchor_1.BN(0);
    var bpsAllocations = [];
    for (var _i = 0, allocations_1 = allocations; _i < allocations_1.length; _i++) {
        var allocation = allocations_1[_i];
        var allocBps = new anchor_1.BN(allocation * 10000);
        bpsAllocations.push(allocBps);
        totalAllocation = totalAllocation.add(allocBps);
    }
    var pLoss = new anchor_1.BN(10000).sub(totalAllocation);
    return {
        bpsAllocations: bpsAllocations,
        pLoss: pLoss,
    };
}
/** private */
function toWeightDistribution(amountX, amountY, distributions, binStep) {
    // get all quote amount
    var totalQuote = new anchor_1.BN(0);
    var precision = 1000000000000;
    var quoteDistributions = distributions.map(function (bin) {
        var price = new anchor_1.BN(getPriceOfBinByBinId(bin.binId, binStep).mul(precision).floor().toString());
        var quoteValue = amountX
            .mul(new anchor_1.BN(bin.xAmountBpsOfTotal))
            .mul(new anchor_1.BN(price))
            .div(new anchor_1.BN(constants_1.BASIS_POINT_MAX))
            .div(new anchor_1.BN(precision));
        var quoteAmount = quoteValue.add(amountY.mul(new anchor_1.BN(bin.yAmountBpsOfTotal)).div(new anchor_1.BN(constants_1.BASIS_POINT_MAX)));
        totalQuote = totalQuote.add(quoteAmount);
        return {
            binId: bin.binId,
            quoteAmount: quoteAmount,
        };
    });
    if (totalQuote.eq(new anchor_1.BN(0))) {
        return [];
    }
    var distributionWeights = quoteDistributions
        .map(function (bin) {
        var weight = Math.floor(bin.quoteAmount.mul(new anchor_1.BN(65535)).div(totalQuote).toNumber());
        return {
            binId: bin.binId,
            weight: weight,
        };
    })
        .filter(function (item) { return item.weight > 0; });
    return distributionWeights;
}
function calculateSpotDistribution(activeBin, binIds) {
    if (!binIds.includes(activeBin)) {
        var _a = new anchor_1.BN(10000).divmod(new anchor_1.BN(binIds.length)), dist_1 = _a.div, rem = _a.mod;
        var loss = rem.isZero() ? new anchor_1.BN(0) : new anchor_1.BN(1);
        var distributions = binIds[0] < activeBin
            ? binIds.map(function (binId) { return ({
                binId: binId,
                xAmountBpsOfTotal: new anchor_1.BN(0),
                yAmountBpsOfTotal: dist_1,
            }); })
            : binIds.map(function (binId) { return ({
                binId: binId,
                xAmountBpsOfTotal: dist_1,
                yAmountBpsOfTotal: new anchor_1.BN(0),
            }); });
        // Add the loss to the left most bin
        if (binIds[0] < activeBin) {
            distributions[0].yAmountBpsOfTotal.add(loss);
        }
        // Add the loss to the right most bin
        else {
            distributions[binIds.length - 1].xAmountBpsOfTotal.add(loss);
        }
        return distributions;
    }
    var binYCount = binIds.filter(function (binId) { return binId < activeBin; }).length;
    var binXCount = binIds.filter(function (binId) { return binId > activeBin; }).length;
    var totalYBinCapacity = binYCount + 0.5;
    var totalXBinCapacity = binXCount + 0.5;
    var yBinBps = new anchor_1.BN(10000 / totalYBinCapacity);
    var yActiveBinBps = new anchor_1.BN(10000).sub(yBinBps.mul(new anchor_1.BN(binYCount)));
    var xBinBps = new anchor_1.BN(10000 / totalXBinCapacity);
    var xActiveBinBps = new anchor_1.BN(10000).sub(xBinBps.mul(new anchor_1.BN(binXCount)));
    return binIds.map(function (binId) {
        var isYBin = binId < activeBin;
        var isXBin = binId > activeBin;
        var isActiveBin = binId === activeBin;
        if (isYBin) {
            return {
                binId: binId,
                xAmountBpsOfTotal: new anchor_1.BN(0),
                yAmountBpsOfTotal: yBinBps,
            };
        }
        if (isXBin) {
            return {
                binId: binId,
                xAmountBpsOfTotal: xBinBps,
                yAmountBpsOfTotal: new anchor_1.BN(0),
            };
        }
        if (isActiveBin) {
            return {
                binId: binId,
                xAmountBpsOfTotal: xActiveBinBps,
                yAmountBpsOfTotal: yActiveBinBps,
            };
        }
    });
}
function calculateBidAskDistribution(activeBin, binIds) {
    var smallestBin = Math.min.apply(Math, binIds);
    var largestBin = Math.max.apply(Math, binIds);
    var rightOnly = activeBin < smallestBin;
    var leftOnly = activeBin > largestBin;
    var gaussian = buildGaussianFromBins(activeBin, binIds);
    var allocations = generateBinLiquidityAllocation(gaussian, binIds, true);
    // To the right of active bin, liquidity distribution consists of only token X.
    if (rightOnly) {
        var _a = computeAllocationBps(allocations), bpsAllocations_1 = _a.bpsAllocations, pLoss = _a.pLoss;
        var binDistributions = binIds.map(function (bid, idx) { return ({
            binId: bid,
            xAmountBpsOfTotal: bpsAllocations_1[idx],
            yAmountBpsOfTotal: new anchor_1.BN(0),
        }); });
        var idx = binDistributions.length - 1;
        binDistributions[idx].xAmountBpsOfTotal =
            binDistributions[idx].xAmountBpsOfTotal.add(pLoss);
        return binDistributions;
    }
    // To the left of active bin, liquidity distribution consists of only token Y.
    if (leftOnly) {
        var _b = computeAllocationBps(allocations), bpsAllocations_2 = _b.bpsAllocations, pLoss = _b.pLoss;
        var binDistributions = binIds.map(function (bid, idx) { return ({
            binId: bid,
            xAmountBpsOfTotal: new anchor_1.BN(0),
            yAmountBpsOfTotal: bpsAllocations_2[idx],
        }); });
        binDistributions[0].yAmountBpsOfTotal =
            binDistributions[0].yAmountBpsOfTotal.add(pLoss);
        return binDistributions;
    }
    // Find total X, and Y bps allocations for normalization.
    var _c = allocations.reduce(function (_a, allocation, idx) {
        var xAcc = _a[0], yAcc = _a[1];
        var binId = binIds[idx];
        if (binId > activeBin) {
            return [xAcc + allocation, yAcc];
        }
        else if (binId < activeBin) {
            return [xAcc, yAcc + allocation];
        }
        else {
            var half = allocation / 2;
            return [xAcc + half, yAcc + half];
        }
    }, [0, 0]), totalXAllocation = _c[0], totalYAllocation = _c[1];
    // Normalize and convert to BPS
    var _d = allocations.reduce(function (_a, allocation, idx) {
        var xAllocations = _a[0], yAllocations = _a[1];
        var binId = binIds[idx];
        if (binId > activeBin) {
            var distX = new anchor_1.BN((allocation * 10000) / totalXAllocation);
            xAllocations.push(distX);
        }
        if (binId < activeBin) {
            var distY = new anchor_1.BN((allocation * 10000) / totalYAllocation);
            yAllocations.push(distY);
        }
        if (binId == activeBin) {
            var half = allocation / 2;
            var distX = new anchor_1.BN((half * 10000) / totalXAllocation);
            var distY = new anchor_1.BN((half * 10000) / totalYAllocation);
            xAllocations.push(distX);
            yAllocations.push(distY);
        }
        return [xAllocations, yAllocations];
    }, [[], []]), normXAllocations = _d[0], normYAllocations = _d[1];
    var totalXNormAllocations = normXAllocations.reduce(function (acc, v) { return acc.add(v); }, new anchor_1.BN(0));
    var totalYNormAllocations = normYAllocations.reduce(function (acc, v) { return acc.add(v); }, new anchor_1.BN(0));
    var xPLoss = new anchor_1.BN(10000).sub(totalXNormAllocations);
    var yPLoss = new anchor_1.BN(10000).sub(totalYNormAllocations);
    var distributions = binIds.map(function (binId) {
        if (binId === activeBin) {
            return {
                binId: binId,
                xAmountBpsOfTotal: normXAllocations.shift(),
                yAmountBpsOfTotal: normYAllocations.shift(),
            };
        }
        if (binId > activeBin) {
            return {
                binId: binId,
                xAmountBpsOfTotal: normXAllocations.shift(),
                yAmountBpsOfTotal: new anchor_1.BN(0),
            };
        }
        if (binId < activeBin) {
            return {
                binId: binId,
                xAmountBpsOfTotal: new anchor_1.BN(0),
                yAmountBpsOfTotal: normYAllocations.shift(),
            };
        }
    });
    if (!yPLoss.isZero()) {
        distributions[0].yAmountBpsOfTotal =
            distributions[0].yAmountBpsOfTotal.add(yPLoss);
    }
    if (!xPLoss.isZero()) {
        var last = distributions.length - 1;
        distributions[last].xAmountBpsOfTotal =
            distributions[last].xAmountBpsOfTotal.add(xPLoss);
    }
    return distributions;
}
function calculateNormalDistribution(activeBin, binIds) {
    var smallestBin = Math.min.apply(Math, binIds);
    var largestBin = Math.max.apply(Math, binIds);
    var rightOnly = activeBin < smallestBin;
    var leftOnly = activeBin > largestBin;
    var gaussian = buildGaussianFromBins(activeBin, binIds);
    var allocations = generateBinLiquidityAllocation(gaussian, binIds, false);
    // To the right of active bin, liquidity distribution consists of only token X.
    if (rightOnly) {
        var _a = computeAllocationBps(allocations), bpsAllocations_3 = _a.bpsAllocations, pLoss = _a.pLoss;
        var binDistributions = binIds.map(function (bid, idx) { return ({
            binId: bid,
            xAmountBpsOfTotal: bpsAllocations_3[idx],
            yAmountBpsOfTotal: new anchor_1.BN(0),
        }); });
        // When contains only X token, bin closest to active bin will be index 0.
        // Add back the precision loss
        binDistributions[0].xAmountBpsOfTotal =
            binDistributions[0].xAmountBpsOfTotal.add(pLoss);
        return binDistributions;
    }
    // To the left of active bin, liquidity distribution consists of only token Y.
    if (leftOnly) {
        var _b = computeAllocationBps(allocations), bpsAllocations_4 = _b.bpsAllocations, pLoss = _b.pLoss;
        var binDistributions = binIds.map(function (bid, idx) { return ({
            binId: bid,
            xAmountBpsOfTotal: new anchor_1.BN(0),
            yAmountBpsOfTotal: bpsAllocations_4[idx],
        }); });
        // When contains only Y token, bin closest to active bin will be last index.
        // Add back the precision loss
        var idx = binDistributions.length - 1;
        binDistributions[idx].yAmountBpsOfTotal =
            binDistributions[idx].yAmountBpsOfTotal.add(pLoss);
        return binDistributions;
    }
    // The liquidity distribution consists of token X and Y. Allocations from gaussian only says how much liquidity percentage per bin over the full bin range.
    // Normalize liquidity allocation percentage into X - 100%, Y - 100%.
    // Find total X, and Y bps allocations for normalization.
    var _c = allocations.reduce(function (_a, allocation, idx) {
        var xAcc = _a[0], yAcc = _a[1];
        var binId = binIds[idx];
        if (binId > activeBin) {
            return [xAcc + allocation, yAcc];
        }
        else if (binId < activeBin) {
            return [xAcc, yAcc + allocation];
        }
        else {
            var half = allocation / 2;
            return [xAcc + half, yAcc + half];
        }
    }, [0, 0]), totalXAllocation = _c[0], totalYAllocation = _c[1];
    // Normalize and convert to BPS
    var _d = allocations.reduce(function (_a, allocation, idx) {
        var xAllocations = _a[0], yAllocations = _a[1];
        var binId = binIds[idx];
        if (binId > activeBin) {
            var distX = new anchor_1.BN((allocation * 10000) / totalXAllocation);
            xAllocations.push(distX);
        }
        if (binId < activeBin) {
            var distY = new anchor_1.BN((allocation * 10000) / totalYAllocation);
            yAllocations.push(distY);
        }
        return [xAllocations, yAllocations];
    }, [[], []]), normXAllocations = _d[0], normYAllocations = _d[1];
    var normXActiveBinAllocation = normXAllocations.reduce(function (maxBps, bps) { return maxBps.sub(bps); }, new anchor_1.BN(10000));
    var normYActiveBinAllocation = normYAllocations.reduce(function (maxBps, bps) { return maxBps.sub(bps); }, new anchor_1.BN(10000));
    return binIds.map(function (binId) {
        if (binId === activeBin) {
            return {
                binId: binId,
                xAmountBpsOfTotal: normXActiveBinAllocation,
                yAmountBpsOfTotal: normYActiveBinAllocation,
            };
        }
        if (binId > activeBin) {
            return {
                binId: binId,
                xAmountBpsOfTotal: normXAllocations.shift(),
                yAmountBpsOfTotal: new anchor_1.BN(0),
            };
        }
        if (binId < activeBin) {
            return {
                binId: binId,
                xAmountBpsOfTotal: new anchor_1.BN(0),
                yAmountBpsOfTotal: normYAllocations.shift(),
            };
        }
    });
}
function fromWeightDistributionToAmountOneSide(amount, distributions, binStep, activeId, depositForY) {
    if (depositForY) {
        return (0, weightToAmounts_1.toAmountBidSide)(activeId, amount, distributions);
    }
    else {
        return (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amount, distributions);
    }
}
function fromWeightDistributionToAmount(amountX, amountY, distributions, binStep, activeId, amountXInActiveBin, amountYInActiveBin) {
    // sort distribution
    var distributions = distributions.sort(function (n1, n2) {
        return n1.binId - n2.binId;
    });
    if (distributions.length == 0) {
        return [];
    }
    // only bid side
    if (activeId > distributions[distributions.length - 1].binId) {
        var amounts = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, distributions);
        return amounts.map(function (bin) {
            return {
                binId: bin.binId,
                amountX: new anchor_1.BN(0),
                amountY: new anchor_1.BN(bin.amount.toString()),
            };
        });
    }
    // only ask side
    if (activeId < distributions[0].binId) {
        var amounts = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, distributions);
        return amounts.map(function (bin) {
            return {
                binId: bin.binId,
                amountX: new anchor_1.BN(bin.amount.toString()),
                amountY: new anchor_1.BN(0),
            };
        });
    }
    return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, distributions);
}
