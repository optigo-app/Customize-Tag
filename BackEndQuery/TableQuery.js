//TagDetails............................
CREATE TABLE TagDetail (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    TagId           BIGINT NOT NULL,   -- Changed from INT to BIGINT
    TagName         NVARCHAR(100) NULL,
    TagSpId         INT NULL,
    TagUnitId       INT NULL,
    Width           DECIMAL(10,2) NULL,
    Height          DECIMAL(10,2) NULL,
    FontPt          INT NULL,
    BorderPx        INT NULL,
    BodyWidth       DECIMAL(10,2) NULL,
    TailWidth       DECIMAL(10,2) NULL,
    FontFamilyId    INT NULL,
    showBarcode     BIT NOT NULL DEFAULT 0,
    showQr          BIT NOT NULL DEFAULT 0,
    BarcodeWidth    DECIMAL(10,2) NULL,
    BarcodeHeight   DECIMAL(10,2) NULL,
    BarcodeData     NVARCHAR(100) NULL,
    QrWidth         DECIMAL(10,2) NULL,
    QrData          NVARCHAR(100) NULL,
    LableData       NVARCHAR(MAX) NULL,
    VariableData    NVARCHAR(MAX) NULL,

    CONSTRAINT FK_TagDetail_TagMaster
        FOREIGN KEY (TagId)
        REFERENCES TagMaster(Id),

    CONSTRAINT FK_TagDetail_TagSpMaster
        FOREIGN KEY (TagSpId)
        REFERENCES TagSpMaster(Id)
);

INSERT INTO TagDetail
    (TagId, TagName, TagSpId, TagUnitId,
     Width, Height, FontPt, BorderPx,
     BodyWidth, TailWidth, FontFamilyId,
     showBarcode, showQr,
     BarcodeWidth, BarcodeHeight, BarcodeData,
     QrWidth, QrData, LableData, VariableData)
VALUES
    (1, 'Tag1', 2, 1,
     10, 10, 10, 1,
     1, 7, 3,
     1, 0,
     10, 10, 'jobNo',
     10, 'designno',
     '{"LableTitle":"Job"}',
     '{"LableTitle":"Job"}'),

    (2, 'Tag2', 3, 1,
     10, 10, 10, 1,
     1, 7, 3,
     1, 0,
     10, 10, 'jobNo',
     10, 'designno',
     '{"LableTitle":"Job"}',
     '{"LableTitle":"Job"}');


//TagVaribales..........................
CREATE TABLE TagVariable (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    TagMasterId     BIGINT NOT NULL,   -- INT se BIGINT
    VariableName     NVARCHAR(100) NOT NULL,
    SpcolumnName    NVARCHAR(100) NULL,
    Unit            NVARCHAR(20) NULL,
    FontSize        INT NULL,
    Weight          INT NULL,
    Decimal         INT NOT NULL DEFAULT 0,
    Trim            INT NOT NULL DEFAULT 0,
    RoundOff        INT NOT NULL DEFAULT 0,

    CONSTRAINT FK_TagVariable_TagMaster
        FOREIGN KEY (TagMasterId)
        REFERENCES TagMaster(Id)
);

INSERT INTO TagVariable
    (TagMasterId, VaribleName, SpcolumnName, Unit,
     FontSize, Weight, Decimal, Trim, RoundOff)
VALUES
    (1, '{{stockBarcode}}', 'JobNo',    'Gm', 10, 500, 0, 0, 1),
    (1, '{{MetalWt}}',     'MetalWt',  'Gm', 10, 500, 0, 0, 1),
    (1, '{{Gwt}}',         'GrossWt',  'Gm', 10, 500, 0, 0, 1),
    (2, '{{jobNo}}',       'JobNo',    'Gm', 12, 500, 0, 1, 0),
    (2, '{{MetalWt}}',     'MetalWt',  'Gm', 10, 600, 0, 0, 1),
    (2, '{{MetalColor}}', 'MetalColor','Gm', 10, 700, 0, 0, 1);


//TagLabel......................
CREATE TABLE TagLable (
    id              INT           IDENTITY(1,1) PRIMARY KEY,
    TagSpMasterId   INT           NOT NULL,
    LableTitle      NVARCHAR(100) NOT NULL,
    FontSize        INT           NULL,
    Weight          INT           NULL,
    Italic          BIT           NOT NULL DEFAULT 0,

    CONSTRAINT FK_TagLable_TagSpMaster FOREIGN KEY (TagSpMasterId)
        REFERENCES TagSpMaster(id)
);

INSERT INTO TagLable
    (TagSpMasterId, LableTitle, FontSize, Weight, Italic)
VALUES
    (1, 'JobNo',    10, 600, 1),
    (1, 'MetalWt',  12, 500, 1),
    (1, 'GrossWt',  12, 500, 0),
    (2, 'JobNo',    10, 500, 0),
    (2, 'MetalWt',  10, 500, 0),
    (2, 'MetalColor',10, 500, 1);





    TagSpMaster
