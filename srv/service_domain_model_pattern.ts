import cds from "@sap/cds";
import assert from "power-assert";

class Product {
  private _ID: number;
  private _name: string;
  private _type: string;
  private _recognitionStrategy: RecognitionsStrategy;

  constructor(ID: number, name: string, type: string, recognitionStrategy: RecognitionsStrategy) {
    this._ID = ID;
    this._name = name;
    this._type = type;
    this._recognitionStrategy = recognitionStrategy;
  }
  public calculateRecognitions(contract: Contract): RevenueRecognition[] {
    return this._recognitionStrategy.calculateRecognitions(contract);
  }
  public static factoryWordProcessor(): Product {
    return new Product(1, "Word Processor", "WP", new CompletedRecognitionsStrategy());
  }
  public static factorySpreadsheet(): Product {
    return new Product(2, "Spreadsheet", "SS", new ThreeWayRecognitionsStrategy(30, 60));
  }
  public static factoryUndefinedProduct(): Product {
    throw new Error("Product type is not defined");
  }
  public static factoryProduct(type: "WP" | "SS" | undefined ): Product {
    return type === "WP" ? Product.factoryWordProcessor() : type === "SS" ? Product.factorySpreadsheet() : Product.factoryUndefinedProduct();
  }
  get type(): string {
    return this._type;
  }
  get ID(): number {
    return this._ID;
  }
  get name(): string {
    return this._name;
  }
}

interface RecognitionsStrategy {
  calculateRecognitions(contract: Contract): RevenueRecognition[] 
}

class CompletedRecognitionsStrategy implements RecognitionsStrategy {
  calculateRecognitions(contract: Contract): RevenueRecognition[] {
    return [new RevenueRecognition(contract.amount, contract.whenSigned)]
  }
}

class ThreeWayRecognitionsStrategy implements RecognitionsStrategy {
  private _firstRecognitionOffset: number;
  private _secondRecognitionOffset: number;

  constructor(firstRecognitionOffset: number, secondRecognitionOffset: number) {
    this._firstRecognitionOffset = firstRecognitionOffset;
    this._secondRecognitionOffset = secondRecognitionOffset;
  }
  calculateRecognitions(contract: Contract): RevenueRecognition[] {
    let rr: RevenueRecognition[] = [];
    const alloc_amount = this.allocate_amount(contract.amount, 3);

    return [
      new RevenueRecognition(alloc_amount[0], this.offsetDate(contract.whenSigned, 0)),
      new RevenueRecognition(alloc_amount[1], this.offsetDate(contract.whenSigned, this._firstRecognitionOffset)),
      new RevenueRecognition(alloc_amount[2], this.offsetDate(contract.whenSigned, this._secondRecognitionOffset))
    ];
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
  private offsetDate(baseDate: string, offsetDate: number): string {
    let rr_date_base = new Date(baseDate);
    rr_date_base.setDate(rr_date_base.getDate() + offsetDate);
    return rr_date_base.toISOString().split("T")[0];
  }
}

class RevenueRecognition {
  private _amount: number;
  private _date: string;
  constructor(amount: number, date: string) {
    this._amount = amount;
    this._date = date;
  }
  get amount(): number {
    return this._amount;
  }
  get date(): string {
    return this._date;
  }
}

class Contract {
  private _ID: number;
  private _whenSigned: string;
  private _amount: number;
  private _product: Product;
  private _revenueRecognitions: RevenueRecognition[] | undefined;
  constructor( ID: number, whenSigned: string, amount: number, product: Product, revenueRecognitions: RevenueRecognition[] | undefined) {
    this._ID = ID;
    this._whenSigned = whenSigned;
    this._amount = amount;
    this._product = product;
    this._revenueRecognitions = revenueRecognitions;
  }
  public calculateRecognitions(): void {
      let rr = this.product.calculateRecognitions(this);
      this._revenueRecognitions = [...rr];
  }
  public get ID() {
    return this._ID;
  }
  get whenSigned(): string {
    return this._whenSigned;
  }
  get amount(): number {
    return this._amount;
  }
  get product(): Product {
    return this._product;
  }
  get revenueRecognitions(): RevenueRecognition[] | undefined{
    return this._revenueRecognitions;
  }
}

export class ContractRepository {
  private srv: RevenueCalculationServiceDM;
  constructor( srv: RevenueCalculationServiceDM ) {
    this.srv = srv;
  }
  public async read(contractID: number): Promise<Contract> {
    const dataset = await SELECT.from(this.srv.entities.Contracts)
    .where({ ID: contractID })
    .columns( (o: any) => {
      o.ID,
        o.whenSigned,
        o.amount,
        o.product((p: any) => {
          p.type;
        }),
        o.revenueRecognitions((r: any) => {
          r.items, r.amount, r.date, r.contract_ID;
        });
    });
    return new Contract(
      dataset[0].ID,
      dataset[0].whenSigned,
      dataset[0].amount,
      Product.factoryProduct(dataset[0].product.type),
      dataset[0].revenueRecognitions.map((r: any) => new RevenueRecognition(r.amount, r.date))
    );
  }

  public async write( contract: Contract): Promise<void> {
    let rr = contract.revenueRecognitions?.map((r) => { return {items: cds.utils.uuid(), amount: r.amount, date: r.date, contract_ID: contract.ID} } );
    await this.srv.update(this.srv.entities.Contracts, contract.ID).set({
      ID: contract.ID,
      whenSigned: contract.whenSigned,
      amount: contract.amount,
      product: {ID: contract.product.ID, name: contract.product.name, type: contract.product.type},
      revenueRecognitions: rr
    });
  }
}

export class RevenueCalculationServiceDM extends cds.ApplicationService {
  init() {
    this.after("READ", this.entities.Contracts, (contracts: Contract[]) => {
      return contracts;
    });
    this.on("calculateRecognitions", this.entities.Contracts, async (req: cds.Request) => {
        assert (req.params !== undefined)
        const [ IdOfContract ] = req.params;
        const repository = new ContractRepository(this)
        const aContract = await repository.read(Number(IdOfContract));
        console.log (aContract);
        aContract.calculateRecognitions();
        await repository.write(aContract);
      },
    );
    this.on("calculateRecognitions", async (req: cds.Request) => {
      assert (req.data !== undefined)
      const IdOfContract = req.data.contractID;
      const contracts = new ContractRepository(this)
      const aContract = await contracts.read(Number(IdOfContract));
      aContract.calculateRecognitions();
      await contracts.write(aContract);
    },
  );
    return super.init();
  }
}
