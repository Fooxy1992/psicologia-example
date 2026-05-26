export function buildTaxPayload(taxType: string) {
  switch (taxType) {
    case "23":
      return {
        itemTax: {
          tax: {
            name: "IVA 23%"
          }
        },
        invoiceFields: {}
      };

    case "6":
      return {
        itemTax: {
          tax: {
            name: "IVA 6%"
          }
        },
        invoiceFields: {}
      };

    case "isento":
      return {
        itemTax: {
          tax: {
            name: "IVA Isento"
          }
        },
        invoiceFields: {
          tax_exemption_reason: "M01"
        }
      };

    default:
      return {
        itemTax: {
          tax: {
            name: "IVA 23%"
          }
        },
        invoiceFields: {}
      };
  }
}
