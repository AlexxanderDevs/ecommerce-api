import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface InvoiceData {
  tienda: {
    nombre?: string;
    nombre_comercial?: string;
    whatsapp?: string;
    correo_contacto?: string;
    direccion?: string;
    logo_url?: string;
    etiqueta_url?: string;
  };
  pedido: {
    id_pedido?: string;
    codigo_seguimiento?: string | null;
    cliente_nombre: string;
    cliente_correo?: string;
    cliente_telefono?: string;
    cliente_direccion?: string;
    observacion?: string;
  };
  factura: {
    id_factura: string;
    numero_factura: string;
    subtotal: string | number;
    descuento: string | number;
    total: string | number;
    fecha_emision: string;
  };
  detalles: Array<{
    nombre_producto: string;
    talla?: string;
    color?: string;
    cantidad: number;
    precio_unitario: string | number;
    subtotal: string | number;
  }>;
}

type PdfDoc = InstanceType<typeof PDFDocument>;

const COLORS = {
  primary: '#0f172a',
  secondary: '#334155',
  muted: '#64748b',
  light: '#f8fafc',
  border: '#e2e8f0',
  green: '#16a34a'
};

function money(value: string | number): string {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

function getStoreName(data: InvoiceData): string {
  return data.tienda.nombre_comercial || data.tienda.nombre || 'Tienda';
}

function getTrackingCode(data: InvoiceData): string {
  return (
    data.pedido.codigo_seguimiento ||
    data.pedido.id_pedido ||
    'No registrado'
  );
}

function safeFileName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function publicPathToLocalPath(publicPath?: string): string | null {
  if (!publicPath) return null;

  const cleanPath = publicPath.startsWith('/')
    ? publicPath.slice(1)
    : publicPath;

  const fullPath = path.join(process.cwd(), cleanPath);

  if (!fs.existsSync(fullPath)) return null;

  return fullPath;
}

function drawImageSafe(
  doc: PdfDoc,
  imagePath: string | null,
  x: number,
  y: number,
  options: any
) {
  if (!imagePath) return;

  try {
    doc.image(imagePath, x, y, options);
  } catch {
    // Si la imagen no es compatible, se omite para no romper el PDF.
  }
}

function drawFooter(doc: PdfDoc, pageNumber: number) {
  doc
    .strokeColor(COLORS.border)
    .moveTo(45, 790)
    .lineTo(550, 790)
    .stroke();

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(COLORS.muted)
    .text('Ecommerce Multi-Tienda', 45, 805)
    .text(`Página ${pageNumber}`, 450, 805, {
      width: 100,
      align: 'right'
    });
}

function drawHeader(doc: PdfDoc, data: InvoiceData) {
  const logoPath = publicPathToLocalPath(data.tienda.logo_url);
  const etiquetaPath = publicPathToLocalPath(data.tienda.etiqueta_url);

  doc
    .roundedRect(45, 35, 505, 95, 16)
    .fillAndStroke(COLORS.light, COLORS.border);

  drawImageSafe(doc, logoPath, 60, 50, {
    fit: [65, 65],
    align: 'center',
    valign: 'center'
  });

  doc
    .font('Helvetica-Bold')
    .fontSize(18)
    .fillColor(COLORS.primary)
    .text(getStoreName(data), 140, 50, {
      width: 260
    });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(`WhatsApp: ${data.tienda.whatsapp || 'No registrado'}`, 140, 76)
    .text(`Correo: ${data.tienda.correo_contacto || 'No registrado'}`, 140, 91)
    .text(`Dirección: ${data.tienda.direccion || 'No registrada'}`, 140, 106, {
      width: 280
    });

  if (etiquetaPath) {
    drawImageSafe(doc, etiquetaPath, 465, 52, {
      fit: [55, 55],
      align: 'center',
      valign: 'center'
    });
  } else {
    doc
      .font('Helvetica-Bold')
      .fontSize(21)
      .fillColor(COLORS.primary)
      .text('FACTURA', 420, 58, {
        width: 105,
        align: 'center'
      });
  }

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.primary)
    .text('COMPROBANTE DE PEDIDO', 405, 108, {
      width: 130,
      align: 'center'
    });
}

