import { pool } from '../config/database';
import { AppError } from '../middlewares/error.middleware';
import { generateInvoicePdf } from '../utils/pdf.util';
import { sendMailWithAttachment } from './mail.service';

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

  const clienteCorreo = invoiceData?.factura?.cliente_correo || invoiceData?.pedido?.cliente_correo;

  if (!clienteCorreo) {
    throw new AppError('El cliente no tiene correo registrado para enviar la factura.', 400);
  }

  const pdf = await generateInvoicePdf(invoiceData);
  await sendMailWithAttachment({
    to: clienteCorreo,
    subject: `Resumen de tu pedido en ${invoiceData.tienda.nombre}`,
    html: `
  <p>Hola ${invoiceData.factura.cliente_nombre},</p>

  <p>Gracias por realizar tu pedido en <strong>${invoiceData.tienda.nombre}</strong>.</p>

  <p>Adjuntamos un resumen con el detalle de los productos solicitados.</p>

  <p>
    <strong>Total del pedido:</strong>
    $${Number(invoiceData.factura.total).toFixed(2)}
  </p>

  <p>
    Si tienes alguna duda, puedes responder a este correo o comunicarte con la tienda.
  </p>

  <p>Saludos,<br>${invoiceData.tienda.nombre}</p>
`,
    attachmentPath: pdf.filePath,
    attachmentName: `${invoiceData.factura.numero_factura}.pdf`
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