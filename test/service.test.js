"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cds = __importStar(require("@sap/cds"));
describe("Contracts", () => {
    const test = cds.test(cds.root);
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        (yield test).server.close();
    }));
    it("should return a revenue recognitions", () => __awaiter(void 0, void 0, void 0, function* () {
        const srv = yield cds.connect.to("RevenueCalculationService");
        const recordset = yield srv.run(SELECT.from(srv.entities.Contracts, (o) => {
            o.ID,
                o.whenSigned,
                o.Amount,
                o.product_ID,
                o.revenueRecognitions((r) => {
                    r.items, r.amount, r.date, r.contract_ID;
                });
        }));
        expect(recordset).toEqual([
            {
                Amount: 100,
                ID: "1",
                product_ID: 1,
                revenueRecognitions: [
                    { amount: 30, contract_ID: "1", date: "2016-01-01", items: "1" },
                    { amount: 70, contract_ID: "1", date: "2016-01-02", items: "2" },
                ],
                whenSigned: "2016-01-01",
            },
            {
                Amount: 200,
                ID: "2",
                product_ID: 2,
                revenueRecognitions: [
                    { amount: 20, contract_ID: "2", date: "2016-01-03", items: "3" },
                    { amount: 30, contract_ID: "2", date: "2016-01-04", items: "4" },
                    { amount: 50, contract_ID: "2", date: "2016-01-05", items: "5" },
                    { amount: 40, contract_ID: "2", date: "2016-01-06", items: "6" },
                ],
                whenSigned: "2016-02-01",
            },
        ]);
    }));
    it("should allow to run action : calculateRecognitions", () => __awaiter(void 0, void 0, void 0, function* () {
        const srv = yield cds.connect.to("RevenueCalculationService");
        yield srv.send({
            event: "calculateRecognitions",
            entity: "Contracts",
            data: { contractID: 1 },
            params: { contractID: 1 },
        });
    }));
    it("should allow to run action : calculateRecognitions", () => __awaiter(void 0, void 0, void 0, function* () {
        const srv = yield cds.connect.to("RevenueCalculationService");
        yield srv.send({
            event: "calculateRecognitions",
            entity: "Contracts",
            data: { contractID: 2 },
            params: { contractID: 2 },
        });
    }));
});
