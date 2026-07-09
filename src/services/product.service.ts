import { pool } from '../config/database';

interface CreateCategoryInput {
  id_tienda: string;
  id_categoria_padre?: string;
  nombre: string;
  descripcion?: string;
}

interface CreateProductInput {
  id_tienda: string;
  id_categoria?: string;
  codigo_producto?: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock_general: number;
  requiere_variantes: boolean;
  destacado: boolean;
  imagen_principal_url?: string;
}

interface AddImageInput {
  url_imagen: string;
  es_principal: boolean;
  orden: number;
}

interface AddVariantInput {
  sku?: string;
  talla?: string;
  color?: string;
  descripcion_variante?: string;
  stock: number;
  precio_adicional: number;
}

interface UpdateProductInput {
  id_categoria?: string | null;
  codigo_producto?: string | null;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  stock_general: number;
  requiere_variantes: boolean;
  destacado: boolean;
}

interface UpdateVariantInput {
  sku?: string | null;
  talla?: string | null;
  color?: string | null;
  descripcion_variante?: string | null;
  stock: number;
  precio_adicional: number;
}

interface UpdateCategoryInput {
  id_categoria_padre?: string | null;
  nombre: string;
  descripcion?: string | null;
}

export async function createCategory(idUsuario: string, input: CreateCategoryInput) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_crear_categoria_api($1, $2, $3, $4, $5) AS data
    `,
    [
      idUsuario,
      input.id_tienda,
      input.nombre,
      input.descripcion ?? null,
      input.id_categoria_padre ?? null
    ]
  );

  return result.rows[0].data;
}

export async function getCategoriesByStore(idTienda: string) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_categorias_tienda_api($1) AS data
    `,
    [idTienda]
  );

  return result.rows[0].data;
}

export async function createProduct(idUsuario: string, input: CreateProductInput) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_crear_producto_api(
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11
    ) AS data
    `,
    [
      idUsuario,
      input.id_tienda,
      input.id_categoria ?? null,
      input.codigo_producto ?? null,
      input.nombre,
      input.descripcion ?? null,
      input.precio,
      input.stock_general,
      input.requiere_variantes,
      input.destacado,
      input.imagen_principal_url ?? null
    ]
  );

  return result.rows[0].data;
}

export async function addProductImage(
  idUsuario: string,
  idProducto: string,
  input: AddImageInput
) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_agregar_imagen_producto_api($1, $2, $3, $4, $5) AS data
    `,
    [
      idUsuario,
      idProducto,
      input.url_imagen,
      input.es_principal,
      input.orden
    ]
  );

  return result.rows[0].data;
}

export async function addProductVariant(
  idUsuario: string,
  idProducto: string,
  input: AddVariantInput
) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_agregar_variante_producto_api(
      $1, $2, $3, $4, $5, $6, $7, $8
    ) AS data
    `,
    [
      idUsuario,
      idProducto,
      input.sku ?? null,
      input.talla ?? null,
      input.color ?? null,
      input.descripcion_variante ?? null,
      input.stock,
      input.precio_adicional
    ]
  );

  return result.rows[0].data;
}

export async function getMyProductsByStore(idUsuario: string, idTienda: string) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_mis_productos_tienda_api($1, $2) AS data
    `,
    [idUsuario, idTienda]
  );

  return result.rows[0].data;
}

export async function getPublicProductsByStoreSlug(slug: string) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_productos_publicos_tienda_api($1) AS data
    `,
    [slug]
  );

  return result.rows[0].data;
}

export async function getPublicProductDetail(idProducto: string) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_detalle_producto_publico_api($1) AS data
    `,
    [idProducto]
  );

  return result.rows[0].data;
}

export async function deactivateProduct(idUsuario: string, idProducto: string) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_desactivar_producto_api($1, $2) AS data
    `,
    [idUsuario, idProducto]
  );

  return result.rows[0].data;
}

export async function activateProductService(
  idUsuario: string,
  idProducto: string
) {
  const { rows } = await pool.query(
    'SELECT catalogo.fn_reactivar_producto_api($1, $2) AS data',
    [idUsuario, idProducto]
  );

  return rows[0].data;
}

export async function updateProduct(
  idUsuario: string,
  idProducto: string,
  input: UpdateProductInput
) {
  const result = await pool.query(
    `
    SELECT catalogo.fn_actualizar_producto_api(
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10
    ) AS data
    `,
    [
      idUsuario,
      idProducto,
      input.id_categoria ?? null,
      input.codigo_producto ?? null,
      input.nombre,
      input.descripcion ?? null,
      input.precio,
      input.stock_general,
      input.requiere_variantes,
      input.destacado
    ]
  );

  return result.rows[0].data;
}

export async function getProductVariantsSeller(
  idUsuario: string,
  idProducto: string
) {
  const { rows } = await pool.query(
    'SELECT catalogo.fn_variantes_producto_vendedor_api($1, $2) AS data',
    [idUsuario, idProducto]
  );

  return rows[0].data;
}

export async function updateProductVariant(
  idUsuario: string,
  idVariante: string,
  input: UpdateVariantInput
) {
  const { rows } = await pool.query(
    `
    SELECT catalogo.fn_actualizar_variante_producto_api(
      $1, $2, $3, $4, $5, $6, $7, $8
    ) AS data
    `,
    [
      idUsuario,
      idVariante,
      input.sku ?? null,
      input.talla ?? null,
      input.color ?? null,
      input.descripcion_variante ?? null,
      input.stock,
      input.precio_adicional
    ]
  );

  return rows[0].data;
}

export async function deactivateProductVariant(
  idUsuario: string,
  idVariante: string
) {
  const { rows } = await pool.query(
    'SELECT catalogo.fn_desactivar_variante_producto_api($1, $2) AS data',
    [idUsuario, idVariante]
  );

  return rows[0].data;
}

export async function activateProductVariant(
  idUsuario: string,
  idVariante: string
) {
  const { rows } = await pool.query(
    'SELECT catalogo.fn_reactivar_variante_producto_api($1, $2) AS data',
    [idUsuario, idVariante]
  );

  return rows[0].data;
}

export async function updateCategory(
  idUsuario: string,
  idCategoria: string,
  input: UpdateCategoryInput
) {
  const { rows } = await pool.query(
    `
    SELECT catalogo.fn_actualizar_categoria_api(
      $1, $2, $3, $4, $5
    ) AS data
    `,
    [
      idUsuario,
      idCategoria,
      input.id_categoria_padre ?? null,
      input.nombre,
      input.descripcion ?? null
    ]
  );

  return rows[0].data;
}

export async function deactivateCategory(
  idUsuario: string,
  idCategoria: string
) {
  const { rows } = await pool.query(
    'SELECT catalogo.fn_desactivar_categoria_api($1, $2) AS data',
    [idUsuario, idCategoria]
  );

  return rows[0].data;
}

export async function activateCategory(
  idUsuario: string,
  idCategoria: string
) {
  const { rows } = await pool.query(
    'SELECT catalogo.fn_reactivar_categoria_api($1, $2) AS data',
    [idUsuario, idCategoria]
  );

  return rows[0].data;
}