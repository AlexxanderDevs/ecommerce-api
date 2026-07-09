import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    id_tienda: z.string().uuid('ID de tienda inválido.'),

    cliente_nombre: z.string().min(3, 'El nombre del cliente es obligatorio.').max(150),
    cliente_correo: z.string().email('Correo inválido.').optional(),
    cliente_telefono: z
      .string()
      .regex(/^[0-9+ ]{7,20}$/, 'Teléfono inválido.'),
    cliente_direccion: z.string().max(500).optional(),
    observacion: z.string().max(500).optional(),

    items: z
      .array(
        z.object({
          id_producto: z.string().uuid('ID de producto inválido.'),
          id_variante: z.string().uuid('ID de variante inválido.').nullable().optional(),
          cantidad: z.coerce.number().int().min(1, 'La cantidad debe ser mayor a cero.')
        })
      )
      .min(1, 'Debe agregar al menos un producto al pedido.')
  })
});

export const storeIdParamSchema = z.object({
  params: z.object({
    storeId: z.string().uuid('ID de tienda inválido.')
  })
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de pedido inválido.')
  })
});

export const orderActionSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de pedido inválido.')
  }),
  body: z.object({
    observacion: z.string().max(500).optional()
  }).optional()
});