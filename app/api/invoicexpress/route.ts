import { NextRequest, NextResponse } from "next/server";
import { buildTaxPayload } from "../../../lib/invoicexpress/taxMapper";

export async function DELETE(req: NextRequest) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');
    const docType = searchParams.get('type') || "invoice_receipts"; // default

    if (!documentId) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }

    const accountName = process.env.INVOICEXPRESS_ACCOUNT_NAME || "felpmidia";
    const apiKey = process.env.INVOICEXPRESS_API_KEY || "6a9b4bdb814ac70ae33c51d7bde983037a208446";

    // Change state to canceled
    const url = `https://${accountName}.app.invoicexpress.com/${docType}/${documentId}/change-state.json?api_key=${apiKey}`;

    const docKey = docType === "invoice_receipts" ? "invoice_receipt" : "invoice";

    const payload = {
      [docKey]: {
        state: "canceled",
        message: "Cancelada pelo utilizador através da plataforma SAS"
      }
    };

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("InvoiceExpress Delete/Cancel Error response:", data);
      return NextResponse.json({
        success: false,
        error: data?.errors?.error || "Ocorreu um erro ao cancelar o documento.",
        apiRaw: data
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: "Fatura cancelada com sucesso",
      apiRaw: data
    });

  } catch (err: any) {
    console.error("InvoiceExpress Delete Route Error:", err);
    return NextResponse.json({
      success: false,
      error: "Erro do servidor ao contactar a API do InvoiceXpress: " + err.message
    }, { status: 500 });
  }
}

export async function GET() {
  const accountName = process.env.INVOICEXPRESS_ACCOUNT_NAME || "felpmidia";
  const apiKey = process.env.INVOICEXPRESS_API_KEY || "6a9b4bdb814ac70ae33c51d7bde983037a208446";

  const isConfigured = !!accountName && !!apiKey;

  return NextResponse.json({
    status: "ok",
    isConfigured,
    accountName: accountName ? `${accountName.slice(0, 3)}***` : null,
    hasApiKey: !!apiKey
  });
}

export async function POST(req: NextRequest) {
  // Disable TLS certificate rejects for developer sandbox test environments (screenpublishing / self-signed certificate environments)
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    const { patientName, patientEmail, amount, category, date, patientNif, documentType, taxType } = await req.json();

    const accountName = process.env.INVOICEXPRESS_ACCOUNT_NAME || "felpmidia";
    const apiKey = process.env.INVOICEXPRESS_API_KEY || "6a9b4bdb814ac70ae33c51d7bde983037a208446";

    if (!accountName || !apiKey) {
      return NextResponse.json(
        { error: "InvoiceExpress API integration is not fully configured in environment." },
        { status: 400 }
      );
    }

    // Format date from YYYY-MM-DD to DD/MM/YYYY for InvoiceExpress
    let formattedDate = "";
    if (date) {
      const parts = date.split("-");
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else {
        formattedDate = date; // fallback to received
      }
    } else {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      formattedDate = `${dd}/${mm}/${yyyy}`;
    }

    // Choose document endpoint: defaults to invoice (fatura) or invoice_receipt (fatura-recibo)
    // Common types in InvoiceExpress API: [invoices, invoice_receipts, simplified_invoices]
    const docType = documentType || "invoice_receipts"; 

    // Map categories or services descriptions
    const itemDescription = category || "Consulta EMDR / Psicoterapia";

    // Build standard payload representing the InvoiceExpress schema
    const docKey = docType === "invoice_receipts" ? "invoice_receipt" : "invoice";

    const clientData: any = {
      name: patientName || "Consumidor Final"
    };

    if (patientEmail) {
      clientData.email = patientEmail;
    }

    if (patientNif && patientNif.trim().length === 9) {
      clientData.fiscal_id = patientNif.trim();
    } // Omit fiscal_id altogether if none provided instead of sending 999999990, which may conflict with some account settings

    // Check if exempt based on category or client settings (we'll default to "23" as per instructions, or maybe allow it to be passed up)
    const activeTaxType = taxType || "23";
    const taxPayload = buildTaxPayload(activeTaxType);

    const payload: any = {
      [docKey]: {
        date: formattedDate,
        due_date: formattedDate,
        observations: "Emitido automaticamente via Portal de Gestão Clínica - Carolina Amores",
        client: clientData,
        ...taxPayload.invoiceFields,
        items: [
          {
            name: category || "Consulta de Psicologia Clínica",
            description: itemDescription,
            unit_price: amount ? amount.toFixed(2) : "85.00",
            quantity: "1.0",
            ...taxPayload.itemTax
          }
        ]
      }
    };

    // Required validation
    if (
      activeTaxType !== "isento" &&
      payload[docKey].tax_exemption_reason
    ) {
      delete payload[docKey].tax_exemption_reason;
    }

    let response: Response;
    let url = `https://${accountName}.app.invoicexpress.com/${docType}.json?api_key=${apiKey}`;

    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("InvoiceExpress Error response:", data);
      return NextResponse.json({
        success: false,
        error: data?.errors?.error || "Ocorreu um erro ao emitir o documento no InvoiceXpress.",
        apiRaw: data
      }, { status: response.status });
    }

    // Document was created successfully! Find sub-id/permalink
    const createdDoc = data?.invoice_receipt || data?.invoice || data?.simplified_invoice || data;
    
    return NextResponse.json({
      success: true,
      documentId: createdDoc?.id,
      sequenceNumber: createdDoc?.sequence_number || createdDoc?.id,
      permalink: createdDoc?.permalink || `https://${accountName}.app.invoicexpress.com/`,
      pdfUrl: createdDoc?.pdf || createdDoc?.permalink,
      apiRaw: data
    });

  } catch (err: any) {
    console.error("InvoiceExpress Server Route Error:", err);
    return NextResponse.json({
      success: false,
      error: "Critical server error contacting InvoiceExpress API: " + err.message
    }, { status: 500 });
  }
}
