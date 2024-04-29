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
exports.ContractService = void 0;
const cds = __importStar(require("@sap/cds"));
class ContractService extends cds.ApplicationService {
    init() {
        this.on("READ", "Contracts", getContracts);
        this.on("READ", "Products", getProducts);
        this.on("READ", "RevenueRecognitions", getRevenueRecognitions);
        return super.init();
    }
}
exports.ContractService = ContractService;
function getContracts(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const gw = yield cds.connect.to("TableGateway");
        const [args] = req.params.length === 0 ? [1] : req.params;
        const recordset = yield gw.send("find", { contractID: args });
        return recordset.Contracts;
    });
}
function getProducts(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const gw = yield cds.connect.to("TableGateway");
        const [args] = req.params.length === 0 ? [1] : req.params;
        const recordset = yield gw.send("find", { contractID: args });
        console.log(recordset);
        return recordset.Products;
    });
}
function getRevenueRecognitions(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const gw = yield cds.connect.to("TableGateway");
        const [args] = req.params.length === 0 ? [1] : req.params;
        const recordset = yield gw.send("find", { contractID: args });
        console.log(recordset);
        return recordset.RevenueRecognitions;
    });
}
