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
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield test.data.reset();
    }));
    it("should return a revenue recognitions", () => __awaiter(void 0, void 0, void 0, function* () {
        const srv = yield cds.connect.to("RevenueCalculationService");
        const recordset = yield srv.run(SELECT.from(srv.entities.Contracts, (o) => {
            o.ID,
                o.whenSigned,
                o.amount,
                o.product_ID,
                o.revenueRecognitions((r) => {
                    r.items, r.amount, r.date, r.contract_ID;
                });
        }));
        expect(recordset).toEqual([
            {
                amount: 100,
                ID: 1,
                product_ID: 1,
                revenueRecognitions: [
                    { amount: 30, contract_ID: 1, date: "2016-01-01", items: "1" },
                    { amount: 70, contract_ID: 1, date: "2016-01-02", items: "2" },
                ],
                whenSigned: "2016-01-01",
            },
            {
                amount: 200,
                ID: 2,
                product_ID: 2,
                revenueRecognitions: [
                    { amount: 20, contract_ID: 2, date: "2016-01-03", items: "3" },
                    { amount: 30, contract_ID: 2, date: "2016-01-04", items: "4" },
                    { amount: 50, contract_ID: 2, date: "2016-01-05", items: "5" },
                    { amount: 40, contract_ID: 2, date: "2016-01-06", items: "6" },
                ],
                whenSigned: "2016-02-01",
            },
        ]);
    }));
    it("should allow to run action : calculateRecognitions", () => __awaiter(void 0, void 0, void 0, function* () {
        yield test.post("/odata/v4/revenue-calculation/Contracts(1)/calculateRecognitions");
        const { data } = yield test.get("/odata/v4/revenue-calculation/Contracts(1)?$expand=revenueRecognitions");
        expect(data.revenueRecognitions.length).toEqual(1);
        expect(data.revenueRecognitions[0].amount).toEqual(100);
        expect(data.revenueRecognitions[0].contract_ID).toEqual(1);
        expect(data.revenueRecognitions[0].date).toEqual("2016-01-01");
    }));
    it("should allow to run action : calculateRecognitions", () => __awaiter(void 0, void 0, void 0, function* () {
        yield test.post("/odata/v4/revenue-calculation/Contracts(2)/calculateRecognitions");
        const { data } = yield test.get("/odata/v4/revenue-calculation/Contracts(2)?$expand=revenueRecognitions");
        expect(data.revenueRecognitions.length).toEqual(3);
        expect(data.revenueRecognitions[0].amount).toEqual(66.67);
        expect(data.revenueRecognitions[1].amount).toEqual(66.67);
        expect(data.revenueRecognitions[2].amount).toEqual(66.66);
        expect(data.revenueRecognitions[0].contract_ID).toEqual(2);
        expect(data.revenueRecognitions[1].contract_ID).toEqual(2);
        expect(data.revenueRecognitions[2].contract_ID).toEqual(2);
        expect(data.revenueRecognitions[0].date).toEqual("2016-02-01");
        expect(data.revenueRecognitions[1].date).toEqual("2016-03-02");
        expect(data.revenueRecognitions[2].date).toEqual("2016-05-01");
    }));
});
