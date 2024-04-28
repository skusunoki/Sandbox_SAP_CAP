using {db} from '../db/schema';

service Contracts {
    entity RecordSet {
        key ID: Integer;
        contracts : Composition of many db.Contracts;
        products : Composition of many db.Products;
        revenueRecognitions : Composition of many db.RevenueRecognitions;
    } 
}

service TableGateway {
    entity Contracts as projection on db.Contracts;
    entity Products as projection on db.Products;
    entity RevenueRecognitions as projection on db.RevenueRecognitions; 
}