tagspmaster_get
json{
    "con": "{\"mode\":\"tagspmaster_get\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"SearchText\":\"\"}",
    "f": "TagManagement"
}
tagspmaster_getbyid
json{
    "con": "{\"mode\":\"tagspmaster_getbyid\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1}",
    "f": "TagManagement"
}
tagspmaster_add
json{
    "con": "{\"mode\":\"tagspmaster_add\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpName\":\"GetProductDetails\"}",
    "f": "TagManagement"
}
tagspmaster_edit
json{
    "con": "{\"mode\":\"tagspmaster_edit\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1,\"TagSpName\":\"GetProductDetailsUpdated\"}",
    "f": "TagManagement"
}
tagspmaster_delete
json{
    "con": "{\"mode\":\"tagspmaster_delete\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1}",
    "f": "TagManagement"
}

TagSpColumn
tagspcolumn_get
json{
    "con": "{\"mode\":\"tagspcolumn_get\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1}",
    "f": "TagManagement"
}
tagspcolumn_getbyid
json{
    "con": "{\"mode\":\"tagspcolumn_getbyid\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpColumnId\":1}",
    "f": "TagManagement"
}
tagspcolumn_add
json{
    "con": "{\"mode\":\"tagspcolumn_add\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1,\"ColumnName\":\"item_code\",\"DisplayName\":\"Item Code\"}",
    "f": "TagManagement"
}
tagspcolumn_edit
json{
    "con": "{\"mode\":\"tagspcolumn_edit\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpColumnId\":1,\"ColumnName\":\"item_code\",\"DisplayName\":\"Item Code Updated\"}",
    "f": "TagManagement"
}
tagspcolumn_delete
json{
    "con": "{\"mode\":\"tagspcolumn_delete\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpColumnId\":1}",
    "f": "TagManagement"
}

TagLable
taglable_get
json{
    "con": "{\"mode\":\"taglable_get\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1}",
    "f": "TagManagement"
}
taglable_getbyid
json{
    "con": "{\"mode\":\"taglable_getbyid\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagLableId\":1}",
    "f": "TagManagement"
}
taglable_add
json{
    "con": "{\"mode\":\"taglable_add\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1,\"LableTitle\":\"Item Name\",\"FontSize\":12,\"Weight\":400,\"Italic\":0}",
    "f": "TagManagement"
}
taglable_edit
json{
    "con": "{\"mode\":\"taglable_edit\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagLableId\":1,\"LableTitle\":\"Item Name Updated\",\"FontSize\":14,\"Weight\":700,\"Italic\":1}",
    "f": "TagManagement"
}
taglable_delete
json{
    "con": "{\"mode\":\"taglable_delete\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagLableId\":1}",
    "f": "TagManagement"
}Sonnet 4.6 LowClaude is AI and can make mistake+











//All/////////////////////////////////////////

TagMaster
tagmaster_get
json{
    "con": "{\"mode\":\"tagmaster_get\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"SearchText\":\"\",\"PageSize\":10,\"CurrentPage\":1}",
    "f": "TagManagement"
}
tagmaster_getbyid
json{
    "con": "{\"mode\":\"tagmaster_getbyid\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagMasterId\":1}",
    "f": "TagManagement"
}
tagmaster_add
json{
    "con": "{\"mode\":\"tagmaster_add\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagName\":\"Product Tag\",\"UniqueNo\":\"TAG001\",\"HtmlTemplate\":\"<div>{{name}}</div>\",\"SpName\":\"GetProductData\",\"IsBarcodeQR\":0,\"deafultTag\":0}",
    "f": "TagManagement"
}
tagmaster_edit
json{
    "con": "{\"mode\":\"tagmaster_edit\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagMasterId\":1,\"TagName\":\"Product Tag Updated\",\"UniqueNo\":\"TAG001\",\"HtmlTemplate\":\"<div>{{name}}</div>\",\"SpName\":\"GetProductData\",\"deafultTag\":1}",
    "f": "TagManagement"
}
tagmaster_delete
json{
    "con": "{\"mode\":\"tagmaster_delete\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagMasterId\":1}",
    "f": "TagManagement"
}

TagDetail
tagdetail_get
json{
    "con": "{\"mode\":\"tagdetail_get\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagId\":1}",
    "f": "TagManagement"
}
tagdetail_getbyid
json{
    "con": "{\"mode\":\"tagdetail_getbyid\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagDetailId\":1}",
    "f": "TagManagement"
}
tagdetail_add
json{
    "con": "{\"mode\":\"tagdetail_add\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagId\":1,\"TagName\":\"Size Label\",\"TagSpId\":2,\"TagUnitId\":1,\"Width\":100.00,\"Height\":50.00,\"FontPt\":12,\"BorderPx\":1,\"BodyWidth\":80.00,\"TailWidth\":20.00,\"FontFamilyId\":1,\"showBarcode\":1,\"showQr\":0,\"BarcodeWidth\":40.00,\"BarcodeHeight\":20.00,\"BarcodeData\":\"ItemCode\",\"QrWidth\":0,\"QrData\":\"\",\"LableData\":\"\",\"VariableData\":\"\"}",
    "f": "TagManagement"
}
tagdetail_edit
json{
    "con": "{\"mode\":\"tagdetail_edit\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagDetailId\":1,\"TagName\":\"Size Label Updated\",\"TagSpId\":2,\"TagUnitId\":1,\"Width\":120.00,\"Height\":60.00,\"FontPt\":14,\"BorderPx\":2,\"BodyWidth\":90.00,\"TailWidth\":30.00,\"FontFamilyId\":1,\"showBarcode\":1,\"showQr\":1,\"BarcodeWidth\":40.00,\"BarcodeHeight\":20.00,\"BarcodeData\":\"ItemCode\",\"QrWidth\":30.00,\"QrData\":\"ItemUrl\",\"LableData\":\"\",\"VariableData\":\"\"}",
    "f": "TagManagement"
}
tagdetail_delete
json{
    "con": "{\"mode\":\"tagdetail_delete\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagDetailId\":1}",
    "f": "TagManagement"
}

