"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DlmmSdkError = exports.DLMMError = void 0;
var idl_1 = require("./idl");
var anchor_1 = require("@coral-xyz/anchor");
var constants_1 = require("./constants");
// ProgramError error parser
var DLMMError = /** @class */ (function (_super) {
    __extends(DLMMError, _super);
    function DLMMError(error) {
        var _this = this;
        var _errorCode = 0;
        var _errorName = "Something went wrong";
        var _errorMessage = "Something went wrong";
        if (error instanceof Error) {
            var anchorError = anchor_1.AnchorError.parse(JSON.parse(JSON.stringify(error)).logs);
            if ((anchorError === null || anchorError === void 0 ? void 0 : anchorError.program.toBase58()) === constants_1.LBCLMM_PROGRAM_IDS["mainnet-beta"]) {
                _errorCode = anchorError.error.errorCode.number;
                _errorName = anchorError.error.errorCode.code;
                _errorMessage = anchorError.error.errorMessage;
            }
        }
        else {
            var idlError = idl_1.IDL.errors.find(function (err) { return err.code === error; });
            if (idlError) {
                _errorCode = idlError.code;
                _errorName = idlError.name;
                _errorMessage = idlError.msg;
            }
        }
        _this = _super.call(this, _errorMessage) || this;
        _this.errorCode = _errorCode;
        _this.errorName = _errorName;
        _this.errorMessage = _errorMessage;
        return _this;
    }
    return DLMMError;
}(Error));
exports.DLMMError = DLMMError;
var DlmmSdkError = /** @class */ (function (_super) {
    __extends(DlmmSdkError, _super);
    function DlmmSdkError(name, message) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.message = message;
        return _this;
    }
    return DlmmSdkError;
}(Error));
exports.DlmmSdkError = DlmmSdkError;
