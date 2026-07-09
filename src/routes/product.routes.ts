import { Router } from 'express';
import {
  addProductImageController,
  addProductVariantController,
  activateProductController,
  createCategoryController,
  updateCategoryController,
  deactivateCategoryController,
  activateCategoryController,
  createProductController,
  deactivateProductController,
  getCategoriesByStoreController,
  getMyProductsByStoreController,
  getPublicProductDetailController,
  getPublicProductsByStoreSlugController,
  updateProductController, 
  getProductVariantsSellerController,
  updateProductVariantController,
  deactivateProductVariantController,
  activateProductVariantController
} from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  addProductImageSchema,
  addProductVariantSchema,
  createCategorySchema,
  createProductSchema,
  productIdParamSchema,
  storeIdParamSchema,
  storeSlugParamSchema
} from '../validators/product.validator';


const router = Router();

/*

| Rutas públicas
*/

router.get(
  '/public/stores/:slug/products',
  validate(storeSlugParamSchema),
  getPublicProductsByStoreSlugController
);

router.get(
  '/public/products/:id',
  validate(productIdParamSchema),
  getPublicProductDetailController
);

/*
| Rutas del vendedor
*/

router.post(
  '/seller/categories',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(createCategorySchema),
  createCategoryController
);

router.get(
  '/seller/stores/:storeId/categories',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(storeIdParamSchema),
  getCategoriesByStoreController
);

router.patch(
  '/seller/categories/:id',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  updateCategoryController
);

router.patch(
  '/seller/categories/:id/deactivate',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  deactivateCategoryController
);

router.patch(
  '/seller/categories/:id/activate',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  activateCategoryController
);

router.post(
  '/seller/products',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(createProductSchema),
  createProductController
);

router.get(
  '/seller/stores/:storeId/products',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(storeIdParamSchema),
  getMyProductsByStoreController
);

router.post(
  '/seller/products/:id/images',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(addProductImageSchema),
  addProductImageController
);

router.post(
  '/seller/products/:id/variants',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(addProductVariantSchema),
  addProductVariantController
);

router.patch(
  '/seller/products/:id/deactivate',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(productIdParamSchema),
  deactivateProductController
);

router.patch(
  '/seller/products/:id/activate',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  validate(productIdParamSchema),
  activateProductController
);

router.patch(
  '/seller/products/:id',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  updateProductController
);

router.get(
  '/seller/products/:id/variants',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  getProductVariantsSellerController
);

router.patch(
  '/seller/variants/:id',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  updateProductVariantController
);

router.patch(
  '/seller/variants/:id/deactivate',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  deactivateProductVariantController
);

router.patch(
  '/seller/variants/:id/activate',
  authMiddleware,
  roleMiddleware('VENDEDOR'),
  activateProductVariantController
);

export default router;