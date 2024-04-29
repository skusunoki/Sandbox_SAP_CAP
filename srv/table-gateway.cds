using {db} from '../db/schema';
service TableGateway {
    entity Contracts as projection on db.Contracts;
    entity Products as projection on db.Products;
    entity RevenueRecognitions as projection on db.RevenueRecognitions; 
    function find(contractID: Integer) returns RecordSet;
    entity RecordSet {
        Contracts: Composition of Contracts;
        Products: Composition of Products;
        RevenueRecognitions: Composition of RevenueRecognitions;
    }
}