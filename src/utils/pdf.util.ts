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

function money(value: string | number): string {
  return `$${Number(value).toFixed(2)}`;
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

export async function generateInvoicePdf(data: InvoiceData): Promise<{
  filePath: string;
  publicUrl: string;
}> {
  const folder = path.join(process.cwd(), 'uploads', 'invoices');

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  const filename = `${data.factura.numero_factura}-${Date.now()}.pdf`;
  const filePath = path.join(folder, filename);
  const publicUrl = `/uploads/invoices/${filename}`;

  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const logoPath = publicPathToLocalPath(data.tienda.logo_url);
  const labelPath = publicPathToLocalPath(data.tienda.etiqueta_url);

  if (logoPath) {
    doc.image(logoPath, 50, 40, {
      width: 80
    });
  }

  doc
    .fontSize(18)
    .text(data.tienda.nombre_comercial || data.tienda.nombre || 'Tienda', 150, 45);

  doc
    .fontSize(10)
    .text(`WhatsApp: ${data.tienda.whatsapp || 'No registrado'}`, 150, 70)
    .text(`Correo: ${data.tienda.correo_contacto || 'No registrado'}`, 150, 85)
    .text(`Dirección: ${data.tienda.direccion || 'No registrada'}`, 150, 100);

  if (labelPath) {
    doc.image(labelPath, 460, 40, {
      width: 80
    });
  }

  doc
    .moveDown(4)
    .fontSize(16)
    .text('COMPROBANTE DE PEDIDO', {
      align: 'center'
    });

  doc.moveDown();

  doc
    .fontSize(11)
    .text(`Factura: ${data.factura.numero_factura}`)
    .text(`Fecha de emisión: ${new Date(data.factura.fecha_emision).toLocaleString()}`)
    .moveDown()
    .text(`Cliente: ${data.pedido.cliente_nombre}`)
    .text(`Correo: ${data.pedido.cliente_correo || 'No registrado'}`)
    .text(`Teléfono: ${data.pedido.cliente_telefono || 'No registrado'}`)
    .text(`Dirección: ${data.pedido.cliente_direccion || 'No registrada'}`);

  doc.moveDown();

  doc
    .fontSize(12)
    .text('Detalle del pedido', {
      underline: true
    });

  doc.moveDown(0.5);

  let y = doc.y;

  doc.fontSize(10);
  doc.text('Producto', 50, y);
  doc.text('Cant.', 300, y);
  doc.text('Precio', 360, y);
  doc.text('Subtotal', 440, y);

  y += 18;
  doc.moveTo(50, y).lineTo(545, y).stroke();

  y += 10;

  data.detalles.forEach((item) => {
    const variante = [
      item.talla ? `Talla: ${item.talla}` : null,
      item.color ? `Color: ${item.color}` : null
    ]
      .filter(Boolean)
      .join(' | ');

    const productText = variante
      ? `${item.nombre_producto}\n${variante}`
      : item.nombre_producto;

    doc.text(productText, 50, y, {
      width: 230
    });

    doc.text(String(item.cantidad), 300, y);
    doc.text(money(item.precio_unitario), 360, y);
    doc.text(money(item.subtotal), 440, y);

    y += variante ? 38 : 25;

    if (y > 700) {
      doc.addPage();
      y = 50;
    }
  });

  doc.moveTo(50, y).lineTo(545, y).stroke();
  y += 15;

  doc
    .fontSize(11)
    .text(`Subtotal: ${money(data.factura.subtotal)}`, 360, y)
    .text(`Descuento: ${money(data.factura.descuento)}`, 360, y + 18)
    .fontSize(13)
    .text(`Total: ${money(data.factura.total)}`, 360, y + 40);

  doc.moveDown(4);

  if (data.pedido.observacion) {
    doc
      .fontSize(10)
      .text(`Observación: ${data.pedido.observacion}`);
  }

  doc
    .moveDown(2)
    .fontSize(9)
    .text('Este documento corresponde a un comprobante interno de pedido generado por la tienda virtual.', {
      align: 'center'
    });

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