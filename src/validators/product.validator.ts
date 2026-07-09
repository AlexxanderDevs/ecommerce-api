import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    id_tienda: z.string().uuid('ID de tienda inválido.'),
    id_categoria_padre: z.string().uuid('ID de categoría padre inválido.').optional(),
    nombre: z.string().min(2, 'El nombre de la categoría es obligatorio.').max(100),
    descripcion: z.string().max(500).optional()
  })
});

export const storeIdParamSchema = z.object({
  params: z.object({
    storeId: z.string().uuid('ID de tienda inválido.')
  })
});

export const createProductSchema = z.object({
  body: z.object({
    id_tienda: z.string().uuid('ID de tienda inválido.'),
    id_categoria: z.string().uuid('ID de categoría inválido.').optional(),
    codigo_producto: z.string().max(50).optional(),
    nombre: z.string().min(2, 'El nombre del producto es obligatorio.').max(150),
    descripcion: z.string().max(1500).optional(),
    precio: z.coerce.number().min(0, 'El precio no puede ser negativo.'),
    stock_general: z.coerce.number().int().min(0).default(0),
    requiere_variantes: z.boolean().default(false),
    destacado: z.boolean().default(false),
    imagen_principal_url: z.string().max(500).optional()
  })
});

export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de producto inválido.')
  })
});

export const addProductImageSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de producto inválido.')
  }),
  body: z.object({
    url_imagen: z.string().min(1, 'La imagen es obligatoria.').max(500),
    es_principal: z.boolean().default(false),
    orden: z.coerce.number().int().min(1).default(1)
  })
});

export const addProductVariantSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de producto inválido.')
  }),
  body: z.object({
    sku: z.string().max(80).optional(),
    talla: z.string().max(30).optional(),
    color: z.string().max(50).optional(),
    descripcion_variante: z.string().max(150).optional(),
    stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo.'),
    precio_adicional: z.coerce.number().min(0).default(0)
  })
});

export const storeSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido.')
  })
});