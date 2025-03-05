"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAmountBidSide = toAmountBidSide;
exports.toAmountAskSide = toAmountAskSide;
exports.toAmountBothSide = toAmountBothSide;
exports.autoFillYByWeight = autoFillYByWeight;
exports.autoFillXByWeight = autoFillXByWeight;
var decimal_js_1 = require("decimal.js");
var anchor_1 = require("@coral-xyz/anchor");
var weight_1 = require("./weight");
function toAmountBidSide(activeId, totalAmount, distributions) {
    // get sum of weight
    var totalWeight = distributions.reduce(function (sum, el) {
        return el.binId > activeId ? sum : sum.add(el.weight); // skip all ask side
    }, new decimal_js_1.default(0));
    if (totalWeight.cmp(new decimal_js_1.default(0)) != 1) {
        throw Error("Invalid parameteres");
    }
    return distributions.map(function (bin) {
        if (bin.binId > activeId) {
            return {
                binId: bin.binId,
                amount: new anchor_1.BN(0),
            };
        }
        else {
            return {
                binId: bin.binId,
                amount: new anchor_1.BN(new decimal_js_1.default(totalAmount.toString())
                    .mul(new decimal_js_1.default(bin.weight).div(totalWeight))
                    .floor().toString()),
            };
        }
    });
}
function toAmountAskSide(activeId, binStep, totalAmount, distributions) {
    // get sum of weight
    var totalWeight = distributions.reduce(function (sum, el) {
        if (el.binId < activeId) {
            return sum;
        }
        else {
            var price = (0, weight_1.getPriceOfBinByBinId)(el.binId, binStep);
            var weightPerPrice = new decimal_js_1.default(el.weight).div(price);
            return sum.add(weightPerPrice);
        }
    }, new decimal_js_1.default(0));
    if (totalWeight.cmp(new decimal_js_1.default(0)) != 1) {
        throw Error("Invalid parameteres");
    }
    return distributions.map(function (bin) {
        if (bin.binId < activeId) {
            return {
                binId: bin.binId,
                amount: new anchor_1.BN(0),
            };
        }
        else {
            var price = (0, weight_1.getPriceOfBinByBinId)(bin.binId, binStep);
            var weightPerPrice = new decimal_js_1.default(bin.weight).div(price);
            return {
                binId: bin.binId,
                amount: new anchor_1.BN(new decimal_js_1.default(totalAmount.toString()).mul(weightPerPrice).div(totalWeight).floor().toString()),
            };
        }
    });
}
function toAmountBothSide(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, distributions) {
    // only bid side
    if (activeId > distributions[distributions.length - 1].binId) {
        var amounts = toAmountBidSide(activeId, amountY, distributions);
        return amounts.map(function (bin) {
            return {
                binId: bin.binId,
                amountX: new anchor_1.BN(0),
                amountY: bin.amount,
            };
        });
    }
    // only ask side
    if (activeId < distributions[0].binId) {
        var amounts = toAmountAskSide(activeId, binStep, amountX, distributions);
        return amounts.map(function (bin) {
            return {
                binId: bin.binId,
                amountX: bin.amount,
                amountY: new anchor_1.BN(0),
            };
        });
    }
    var activeBins = distributions.filter(function (element) {
        return element.binId === activeId;
    });
    if (activeBins.length === 1) {
        var p0 = (0, weight_1.getPriceOfBinByBinId)(activeId, binStep);
        var wx0_1 = new decimal_js_1.default(0);
        var wy0_1 = new decimal_js_1.default(0);
        var activeBin = activeBins[0];
        if (amountXInActiveBin.isZero() && amountYInActiveBin.isZero()) {
            wx0_1 = new decimal_js_1.default(activeBin.weight).div(p0.mul(new decimal_js_1.default(2)));
            wy0_1 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(2));
        }
        else {
            var amountXInActiveBinDec = new decimal_js_1.default(amountXInActiveBin.toString());
            var amountYInActiveBinDec = new decimal_js_1.default(amountYInActiveBin.toString());
            if (!amountXInActiveBin.isZero()) {
                wx0_1 = new decimal_js_1.default(activeBin.weight).div(p0.add(amountYInActiveBinDec.div(amountXInActiveBinDec)));
            }
            if (!amountYInActiveBin.isZero()) {
                wy0_1 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(1).add(p0.mul(amountXInActiveBinDec).div(amountYInActiveBinDec)));
            }
        }
        var totalWeightX_1 = wx0_1;
        var totalWeightY_1 = wy0_1;
        distributions.forEach(function (element) {
            if (element.binId < activeId) {
                totalWeightY_1 = totalWeightY_1.add(new decimal_js_1.default(element.weight));
            }
            if (element.binId > activeId) {
                var price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                var weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX_1 = totalWeightX_1.add(weighPerPrice);
            }
        });
        var kx = new decimal_js_1.default(amountX.toString()).div(totalWeightX_1);
        var ky = new decimal_js_1.default(amountY.toString()).div(totalWeightY_1);
        var k_1 = (kx.lessThan(ky) ? kx : ky);
        return distributions.map(function (bin) {
            if (bin.binId < activeId) {
                var amount = k_1.mul(new decimal_js_1.default(bin.weight));
                return {
                    binId: bin.binId,
                    amountX: new anchor_1.BN(0),
                    amountY: new anchor_1.BN(amount.floor().toString()),
                };
            }
            if (bin.binId > activeId) {
                var price = (0, weight_1.getPriceOfBinByBinId)(bin.binId, binStep);
                var weighPerPrice = new decimal_js_1.default(bin.weight).div(price);
                var amount = k_1.mul(weighPerPrice);
                return {
                    binId: bin.binId,
                    amountX: new anchor_1.BN(amount.floor().toString()),
                    amountY: new anchor_1.BN(0),
                };
            }
            var amountXActiveBin = k_1.mul(wx0_1);
            var amountYActiveBin = k_1.mul(wy0_1);
            return {
                binId: bin.binId,
                amountX: new anchor_1.BN(amountXActiveBin.floor().toString()),
                amountY: new anchor_1.BN(amountYActiveBin.floor().toString()),
            };
        });
    }
    else {
        var totalWeightX_2 = new decimal_js_1.default(0);
        var totalWeightY_2 = new decimal_js_1.default(0);
        distributions.forEach(function (element) {
            if (element.binId < activeId) {
                totalWeightY_2 = totalWeightY_2.add(new decimal_js_1.default(element.weight));
            }
            else {
                var price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                var weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX_2 = totalWeightX_2.add(weighPerPrice);
            }
        });
        var kx = new decimal_js_1.default(amountX.toString()).div(totalWeightX_2);
        var ky = new decimal_js_1.default(amountY.toString()).div(totalWeightY_2);
        var k_2 = kx.lessThan(ky) ? kx : ky;
        return distributions.map(function (bin) {
            if (bin.binId < activeId) {
                var amount = k_2.mul(new decimal_js_1.default(bin.weight));
                return {
                    binId: bin.binId,
                    amountX: new anchor_1.BN(0),
                    amountY: new anchor_1.BN(amount.floor().toString()),
                };
            }
            else {
                var price = (0, weight_1.getPriceOfBinByBinId)(bin.binId, binStep);
                var weighPerPrice = new decimal_js_1.default(bin.weight).div(price);
                var amount = k_2.mul(weighPerPrice);
                return {
                    binId: bin.binId,
                    amountX: new anchor_1.BN(amount.floor().toString()),
                    amountY: new anchor_1.BN(0),
                };
            }
        });
    }
}
function autoFillYByWeight(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, distributions) {
    var activeBins = distributions.filter(function (element) {
        return element.binId === activeId;
    });
    if (activeBins.length === 1) {
        var p0 = (0, weight_1.getPriceOfBinByBinId)(activeId, binStep);
        var wx0 = new decimal_js_1.default(0);
        var wy0 = new decimal_js_1.default(0);
        var activeBin = activeBins[0];
        if (amountXInActiveBin.isZero() && amountYInActiveBin.isZero()) {
            wx0 = new decimal_js_1.default(activeBin.weight).div(p0.mul(new decimal_js_1.default(2)));
            wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(2));
        }
        else {
            var amountXInActiveBinDec = new decimal_js_1.default(amountXInActiveBin.toString());
            var amountYInActiveBinDec = new decimal_js_1.default(amountYInActiveBin.toString());
            if (!amountXInActiveBin.isZero()) {
                wx0 = new decimal_js_1.default(activeBin.weight).div(p0.add(amountYInActiveBinDec.div(amountXInActiveBinDec)));
            }
            if (!amountYInActiveBin.isZero()) {
                wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(1).add(p0.mul(amountXInActiveBinDec).div(amountYInActiveBinDec)));
            }
        }
        var totalWeightX_3 = wx0;
        var totalWeightY_3 = wy0;
        distributions.forEach(function (element) {
            if (element.binId < activeId) {
                totalWeightY_3 = totalWeightY_3.add(new decimal_js_1.default(element.weight));
            }
            if (element.binId > activeId) {
                var price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                var weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX_3 = totalWeightX_3.add(weighPerPrice);
            }
        });
        var kx = totalWeightX_3.isZero() ? new decimal_js_1.default(1) : new decimal_js_1.default(amountX.toString()).div(totalWeightX_3);
        var amountY = kx.mul(totalWeightY_3);
        return new anchor_1.BN(amountY.floor().toString());
    }
    else {
        var totalWeightX_4 = new decimal_js_1.default(0);
        var totalWeightY_4 = new decimal_js_1.default(0);
        distributions.forEach(function (element) {
            if (element.binId < activeId) {
                totalWeightY_4 = totalWeightY_4.add(new decimal_js_1.default(element.weight));
            }
            else {
                var price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                var weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX_4 = totalWeightX_4.add(weighPerPrice);
            }
        });
        var kx = totalWeightX_4.isZero() ? new decimal_js_1.default(1) : new decimal_js_1.default(amountX.toString()).div(totalWeightX_4);
        var amountY = kx.mul(totalWeightY_4);
        return new anchor_1.BN(amountY.floor().toString());
    }
}
function autoFillXByWeight(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, distributions) {
    var activeBins = distributions.filter(function (element) {
        return element.binId === activeId;
    });
    if (activeBins.length === 1) {
        var p0 = (0, weight_1.getPriceOfBinByBinId)(activeId, binStep);
        var wx0 = new decimal_js_1.default(0);
        var wy0 = new decimal_js_1.default(0);
        var activeBin = activeBins[0];
        if (amountXInActiveBin.isZero() && amountYInActiveBin.isZero()) {
            wx0 = new decimal_js_1.default(activeBin.weight).div(p0.mul(new decimal_js_1.default(2)));
            wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(2));
        }
        else {
            var amountXInActiveBinDec = new decimal_js_1.default(amountXInActiveBin.toString());
            var amountYInActiveBinDec = new decimal_js_1.default(amountYInActiveBin.toString());
            if (!amountXInActiveBin.isZero()) {
                wx0 = new decimal_js_1.default(activeBin.weight).div(p0.add(amountYInActiveBinDec.div(amountXInActiveBinDec)));
            }
            if (!amountYInActiveBin.isZero()) {
                wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(1).add(p0.mul(amountXInActiveBinDec).div(amountYInActiveBinDec)));
            }
        }
        var totalWeightX_5 = wx0;
        var totalWeightY_5 = wy0;
        distributions.forEach(function (element) {
            if (element.binId < activeId) {
                totalWeightY_5 = totalWeightY_5.add(new decimal_js_1.default(element.weight));
            }
            if (element.binId > activeId) {
                var price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                var weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX_5 = totalWeightX_5.add(weighPerPrice);
            }
        });
        var ky = totalWeightY_5.isZero() ? new decimal_js_1.default(1) : new decimal_js_1.default(amountY.toString()).div(totalWeightY_5);
        var amountX = ky.mul(totalWeightX_5);
        return new anchor_1.BN(amountX.floor().toString());
    }
    else {
        var totalWeightX_6 = new decimal_js_1.default(0);
        var totalWeightY_6 = new decimal_js_1.default(0);
        distributions.forEach(function (element) {
            if (element.binId < activeId) {
                totalWeightY_6 = totalWeightY_6.add(new decimal_js_1.default(element.weight));
            }
            else {
                var price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                var weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX_6 = totalWeightX_6.add(weighPerPrice);
            }
        });
        var ky = totalWeightY_6.isZero() ? new decimal_js_1.default(1) : new decimal_js_1.default(amountY.toString()).div(totalWeightY_6);
        var amountX = ky.mul(totalWeightX_6);
        return new anchor_1.BN(amountX.floor().toString());
    }
}
