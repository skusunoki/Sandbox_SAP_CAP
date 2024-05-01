import cds from "@sap/cds";
import { randomUUID } from "crypto";
import assert from "power-assert";

type Contract = {
  ID: string;
  whenSigned: string;
  Amount: number;
  product: Product | undefined;
  revenueRecognitions: RevenueRecognition[] | undefined;
};

type Product = {
  ID: number;
  name: string;
  type: string;
};

type RevenueRecognition = {
  items: string;
  amount: number;
  date: string;
  contract_ID: string;
};

class TableModule {
  constructor(private _dataset: Contract[]) {
    this._dataset = _dataset;
  }
  calculateRecognitions(contractID: string): void {
    const contractRow = this._dataset.find(
      (contract) => contract.ID == contractID,
    );
    assert(
      contractRow !== undefined,
      `Contract with ID ${contractID} not found`,
    );

    if (contractRow?.revenueRecognitions == undefined) return;
    if (contractRow?.product == undefined) return;
    if (contractRow?.Amount == undefined) return;

    const amount = contractRow.Amount;
    let rr = contractRow?.revenueRecognitions;
    const product = contractRow?.product;
    console.log(product);
    if (contractRow.product.type === "WP") {
      rr = [];
      rr.push({
        items: cds.utils.uuid(),
        amount: amount,
        date: contractRow?.whenSigned,
        contract_ID: contractRow?.ID,
      });
      this._dataset[0].revenueRecognitions = rr;
    }

    if (product?.type == "SS") {
      rr = [];
      const allocation = this.allocate(amount, 3);
      rr.push({
        items: cds.utils.uuid(),
        amount: allocation[0],
        date: contractRow?.whenSigned,
        contract_ID: contractRow?.ID,
      });
      rr.push({
        items: cds.utils.uuid(),
        amount: allocation[1],
        date: contractRow?.whenSigned,
        contract_ID: contractRow?.ID,
      });
      rr.push({
        items: cds.utils.uuid(),
        amount: allocation[2],
        date: contractRow?.whenSigned,
        contract_ID: contractRow?.ID,
      });
      this._dataset[0].revenueRecognitions = rr;
    }
  }
  get contracts(): Contract[] {
    return this._dataset;
  }
  allocate(amount: number, by: number) {
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

export class RevenueCalculationService extends cds.ApplicationService {
  init() {
    this.after("READ", "Contracts", (contracts: Contract[]) => {
      return contracts;
    });
    this.on("calculateRecognitions", "Contracts", async (req: cds.Request) => {
      let dataset: Contract[] = await deepRead.call(this, req.data.contractID);
      console.log(req);
      console.log(dataset);
      const contracts = new TableModule(dataset);
      contracts.calculateRecognitions(req.data.contractID);

      await deepUpsert.call(this, contracts.contracts);
    });

    return super.init();
  }
}

async function deepRead(
  this: RevenueCalculationService,
  contractID: string,
): Promise<Contract[]> {
  return await SELECT.from(this.entities.Contracts, (o: any) => {
    o.ID,
      o.whenSigned,
      o.Amount,
      o.product((p: any) => {
        p.ID, p.name;
        p.type;
      }),
      o.revenueRecognitions((r: any) => {
        r.items, r.amount, r.date, r.contract_ID;
      });
  }).where({ ID: contractID });
}

async function deepUpsert(
  this: RevenueCalculationService,
  contracts: Contract[],
): Promise<void> {
  for (let aContract of contracts) {
    await this.update(this.entities.Contracts, aContract.ID)
      .set(aContract)
  }
  console.log(await deepRead.call(this, contracts[0].ID));
}
