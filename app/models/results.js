const _ = require('lodash');

class OperationResultCodeEnum {
    static get NOT_FOUND() { return 'NOT_FOUND'; }
    static get INVALID_ARGUMENTS() { return 'INVALID_ARGUMENTS'; }
    static get SUCCESS() { return 'SUCCESS'; }

    static getNames() {
        return [
            OperationResultCodeEnum.NOT_FOUND,
            OperationResultCodeEnum.INVALID_ARGUMENTS,
            OperationResultCodeEnum.SUCCESS
        ];
    }

    static isDefined(code) {
        return Object.hasOwnProperty(OperationResultCodeEnum, code);
    }
}

class OperationResult {
    constructor(code, params) {
        this.code = code;
        this.params = params;
    }

    static Success(params) {
        return new OperationResult(OperationResultCodeEnum.SUCCESS, params || {});
    }
    static NotFound() {
        return new OperationResult(OperationResultCodeEnum.NOT_FOUND);
    }
    static InvalidArguments() {
        return new OperationResult(OperationResultCodeEnum.INVALID_ARGUMENTS);
    }
}

class PagedResult {
    constructor(items, skipCount, takeCount) {
        this.total = items.length;
        this.items = _(items)
            .drop(skipCount)
            .take(takeCount)
            .value();
    }
}

module.exports = {
    OperationResult,
    PagedResult,
    OperationResultCodeEnum
}; 