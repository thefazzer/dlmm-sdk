"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONE = void 0;
exports.pow = pow;
var bn_js_1 = require("bn.js");
var constants_1 = require("../constants");
var MAX_EXPONENTIAL = new bn_js_1.default(0x80000);
exports.ONE = new bn_js_1.default(1).shln(constants_1.SCALE_OFFSET);
var MAX = new bn_js_1.default(2).pow(new bn_js_1.default(128)).sub(new bn_js_1.default(1));
function pow(base, exp) {
    var invert = exp.isNeg();
    if (exp.isZero()) {
        return exports.ONE;
    }
    exp = invert ? exp.abs() : exp;
    if (exp.gt(MAX_EXPONENTIAL)) {
        return new bn_js_1.default(0);
    }
    var squaredBase = base;
    var result = exports.ONE;
    if (squaredBase.gte(result)) {
        squaredBase = MAX.div(squaredBase);
        invert = !invert;
    }
    if (!exp.and(new bn_js_1.default(0x1)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x2)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x4)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x8)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x10)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x20)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x40)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x80)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x100)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x200)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x400)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x800)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x1000)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x2000)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x4000)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x8000)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x10000)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x20000)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    squaredBase = squaredBase.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    if (!exp.and(new bn_js_1.default(0x40000)).isZero()) {
        result = result.mul(squaredBase).shrn(constants_1.SCALE_OFFSET);
    }
    if (result.isZero()) {
        return new bn_js_1.default(0);
    }
    if (invert) {
        result = MAX.div(result);
    }
    return result;
}
