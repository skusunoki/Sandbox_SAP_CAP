"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueRecognitionImpl =
  exports.ProductImpl =
  exports.ContractImpl =
  exports.TableModule =
  exports.Contracts =
    void 0;
const cds = __importStar(require("@sap/cds"));
class Contracts extends cds.ApplicationService {
  init() {
    this.on("READ", "RecordSet", getData);
    return super.init();
  }
}
exports.Contracts = Contracts;
function getData(_req) {
  return __awaiter(this, void 0, void 0, function* () {
    let gw = yield cds.connect.to("TableGateway");
    const { Products, Contracts, RevenueRecognitions } = gw.entities;
    const contracts = yield SELECT.from(Contracts);
    const products = yield SELECT.from(Products);
    const revenueRecognitions = yield SELECT.from(RevenueRecognitions);
    const dataset = {
      Contracts: contracts,
      Products: products,
      RevenueRecognitions: revenueRecognitions,
    };
    let recordset = [];
    for (let contract of dataset.Contracts) {
      let product = dataset.Products.find((p) => p.ID === contract.product_ID);
      let revenueRecognitions = dataset.RevenueRecognitions.filter(
        (r) => r.contract_ID === contract.ID,
      );
      recordset.push({
        ID: contract.ID,
        contracts: [contract],
        products: [product],
        revenueRecognitions: revenueRecognitions,
      });
    }
    console.log(_req);
    return recordset;
  });
}
class TableModule {
  constructor(dataset, tableName) {
    this._table = dataset[tableName];
  }
  get table() {
    return this._table;
  }
}
exports.TableModule = TableModule;
class ContractImpl extends TableModule {
  constructor(dataset) {
    super(dataset, "Contracts");
  }
}
exports.ContractImpl = ContractImpl;
class ProductImpl extends TableModule {
  constructor(dataset) {
    super(dataset, "Products");
  }
}
exports.ProductImpl = ProductImpl;
class RevenueRecognitionImpl extends TableModule {
  constructor(dataset) {
    super(dataset, "RevenueRecognitions");
  }
}
exports.RevenueRecognitionImpl = RevenueRecognitionImpl;