TagVariable
tagvariable_get
json{
    "con": "{\"mode\":\"tagvariable_get\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagMasterId\":1}",
    "f": "TagManagement"
}
tagvariable_getbyid
json{
    "con": "{\"mode\":\"tagvariable_getbyid\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagVariableId\":1}",
    "f": "TagManagement"
}
tagvariable_add
json{
    "con": "{\"mode\":\"tagvariable_add\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagMasterId\":1,\"VariableName\":\"ItemName\",\"SpColumnName\":\"item_name\",\"Unit\":\"pcs\",\"FontSize\":12,\"Weight\":400,\"Decimal\":2,\"Trim\":0,\"RoundOff\":0}",
    "f": "TagManagement"
}
tagvariable_edit
json{
    "con": "{\"mode\":\"tagvariable_edit\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagVariableId\":1,\"VariableName\":\"ItemName\",\"SpColumnName\":\"item_name\",\"Unit\":\"pcs\",\"FontSize\":14,\"Weight\":700,\"Decimal\":2,\"Trim\":1,\"RoundOff\":1}",
    "f": "TagManagement"
}
tagvariable_delete
json{
    "con": "{\"mode\":\"tagvariable_delete\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagVariableId\":1}",
    "f": "TagManagement"
}

TagSpMaster
tagspmaster_get
json{
    "con": "{\"mode\":\"tagspmaster_get\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"SearchText\":\"\"}",
    "f": "TagManagement"
}
tagspmaster_getbyid
json{
    "con": "{\"mode\":\"tagspmaster_getbyid\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1}",
    "f": "TagManagement"
}
tagspmaster_add
json{
    "con": "{\"mode\":\"tagspmaster_add\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpName\":\"GetProductDetails\"}",
    "f": "TagManagement"
}
tagspmaster_edit
json{
    "con": "{\"mode\":\"tagspmaster_edit\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1,\"TagSpName\":\"GetProductDetailsUpdated\"}",
    "f": "TagManagement"
}
tagspmaster_delete
json{
    "con": "{\"mode\":\"tagspmaster_delete\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1}",
    "f": "TagManagement"
}

TagSpColumn
tagspcolumn_get
json{
    "con": "{\"mode\":\"tagspcolumn_get\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1}",
    "f": "TagManagement"
}
tagspcolumn_getbyid
json{
    "con": "{\"mode\":\"tagspcolumn_getbyid\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpColumnId\":1}",
    "f": "TagManagement"
}
tagspcolumn_add
json{
    "con": "{\"mode\":\"tagspcolumn_add\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1,\"ColumnName\":\"item_code\",\"DisplayName\":\"Item Code\"}",
    "f": "TagManagement"
}
tagspcolumn_edit
json{
    "con": "{\"mode\":\"tagspcolumn_edit\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpColumnId\":1,\"ColumnName\":\"item_code\",\"DisplayName\":\"Item Code Updated\"}",
    "f": "TagManagement"
}
tagspcolumn_delete
json{
    "con": "{\"mode\":\"tagspcolumn_delete\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpColumnId\":1}",
    "f": "TagManagement"
}

TagLable
taglable_get
json{
    "con": "{\"mode\":\"taglable_get\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1}",
    "f": "TagManagement"
}
taglable_getbyid
json{
    "con": "{\"mode\":\"taglable_getbyid\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagLableId\":1}",
    "f": "TagManagement"
}
taglable_add
json{
    "con": "{\"mode\":\"taglable_add\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagSpMasterId\":1,\"LableTitle\":\"Item Name\",\"FontSize\":12,\"Weight\":400,\"Italic\":0}",
    "f": "TagManagement"
}
taglable_edit
json{
    "con": "{\"mode\":\"taglable_edit\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagLableId\":1,\"LableTitle\":\"Item Name Updated\",\"FontSize\":14,\"Weight\":700,\"Italic\":1}",
    "f": "TagManagement"
}
taglable_delete
json{
    "con": "{\"mode\":\"taglable_delete\",\"appuserid\":\"user@eg.com\",\"IPAddress\":\"103.206.139.196\"}",
    "p": "{\"TagLableId\":1}",
    "f": "TagManagement"
}