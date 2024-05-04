import cds from "@sap/cds";
import assert from "power-assert";

type Contract = {
  ID: number;
  whenSigned: string;
  amount: number;
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
  contract_ID: number;
};

export class Contracts {
  private _index: number;
  constructor(private _dataset: Contract[]) {
    this._dataset = _dataset;
    this._index = 0;
  }
  public calculateRecognitions(contractID: number): void {
    this._index = this._dataset.findIndex(
      (contract) => contract.ID == contractID,
    );
    const contractRow = this._dataset[this._index];

    if (contractRow === undefined) return;
    if (contractRow.product === undefined) return;
    if (contractRow.amount === undefined) return;

    const amount = contractRow.amount;
    const product = contractRow.product;

    if (contractRow.product.type === "WP") {
      let rr: RevenueRecognition[] = [];
      rr.push({
        items: cds.utils.uuid(),
        amount: amount,
        date: contractRow.whenSigned,
        contract_ID: contractRow.ID,
      });
      this._dataset[this._index].revenueRecognitions = [...rr];
    }

    if (contractRow.product.type === "SS") {
      let rr: RevenueRecognition[] = [];
      const alloc_amount = this.allocate_amount(amount, 3);
      const alloc_date = this.allocate_date(
        new Date(contractRow?.whenSigned),
        3,
      );

      rr.push({
        items: cds.utils.uuid(),
        amount: alloc_amount[0],
        date: alloc_date[0],
        contract_ID: contractRow?.ID,
      });
      rr.push({
        items: cds.utils.uuid(),
        amount: alloc_amount[1],
        date: alloc_date[1],
        contract_ID: contractRow?.ID,
      });
      rr.push({
        items: cds.utils.uuid(),
        amount: alloc_amount[2],
        date: alloc_date[2],
        contract_ID: contractRow?.ID,
      });
      this._dataset[this._index].revenueRecognitions = [...rr];
    }

    if (product?.type === undefined) {
      assert(false, "Product type is not defined");
    }
  }
  public get contracts(): Contract[] {
    return this._dataset;
  }
  public set contracts(contracts: Contract[]) {
    this._dataset = contracts;
  }
  private allocate_amount(amount: number, by: number): number[] {
    const lowResult = Math.floor((amount / by) * 100) / 100;
    const highResult = lowResult + 0.01;
    const result = [];
    let remainder = (amount * 100) % by;
    for (let i = 0; i < by; i++) {
      result.push(i < remainder ? highResult : lowResult);
    }
    return result;
  }
  private allocate_date(date: Date, by: number): string[] {
    let rr_date = [];
    for (let i = 0; i < by; i++) {
      let rr_date_base = new Date(date);
      rr_date_base.setDate(rr_date_base.getDate() + i * 30);
      rr_date.push(rr_date_base.toISOString().split("T")[0]);
    }
    return rr_date;
  }
}

export class RevenueCalculationService extends cds.ApplicationService {
  init() {
    this.after("READ", this.entities.Contracts, (contracts: Contract[]) => {
      return contracts;
    });
    this.on("calculateRecognitions", this.entities.Contracts, async (req: cds.Request) => {
        assert (req.params !== undefined)
        const [ IdOfContract ] = req.params;
        const contracts = new Contracts(
          await deepRead.call(this, Number(IdOfContract))
        );
        contracts.calculateRecognitions(Number(IdOfContract));
        await deepUpdate.call(this, contracts.contracts);
      },
    );
    this.on("calculateRecognitions", async (req: cds.Request) => {
      assert (req.data !== undefined)
      const IdOfContract = req.data.contractID;
      const contracts = new Contracts(
        await deepRead.call(this, Number(IdOfContract))
      );
      contracts.calculateRecognitions(Number(IdOfContract));
      await deepUpdate.call(this, contracts.contracts);
    },
  );
    return super.init();
  }
}

async function deepRead(
  this: RevenueCalculationService,
  contractID: number,
): Promise<Contract[]> {
  return await SELECT.from(this.entities.Contracts, (o: any) => {
    o.ID,
      o.whenSigned,
      o.amount,
      o.product((p: any) => {
        p.ID, p.name;
        p.type;
      }),
      o.revenueRecognitions((r: any) => {
        r.items, r.amount, r.date, r.contract_ID;
      });
  }).where({ ID: contractID });
}

async function deepUpdate(
  this: RevenueCalculationService,
  contracts: Contract[],
): Promise<void> {
  for (let aContract of contracts) {
    await this.update(this.entities.Contracts, aContract.ID).set(aContract);
  }
}