function drawInvoiceInfo(doc: PdfDoc, data: InvoiceData) {
  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(COLORS.primary)
    .text('Factura', 45, 155);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text('Documento generado desde la tienda virtual.', 45, 182);

  doc
    .roundedRect(345, 150, 205, 110, 14)
    .fillAndStroke('#ffffff', COLORS.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text('NÚMERO DE FACTURA', 360, 165);

  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(COLORS.primary)
    .text(data.factura.numero_factura, 360, 184, {
      width: 175
    });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(formatDate(data.factura.fecha_emision), 360, 204, {
      width: 175
    });
  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(COLORS.muted)
    .text('CÓDIGO DE SEGUIMIENTO', 360, 225);

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor(COLORS.primary)
    .text(getTrackingCode(data), 360, 240, {
      width: 175
    });
}

function drawLabelValue(
  doc: PdfDoc,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) {
  doc
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .fillColor(COLORS.muted)
    .text(label, x, y, { width });

  doc
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor(COLORS.primary)
    .text(value || 'No registrado', x, y + 12, {
      width,
      height: 28
    });
}

function drawClientBlocks(doc: PdfDoc, data: InvoiceData) {
  const y = 285;

  doc
    .roundedRect(45, y, 240, 120, 14)
    .fillAndStroke('#ffffff', COLORS.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(COLORS.primary)
    .text('Datos del cliente', 60, y + 15);

  drawLabelValue(doc, 'Cliente', data.pedido.cliente_nombre, 60, y + 42, 200);
  drawLabelValue(
    doc,
    'Correo',
    data.pedido.cliente_correo || 'No registrado',
    60,
    y + 70,
    200
  );
  drawLabelValue(
    doc,
    'Teléfono',
    data.pedido.cliente_telefono || 'No registrado',
    60,
    y + 98,
    200
  );

  doc
    .roundedRect(310, y, 240, 120, 14)
    .fillAndStroke('#ffffff', COLORS.border);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(COLORS.primary)
    .text('Datos de entrega', 325, y + 15);

  drawLabelValue(
    doc,
    'Dirección',
    data.pedido.cliente_direccion || 'No registrada',
    325,
    y + 42,
    200
  );

  drawLabelValue(
    doc,
    'Observación',
    data.pedido.observacion || 'Sin observación',
    325,
    y + 80,
    200
  );
}

function drawTableHeader(doc: PdfDoc, y: number) {
  doc
    .roundedRect(45, y, 505, 28, 8)
    .fill(COLORS.primary);

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#ffffff')
    .text('Producto', 60, y + 10, { width: 230 })
    .text('Cant.', 310, y + 10, { width: 45, align: 'center' })
    .text('Precio', 370, y + 10, { width: 70, align: 'right' })
    .text('Subtotal', 455, y + 10, { width: 75, align: 'right' });
}

function drawDetailsTitle(doc: PdfDoc, y: number, continuation = false) {
  doc
    .font('Helvetica-Bold')
    .fontSize(13)
    .fillColor(COLORS.primary)
    .text(
      continuation ? 'Detalle del pedido continuación' : 'Detalle del pedido',
      45,
      y
    );
}

function drawDetailsTable(
  doc: PdfDoc,
  data: InvoiceData,
  startY: number,
  page: { value: number }
) {
  let y = startY;

  drawDetailsTitle(doc, y);
  y += 25;

  drawTableHeader(doc, y);
  y += 38;

  data.detalles.forEach((item, index) => {
    const variante = [
      item.talla ? `Talla: ${item.talla}` : null,
      item.color ? `Color: ${item.color}` : null
    ]
      .filter(Boolean)
      .join(' | ');

    const productText = variante
      ? `${item.nombre_producto}\n${variante}`
      : item.nombre_producto;

    const textHeight = doc.heightOfString(productText, {
      width: 230
    });

    const rowHeight = Math.max(38, textHeight + 18);

    if (y + rowHeight > 735) {
      drawFooter(doc, page.value);
      doc.addPage();
      page.value += 1;

      y = 50;
      drawDetailsTitle(doc, y, true);
      y += 25;
      drawTableHeader(doc, y);
      y += 38;
    }

    if (index % 2 === 0) {
      doc
        .roundedRect(45, y - 8, 505, rowHeight, 8)
        .fill('#f8fafc');
    }

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.primary)
      .text(productText, 60, y, {
        width: 230
      });

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.primary)
      .text(String(item.cantidad), 310, y, {
        width: 45,
        align: 'center'
      })
      .text(money(item.precio_unitario), 370, y, {
        width: 70,
        align: 'right'
      });

    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(COLORS.primary)
      .text(money(item.subtotal), 455, y, {
        width: 75,
        align: 'right'
      });

    y += rowHeight + 6;
  });

  return y;
}

function drawTotals(
  doc: PdfDoc,
  data: InvoiceData,
  startY: number,
  page: { value: number }
) {
  let y = startY;

  if (y + 135 > 755) {
    drawFooter(doc, page.value);
    doc.addPage();
    page.value += 1;
    y = 60;
  }

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(
      'Este comprobante corresponde al pedido realizado en la tienda virtual.',
      45,
      y + 38,
      {
        width: 250,
        lineGap: 3
      }
    );

  doc
    .roundedRect(335, y + 10, 215, 110, 14)
    .fillAndStroke('#ffffff', COLORS.border);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLORS.secondary)
    .text('Subtotal', 355, y + 30)
    .text(money(data.factura.subtotal), 455, y + 30, {
      width: 70,
      align: 'right'
    });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(COLORS.secondary)
    .text('Descuento', 355, y + 52)
    .text(money(data.factura.descuento), 455, y + 52, {
      width: 70,
      align: 'right'
    });

  doc
    .moveTo(355, y + 77)
    .lineTo(525, y + 77)
    .strokeColor(COLORS.border)
    .stroke();

  doc
    .font('Helvetica-Bold')
    .fontSize(15)
    .fillColor(COLORS.green)
    .text('TOTAL', 355, y + 88)
    .text(money(data.factura.total), 430, y + 88, {
      width: 95,
      align: 'right'
    });

  return y + 145;
}

export async function generateInvoicePdf(data: InvoiceData): Promise<{
  filePath: string;
  publicUrl: string;
}> {
  const folder = path.join(process.cwd(), 'uploads', 'invoices');

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const invoiceNumber = safeFileName(data.factura.numero_factura || 'factura');
  const filename = `${invoiceNumber}-${Date.now()}.pdf`;
  const filePath = path.join(folder, filename);
  const publicUrl = `/uploads/invoices/${filename}`;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 45
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const page = {
    value: 1
  };

  drawHeader(doc, data);
  drawInvoiceInfo(doc, data);
  drawClientBlocks(doc, data);

  const detailsEndY = drawDetailsTable(doc, data, 440, page);
  const totalsEndY = drawTotals(doc, data, detailsEndY + 10, page);

  if (totalsEndY < 735) {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(
        'Gracias por tu compra. Para cualquier consulta, comunícate directamente con la tienda.',
        45,
        totalsEndY,
        {
          width: 505,
          align: 'center'
        }
      );
  }

  drawFooter(doc, page.value);

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return {
    filePath,
    publicUrl
  };
}