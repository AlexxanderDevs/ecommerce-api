import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    nombres: z.string().min(2, 'Los nombres son obligatorios.').max(100),
    apellidos: z.string().min(2, 'Los apellidos son obligatorios.').max(100),
    correo: z.string().email('Correo inválido.'),
    telefono: z
      .string()
      .regex(/^[0-9+ ]{7,20}$/, 'Teléfono inválido.')
      .optional(),
    password: z
      .string()
      .min(8, 'La contraseña debe tener mínimo 8 caracteres.')
      .max(100)
  })
});

export const loginSchema = z.object({
  body: z.object({
    correo: z.string().email('Correo inválido.'),
    password: z.string().min(1, 'La contraseña es obligatoria.')
  })
});