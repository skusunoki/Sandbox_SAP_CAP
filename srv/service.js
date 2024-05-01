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
exports.RevenueCalculationService = void 0;
const cds_1 = __importDefault(require("@sap/cds"));
const power_assert_1 = __importDefault(require("power-assert"));
class TableModule {
    constructor(_dataset) {
        this._dataset = _dataset;
        this._dataset = _dataset;
    }
    calculateRecognitions(contractID) {
        const contractRow = this._dataset.find((contract) => contract.ID == contractID);
        (0, power_assert_1.default)(contractRow !== undefined, `Contract with ID ${contractID} not found`);
        if ((contractRow === null || contractRow === void 0 ? void 0 : contractRow.revenueRecognitions) == undefined)
            return;
        if ((contractRow === null || contractRow === void 0 ? void 0 : contractRow.product) == undefined)
            return;
        if ((contractRow === null || contractRow === void 0 ? void 0 : contractRow.Amount) == undefined)
            return;
        const amount = contractRow.Amount;
        let rr = contractRow === null || contractRow === void 0 ? void 0 : contractRow.revenueRecognitions;
        const product = contractRow === null || contractRow === void 0 ? void 0 : contractRow.product;
        console.log(product);
        if (contractRow.product.type === "WP") {
            rr = [];
            rr.push({
                items: cds_1.default.utils.uuid(),
                amount: amount,
                date: contractRow === null || contractRow === void 0 ? void 0 : contractRow.whenSigned,
                contract_ID: contractRow === null || contractRow === void 0 ? void 0 : contractRow.ID,
            });
            this._dataset[0].revenueRecognitions = rr;
        }
        if ((product === null || product === void 0 ? void 0 : product.type) == "SS") {
            rr = [];
            const allocation = this.allocate(amount, 3);
            rr.push({
                items: cds_1.default.utils.uuid(),
                amount: allocation[0],
                date: contractRow === null || contractRow === void 0 ? void 0 : contractRow.whenSigned,
                contract_ID: contractRow === null || contractRow === void 0 ? void 0 : contractRow.ID,
            });
            rr.push({
                items: cds_1.default.utils.uuid(),
                amount: allocation[1],
                date: contractRow === null || contractRow === void 0 ? void 0 : contractRow.whenSigned,
                contract_ID: contractRow === null || contractRow === void 0 ? void 0 : contractRow.ID,
            });
            rr.push({
                items: cds_1.default.utils.uuid(),
                amount: allocation[2],
                date: contractRow === null || contractRow === void 0 ? void 0 : contractRow.whenSigned,
                contract_ID: contractRow === null || contractRow === void 0 ? void 0 : contractRow.ID,
            });
            this._dataset[0].revenueRecognitions = rr;
        }
    }
    get contracts() {
        return this._dataset;
    }
    allocate(amount, by) {
        const lowResult = Math.floor((amount / by) * 100) / 100;
        const highResult = lowResult + 0.01;
        const result = [];
        let remainder = amount % by;
        for (let i = 0; i < by; i++) {
            result.push(i < remainder ? highResult : lowResult);
        }
        return result;
    }
}
class RevenueCalculationService extends cds_1.default.ApplicationService {
    init() {
        this.after("READ", "Contracts", (contracts) => {
            return contracts;
        });
        this.on("calculateRecognitions", "Contracts", (req) => __awaiter(this, void 0, void 0, function* () {
            let dataset = yield deepRead.call(this, req.data.contractID);
            console.log(req);
            console.log(dataset);
            const contracts = new TableModule(dataset);
            contracts.calculateRecognitions(req.data.contractID);
            yield deepUpsert.call(this, contracts.contracts);
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
                o.Amount,
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
function deepUpsert(contracts) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let aContract of contracts) {
            yield this.update(this.entities.Contracts, aContract.ID)
                .set(aContract);
        }
        console.log(yield deepRead.call(this, contracts[0].ID));
    });
}
