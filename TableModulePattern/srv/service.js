"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueCalculationService = exports.Contracts = void 0;
const cds_1 = __importDefault(require("@sap/cds"));
const power_assert_1 = __importDefault(require("power-assert"));
class Contracts {
    constructor(_dataset) {
        this._dataset = _dataset;
        this._dataset = _dataset;
        this._index = 0;
    }
    calculateRecognitions(contractID) {
        this._index = this._dataset.findIndex((contract) => contract.ID == contractID);
        const contractRow = this._dataset[this._index];
        if (contractRow === undefined)
            return;
        if (contractRow.product === undefined)
            return;
        if (contractRow.amount === undefined)
            return;
        const amount = contractRow.amount;
        const product = contractRow.product;
        if (contractRow.product.type === "WP") {
            let rr = [];
            rr.push({
                items: cds_1.default.utils.uuid(),
                amount: amount,
                date: contractRow.whenSigned,
                contract_ID: contractRow.ID,
            });
            this._dataset[this._index].revenueRecognitions = [...rr];
        }
        if (contractRow.product.type === "SS") {
            let rr = [];
            const alloc_amount = this.allocate_amount(amount, 3);
            const alloc_date = this.allocate_date(new Date(contractRow === null || contractRow === void 0 ? void 0 : contractRow.whenSigned), 3);
            rr.push({
                items: cds_1.default.utils.uuid(),
                amount: alloc_amount[0],
                date: alloc_date[0],
                contract_ID: contractRow === null || contractRow === void 0 ? void 0 : contractRow.ID,
            });
            rr.push({
                items: cds_1.default.utils.uuid(),
                amount: alloc_amount[1],
                date: alloc_date[1],
                contract_ID: contractRow === null || contractRow === void 0 ? void 0 : contractRow.ID,
            });
            rr.push({
                items: cds_1.default.utils.uuid(),
                amount: alloc_amount[2],
                date: alloc_date[2],
                contract_ID: contractRow === null || contractRow === void 0 ? void 0 : contractRow.ID,
            });
            this._dataset[this._index].revenueRecognitions = [...rr];
        }
        if ((product === null || product === void 0 ? void 0 : product.type) === undefined) {
            (0, power_assert_1.default)(false, "Product type is not defined");
        }
    }
    get contracts() {
        return this._dataset;
    }
    set contracts(contracts) {
        this._dataset = contracts;
    }
    allocate_amount(amount, by) {
        const lowResult = Math.floor((amount / by) * 100) / 100;
        const highResult = lowResult + 0.01;
        const result = [];
        let remainder = (amount * 100) % by;
        for (let i = 0; i < by; i++) {
            result.push(i < remainder ? highResult : lowResult);
        }
        return result;
    }
    allocate_date(date, by) {
        let rr_date = [];
        for (let i = 0; i < by; i++) {
            let rr_date_base = new Date(date);
            rr_date_base.setDate(rr_date_base.getDate() + i * 30);
            rr_date.push(rr_date_base.toISOString().split("T")[0]);
        }
        return rr_date;
    }
}
exports.Contracts = Contracts;
class RevenueCalculationService extends cds_1.default.ApplicationService {
    init() {
        this.after("READ", this.entities.Contracts, (contracts) => {
            return contracts;
        });
        this.on("calculateRecognitions", this.entities.Contracts, (req) => __awaiter(this, void 0, void 0, function* () {
            (0, power_assert_1.default)(req.params !== undefined);
            const [IdOfContract] = req.params;
            const contracts = new Contracts(yield deepRead.call(this, Number(IdOfContract)));
            contracts.calculateRecognitions(Number(IdOfContract));
            yield deepUpdate.call(this, contracts.contracts);
        }));
        return super.init();
    }
}
exports.RevenueCalculationService = RevenueCalculationService;
function deepRead(contractID) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield SELECT.from(this.entities.Contracts, (o) => {
            o.ID,
                o.whenSigned,
                o.amount,
                o.product((p) => {
                    p.ID, p.name;
                    p.type;
                }),
                o.revenueRecognitions((r) => {
                    r.items, r.amount, r.date, r.contract_ID;
                });
        }).where({ ID: contractID });
    });
}
function deepUpdate(contracts) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let aContract of contracts) {
            yield this.update(this.entities.Contracts, aContract.ID).set(aContract);
        }
    });
}
