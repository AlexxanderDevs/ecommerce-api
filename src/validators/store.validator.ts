import { z } from 'zod';

export const createStoreSchema = z.object({
  body: z.object({
    nombre: z.string().min(3, 'El nombre de la tienda es obligatorio.').max(120),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido.')
      .optional(),
    descripcion: z.string().max(1000).optional(),

    logo_url: z.string().max(500).optional(),
    portada_url: z.string().max(500).optional(),
    etiqueta_url: z.string().max(500).optional(),

    color_principal: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido.')
      .default('#111827'),

    whatsapp: z
      .string()
      .regex(/^[0-9+]{8,20}$/, 'WhatsApp inválido.'),

    correo_contacto: z.string().email('Correo de contacto inválido.').optional(),

    direccion: z.string().max(300).optional()
  })
});

export const storeIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de tienda inválido.')
  }),
  body: z.object({
    observacion: z.string().max(500).optional()
  }).optional()
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de notificación inválido.')
  })
});