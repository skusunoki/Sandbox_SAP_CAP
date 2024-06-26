using {db} from '../db/schema';
service RevenueCalculationServiceTM {
    entity Contracts as projection on db.Contracts 
    actions {
            action calculateRecognitions() ;
    }
    action calculateRecognitions(contractID: Integer);
}
