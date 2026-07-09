import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import {
  addProductImage,
  addProductVariant,
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
  createProduct,
  deactivateProduct,
  getCategoriesByStore,
  getMyProductsByStore,
  getPublicProductDetail,
  getPublicProductsByStoreSlug,
  activateProductService,
  updateProduct,
  getProductVariantsSeller,
  updateProductVariant,
  deactivateProductVariant,
  activateProductVariant
} from '../services/product.service';

function getParamAsString(req: Request, paramName: string): string {
  const value = req.params[paramName];

  if (Array.isArray(value)) {
    return value[0];
  }

  if (!value || typeof value !== 'string') {
    throw new AppError(`Parámetro inválido: ${paramName}`, 400);
  }

  return value;
}

export async function createCategoryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const category = await createCategory(req.user.id_usuario, req.body);

    res.status(201).json({
      ok: true,
      message: 'Categoría creada correctamente.',
      category
    });
  } catch (error) {
    next(error);
  }
}

export async function getCategoriesByStoreController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const storeId = getParamAsString(req, 'storeId');

    const categories = await getCategoriesByStore(storeId);

    res.json({
      ok: true,
      categories
    });
  } catch (error) {
    next(error);
  }
}

export async function createProductController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const product = await createProduct(req.user.id_usuario, req.body);

    res.status(201).json({
      ok: true,
      message: 'Producto creado correctamente.',
      product
    });
  } catch (error) {
    next(error);
  }
}

export async function addProductImageController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const productId = getParamAsString(req, 'id');

    const image = await addProductImage(req.user.id_usuario, productId, req.body);

    res.status(201).json({
      ok: true,
      message: 'Imagen agregada correctamente.',
      image
    });
  } catch (error) {
    next(error);
  }
}

export async function addProductVariantController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const productId = getParamAsString(req, 'id');

    const variant = await addProductVariant(req.user.id_usuario, productId, req.body);

    res.status(201).json({
      ok: true,
      message: 'Variante agregada correctamente.',
      variant
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyProductsByStoreController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const storeId = getParamAsString(req, 'storeId');

    const products = await getMyProductsByStore(req.user.id_usuario, storeId);

    res.json({
      ok: true,
      products
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProductsByStoreSlugController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = getParamAsString(req, 'slug');

    const products = await getPublicProductsByStoreSlug(slug);

    res.json({
      ok: true,
      products
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProductDetailController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const productId = getParamAsString(req, 'id');

    const product = await getPublicProductDetail(productId);

    res.json({
      ok: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateProductController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const productId = getParamAsString(req, 'id');

    const product = await deactivateProduct(req.user.id_usuario, productId);

    res.json({
      ok: true,
      message: 'Producto desactivado correctamente.',
      product
    });
  } catch (error) {
    next(error);
  }
}

export async function activateProductController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const productId = getParamAsString(req, 'id');

    const product = await activateProductService(
      req.user.id_usuario,
      productId
    );

    res.json({
      ok: true,
      message: 'Producto reactivado correctamente.',
      product
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const productId = getParamAsString(req, 'id');

    const product = await updateProduct(
      req.user.id_usuario,
      productId,
      req.body
    );

    res.json({
      ok: true,
      message: 'Producto actualizado correctamente.',
      product
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductVariantsSellerController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const productId = getParamAsString(req, 'id');

    const variants = await getProductVariantsSeller(
      req.user.id_usuario,
      productId
    );

    res.json({
      ok: true,
      variants
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductVariantController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const variantId = getParamAsString(req, 'id');

    const variant = await updateProductVariant(
      req.user.id_usuario,
      variantId,
      req.body
    );

    res.json({
      ok: true,
      message: 'Variante actualizada correctamente.',
      variant
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateProductVariantController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const variantId = getParamAsString(req, 'id');

    const variant = await deactivateProductVariant(
      req.user.id_usuario,
      variantId
    );

    res.json({
      ok: true,
      message: 'Variante desactivada correctamente.',
      variant
    });
  } catch (error) {
    next(error);
  }
}

export async function activateProductVariantController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const variantId = getParamAsString(req, 'id');

    const variant = await activateProductVariant(
      req.user.id_usuario,
      variantId
    );

    res.json({
      ok: true,
      message: 'Variante reactivada correctamente.',
      variant
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategoryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const categoryId = getParamAsString(req, 'id');

    const category = await updateCategory(
      req.user.id_usuario,
      categoryId,
      req.body
    );

    res.json({
      ok: true,
      message: 'Categoría actualizada correctamente.',
      category
    });
  } catch (error) {
    next(error);
  }
}

export async function deactivateCategoryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const categoryId = getParamAsString(req, 'id');

    const category = await deactivateCategory(
      req.user.id_usuario,
      categoryId
    );

    res.json({
      ok: true,
      message: 'Categoría desactivada correctamente.',
      category
    });
  } catch (error) {
    next(error);
  }
}

export async function activateCategoryController(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Usuario no autenticado.', 401);
    }

    const categoryId = getParamAsString(req, 'id');

    const category = await activateCategory(
      req.user.id_usuario,
      categoryId
    );

    res.json({
      ok: true,
      message: 'Categoría reactivada correctamente.',
      category
    });
  } catch (error) {
    next(error);
  }
}