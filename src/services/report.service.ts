import { pool } from '../config/database';

export interface ReportFilters {
  startDate?: string | null;
  endDate?: string | null;
  storeId?: string | null;
}

export async function getAdminReport(
  idAdmin: string,
  filters: ReportFilters
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_reporte_admin_api($1, $2, $3, $4) AS data
    `,
    [
      idAdmin,
      filters.startDate ?? null,
      filters.endDate ?? null,
      filters.storeId ?? null
    ]
  );

  return result.rows[0].data;
}

export async function getSellerStoreReport(
  idUsuario: string,
  idTienda: string,
  filters: ReportFilters
) {
  const result = await pool.query(
    `
    SELECT ventas.fn_reporte_vendedor_tienda_api($1, $2, $3, $4) AS data
    `,
    [
      idUsuario,
      idTienda,
      filters.startDate ?? null,
      filters.endDate ?? null
    ]
  );

  return result.rows[0].data;
}