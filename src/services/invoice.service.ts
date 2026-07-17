import { pool } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { generateInvoicePdf } from '../utils/pdf.util';
import { sendMailWithAttachment } from './mail.service';

function money(value: string | number) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function getStoreName(invoiceData: any) {
  return (
    invoiceData?.tienda?.nombre_comercial ||
    invoiceData?.tienda?.nombre ||
    'Tienda'
  );
}

function getClientName(invoiceData: any) {
  return (
    invoiceData?.factura?.cliente_nombre ||
    invoiceData?.pedido?.cliente_nombre ||
    'Cliente'
  );
}

function getInvoiceNumber(invoiceData: any) {
  return invoiceData?.factura?.numero_factura || 'factura';
}

export async function getInvoiceByOrder(
  idUsuario: string,
  idPedido: string
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_factura_pedido_vendedor_api($1, $2) AS data
    `,
    [idUsuario, idPedido]
  );

  return result.rows[0].data;
}

export async function generateAndSendInvoiceByOrder(
  idUsuario: string,
  idPedido: string
) {
  const invoiceData = await getInvoiceByOrder(idUsuario, idPedido);

  if (!invoiceData?.factura) {
    throw new AppError('No se encontró la factura del pedido.', 404);
  }

  const clienteCorreo =
    invoiceData?.factura?.cliente_correo ||
    invoiceData?.pedido?.cliente_correo;

  if (!clienteCorreo) {
    throw new AppError(
      'El cliente no tiene correo registrado para enviar la factura.',
      400
    );
  }

  const tiendaNombre = getStoreName(invoiceData);
  const clienteNombre = getClientName(invoiceData);
  const numeroFactura = getInvoiceNumber(invoiceData);

  const pdf = await generateInvoicePdf(invoiceData);
  const codigoSeguimiento =
    invoiceData?.pedido?.codigo_seguimiento ||
    invoiceData?.pedido?.id_pedido ||
    'No registrado';

  await sendMailWithAttachment({
    to: clienteCorreo,
    subject: `Factura ${numeroFactura} - ${tiendaNombre}`,
    html: `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Hola ${clienteNombre},</h2>

      <p>
        Gracias por realizar tu pedido en
        <strong>${tiendaNombre}</strong>.
      </p>

      <p>
        Adjuntamos la factura correspondiente a tu compra.
      </p>

      <div style="
        margin: 20px 0;
        padding: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background-color: #f9fafb;
      ">
        <p style="margin: 0;">
          <strong>Número de factura:</strong> ${numeroFactura}
        </p>

        <p style="margin: 6px 0 0;">
          <strong>Código de seguimiento:</strong> ${codigoSeguimiento}
        </p>

        <p style="margin: 6px 0 0;">
          <strong>Total del pedido:</strong>
          ${money(invoiceData.factura.total)}
        </p>
      </div>

      <p>
        Puedes usar el código de seguimiento para consultar el estado de tu pedido.
      </p>

      <p>
        Si tienes alguna duda sobre tu pedido, puedes responder a este correo
        o comunicarte directamente con la tienda.
      </p>

      <p style="margin-top: 24px;">
        Saludos,<br />
        <strong>${tiendaNombre}</strong>
      </p>
    </div>
  `,
    attachmentPath: pdf.filePath,
    attachmentName: `${numeroFactura}.pdf`
  });

  const updated = await pool.query(
    `
    SELECT ventas.fn_marcar_factura_enviada_api($1, $2, $3) AS data
    `,
    [
      idUsuario,
      invoiceData.factura.id_factura,
      pdf.publicUrl
    ]
  );

  return {
    factura: updated.rows[0].data,
    pdf_url: pdf.publicUrl
  };
}