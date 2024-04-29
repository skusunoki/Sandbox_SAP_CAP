using {db} from '../db/schema';

service ContractService {
    entity Contracts as projection on db.Contracts;
    entity Products as projection on db.Products;
    entity RevenueRecognitions as projection on db.RevenueRecognitions;
}

service Products {
    entity ProductsView
        as select from db.Products 
        LEFT JOIN db.Contracts 
        on Contracts.product.ID = Products.ID
        { 
            Contracts.ID as ContractID,
            Products.ID as ID,
            Products.name as name,
            Products.type as type
        };
}
