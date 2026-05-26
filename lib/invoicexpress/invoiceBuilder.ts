import { buildTaxPayload } from "./taxMapper";

export function buildInvoice(data: any) {
  const taxPayload = buildTaxPayload(data.taxType);

  return {
    invoice: {
      date: new Date().toISOString().split("T")[0],
      due_date: data.dueDate,
      client: {
        name: data.client.name,
        email: data.client.email,
        fiscal_id: data.client.fiscalId
      },
      ...taxPayload.invoiceFields,
      items: data.items.map((item: any) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.price,
        ...taxPayload.itemTax
      }))
    }
  };
}
