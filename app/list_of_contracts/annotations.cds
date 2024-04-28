using Contracts as service from '../../srv/service';
annotate service.RecordSet with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'ID',
                Value : ID,
            },
            {
                $Type : 'UI.DataField',
                Label : 'whenSigned',
                Value : whenSigned,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Amount',
                Value : Amount,
            },
            {
                $Type : 'UI.DataField',
                Label : 'ProductName',
                Value : ProductName,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'ID',
            Value : ID,
        },
        {
            $Type : 'UI.DataField',
            Label : 'whenSigned',
            Value : whenSigned,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Amount',
            Value : Amount,
        },
        {
            $Type : 'UI.DataField',
            Label : 'ProductName',
            Value : ProductName,
        },
    ],
);

