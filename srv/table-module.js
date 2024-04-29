"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueRecognitionImpl = exports.ProductImpl = exports.ContractImpl = exports.TableModule = void 0;
class TableModule {
    constructor(recordset, tableName) {
        this._table = recordset[tableName];
    }
    get table() {
        return this._table;
    }
    set table(value) {
        this._table = value;
    }
}
exports.TableModule = TableModule;
class ContractImpl extends TableModule {
    constructor(recordset) {
        super(recordset, "Contracts");
        this._products = new ProductImpl(recordset);
        this._revenueRecognitions = new RevenueRecognitionImpl(recordset);
        this.recalculate();
    }
    recalculate() {
        //  this.table[0].Amount = this._revenueRecognitions.table.reduce((acc, rr) => acc + rr.amount, 0);
        //  console.log( this._revenueRecognitions.table.reduce((acc, rr) => acc + rr.amount, 0))
    }
}
exports.ContractImpl = ContractImpl;
class ProductImpl extends TableModule {
    constructor(recordset) {
        super(recordset, "Products");
    }
}
exports.ProductImpl = ProductImpl;
class RevenueRecognitionImpl extends TableModule {
    constructor(recordset) {
        super(recordset, "RevenueRecognitions");
    }
}
exports.RevenueRecognitionImpl = RevenueRecognitionImpl;
