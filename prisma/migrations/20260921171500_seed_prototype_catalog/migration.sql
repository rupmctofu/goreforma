INSERT INTO "PriceCatalog" (
    "id",
    "version",
    "status",
    "region",
    "source",
    "methodology"
)
VALUES (
    'prototype-catalog-0',
    'prototype-0',
    'PROTOTYPE',
    'nacional',
    'PROTOTYPE',
    'Datos provisionales para validar el flujo del producto; no son precios de mercado.'
)
ON CONFLICT ("version") DO NOTHING;
