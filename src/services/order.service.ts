import { pool } from '../config/database';

interface OrderItemInput {
  id_producto: string;
  id_variante?: string | null;
  cantidad: number;
}

interface CreateOrderInput {
  id_tienda: string;
  cliente_nombre: string;
  cliente_correo?: string;
  cliente_telefono: string;
  cliente_direccion?: string;
  observacion?: string;
  items: OrderItemInput[];
}

function normalizeWhatsAppNumber(numero: string): string {
  let cleanNumber = numero.replace(/\D/g, '');

  // Ecuador: si viene como 0959057134, convertir a 593959057134
  if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
    cleanNumber = `593${cleanNumber.slice(1)}`;
  }

  // Si viene como 00593959057134, convertir a 593959057134
  if (cleanNumber.startsWith('00')) {
    cleanNumber = cleanNumber.slice(2);
  }

  return cleanNumber;
}

function buildWhatsAppUrl(numero: string, mensaje: string): string {
  const cleanNumber = normalizeWhatsAppNumber(numero);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(mensaje)}`;
}

function attachWhatsAppUrl(data: any) {
  if (!data?.whatsapp?.numero || !data?.whatsapp?.mensaje) {
    return data;
  }

  return {
    ...data,
    whatsapp: {
      ...data.whatsapp,
      url: buildWhatsAppUrl(data.whatsapp.numero, data.whatsapp.mensaje)
    }
  };
}

export async function createOrder(
  idUsuarioCliente: string | null,
  input: CreateOrderInput
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_crear_pedido_api(
      $1, $2, $3, $4, $5,
      $6, $7, $8::jsonb
    ) AS data
    `,
    [
      idUsuarioCliente,
      input.id_tienda,
      input.cliente_nombre,
      input.cliente_correo ?? null,
      input.cliente_telefono,
      input.cliente_direccion ?? null,
      input.observacion ?? null,
      JSON.stringify(input.items)
    ]
  );

  return attachWhatsAppUrl(result.rows[0].data);
}

export async function getSellerOrdersByStore(
  idUsuario: string,
  idTienda: string
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_pedidos_vendedor_tienda_api($1, $2) AS data
    `,
    [idUsuario, idTienda]
  );

  return result.rows[0].data;
}

export async function getSellerOrderDetail(
  idUsuario: string,
  idPedido: string
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_detalle_pedido_vendedor_api($1, $2) AS data
    `,
    [idUsuario, idPedido]
  );

  return result.rows[0].data;
}

export async function confirmOrder(
  idUsuario: string,
  idPedido: string,
  observacion?: string
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_confirmar_pedido_api($1, $2, $3) AS data
    `,
    [
      idUsuario,
      idPedido,
      observacion ?? 'Pedido confirmado por el vendedor.'
    ]
  );

  return result.rows[0].data;
}

export async function cancelOrder(
  idUsuario: string,
  idPedido: string,
  observacion?: string
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_cancelar_pedido_api($1, $2, $3) AS data
    `,
    [
      idUsuario,
      idPedido,
      observacion ?? 'Pedido cancelado por el vendedor.'
    ]
  );

  return result.rows[0].data;
}

export async function deliverOrder(
  idUsuario: string,
  idPedido: string,
  observacion?: string
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_entregar_pedido_api($1, $2, $3) AS data
    `,
    [
      idUsuario,
      idPedido,
      observacion ?? 'Pedido entregado al cliente.'
    ]
  );

  return result.rows[0].data;
}

export async function markWhatsAppSent(idPedido: string) {
  const result = await pool.query(
    `
    SELECT ventas.fn_marcar_whatsapp_enviado_api($1) AS data
    `,
    [idPedido]
  );

  return result.rows[0].data;
}

export async function getSellerDashboardByStore(
  idUsuario: string,
  idTienda: string
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_dashboard_vendedor_tienda_api($1, $2) AS data
    `,
    [idUsuario, idTienda]
  );

  return result.rows[0].data;
}

export async function getCustomerOrders(idUsuario: string) {
  const result = await pool.query(
    `
    SELECT ventas.fn_pedidos_cliente_api($1) AS data
    `,
    [idUsuario]
  );

  return result.rows[0].data;
}

export async function getCustomerOrderDetail(
  idUsuario: string,
  idPedido: string
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_detalle_pedido_cliente_api($1, $2) AS data
    `,
    [idUsuario, idPedido]
  );

  return result.rows[0].data;
}

export async function trackPublicOrder(
  code: string,
  phone: string
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_consultar_pedido_publico_api($1, $2) AS data
    `,
    [code, phone]
  );

  return result.rows[0].data;
}