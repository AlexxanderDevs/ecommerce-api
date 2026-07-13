import { pool } from '../config/database';

interface CreateStoreInput {
  nombre: string;
  slug?: string;
  descripcion?: string;
  logo_url?: string;
  portada_url?: string;
  etiqueta_url?: string;
  color_principal?: string;
  whatsapp: string;
  correo_contacto?: string;
  direccion?: string;
}

export async function createStore(
  idUsuarioDuenio: string,
  input: CreateStoreInput
) {
  const result = await pool.query(
    `
    SELECT tienda.fn_crear_solicitud_tienda(
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10, $11
    ) AS data
    `,
    [
      idUsuarioDuenio,
      input.nombre,
      input.slug ?? null,
      input.descripcion ?? null,
      input.logo_url ?? null,
      input.portada_url ?? null,
      input.etiqueta_url ?? null,
      input.color_principal ?? '#111827',
      input.whatsapp,
      input.correo_contacto ?? null,
      input.direccion ?? null
    ]
  );

  return result.rows[0].data;
}

export async function getMyStores(idUsuarioDuenio: string) {
  const result = await pool.query(
    `
    SELECT tienda.fn_mis_tiendas($1) AS data
    `,
    [idUsuarioDuenio]
  );

  return result.rows[0].data;
}

export async function getPendingStores() {
  const result = await pool.query(
    `
    SELECT tienda.fn_tiendas_pendientes_admin() AS data
    `
  );

  return result.rows[0].data;
}

export async function approveStore(
  idTienda: string,
  idAdmin: string,
  observacion?: string
) {
  const result = await pool.query(
    `
    SELECT tienda.fn_aprobar_tienda_api($1, $2, $3) AS data
    `,
    [
      idTienda,
      idAdmin,
      observacion ?? 'Tienda aprobada por el administrador.'
    ]
  );

  return result.rows[0].data;
}

export async function rejectStore(
  idTienda: string,
  idAdmin: string,
  observacion?: string
) {
  const result = await pool.query(
    `
    SELECT tienda.fn_rechazar_tienda_api($1, $2, $3) AS data
    `,
    [
      idTienda,
      idAdmin,
      observacion ?? 'Tienda rechazada por el administrador.'
    ]
  );

  return result.rows[0].data;
}

export async function getAdminNotifications() {
  const result = await pool.query(
    `
    SELECT tienda.fn_notificaciones_admin() AS data
    `
  );

  return result.rows[0].data;
}

export async function markNotificationAsRead(idNotificacion: string) {
  const result = await pool.query(
    `
    SELECT tienda.fn_marcar_notificacion_leida_api($1) AS data
    `,
    [idNotificacion]
  );

  return result.rows[0].data;
}

export async function getPublicStores() {
  const result = await pool.query(
    `
    SELECT tienda.fn_tiendas_publicas() AS data
    `
  );

  return result.rows[0].data;
}

export async function getAdminDashboard(
  idAdmin: string,
  idTienda?: string | null
) {
  const result = await pool.query(
    `
    SELECT tienda.fn_dashboard_admin_api($1, $2) AS data
    `,
    [idAdmin, idTienda ?? null]
  );

  return result.rows[0].data;
}

export async function getAdminStores(idAdmin: string) {
  const result = await pool.query(
    `
    SELECT tienda.fn_tiendas_admin_api($1) AS data
    `,
    [idAdmin]
  );

  return result.rows[0].data;
}

export async function suspendStoreAdmin(
  idTienda: string,
  idAdmin: string,
  observacion?: string
) {
  const result = await pool.query(
    `
    SELECT tienda.fn_suspender_tienda_admin_api($1, $2, $3) AS data
    `,
    [
      idTienda,
      idAdmin,
      observacion ?? 'Tienda suspendida por el administrador.'
    ]
  );

  return result.rows[0].data;
}

export async function reactivateStoreAdmin(
  idTienda: string,
  idAdmin: string,
  observacion?: string
) {
  const result = await pool.query(
    `
    SELECT tienda.fn_reactivar_tienda_admin_api($1, $2, $3) AS data
    `,
    [
      idTienda,
      idAdmin,
      observacion ?? 'Tienda reactivada por el administrador.'
    ]
  );

  return result.rows[0].data;
}
export interface UpdateStoreSellerInput {
  nombre: string;
  descripcion?: string | null;
  logo_url?: string | null;
  portada_url?: string | null;
  etiqueta_url?: string | null;
  color_principal: string;
  whatsapp: string;
  correo_contacto?: string | null;
  direccion?: string | null;
}

export async function updateSellerStore(
  idUsuario: string,
  idTienda: string,
  input: UpdateStoreSellerInput
) {
  const result = await pool.query(
    `
    SELECT tienda.fn_actualizar_tienda_vendedor_api(
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10, $11
    ) AS data
    `,
    [
      idUsuario,
      idTienda,
      input.nombre,
      input.descripcion ?? null,
      input.logo_url ?? null,
      input.portada_url ?? null,
      input.etiqueta_url ?? null,
      input.color_principal,
      input.whatsapp,
      input.correo_contacto ?? null,
      input.direccion ?? null
    ]
  );

  return result.rows[0].data;
}