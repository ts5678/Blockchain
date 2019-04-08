"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//namespace SharedLibrary {
var AddressInfo = /** @class */ (function () {
    function AddressInfo() {
    }
    ;
    return AddressInfo;
}());
exports.AddressInfo = AddressInfo;
var PaymentInfo = /** @class */ (function () {
    function PaymentInfo() {
    }
    ;
    return PaymentInfo;
}());
exports.PaymentInfo = PaymentInfo;
var CustomerInfo = /** @class */ (function () {
    function CustomerInfo() {
    }
    ;
    return CustomerInfo;
}());
exports.CustomerInfo = CustomerInfo;
var TransactionInfo = /** @class */ (function () {
    //constructor() { };
    function TransactionInfo(aTimestamp, aTransactionID, aTransactionType, aTransactionSubmitter) {
        this.Timestamp = aTimestamp;
        this.TransactionID = aTransactionID;
        this.TransactionType = aTransactionType;
        this.TransactionSubmitter = aTransactionSubmitter;
    }
    ;
    return TransactionInfo;
}());
exports.TransactionInfo = TransactionInfo;
var Guid = /** @class */ (function () {
    function Guid() {
    }
    Guid.newGuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    return Guid;
}());
exports.Guid = Guid;
var RandomNums = /** @class */ (function () {
    function RandomNums() {
    }
    RandomNums.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    return RandomNums;
}());
exports.RandomNums = RandomNums;
//# sourceMappingURL=shared-library.js.map