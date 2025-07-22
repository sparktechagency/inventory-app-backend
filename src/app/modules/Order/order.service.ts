import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IProduct } from "./order.interface";
import { ProductModel } from "./order.model";

const createProductIntoDB = async (
  payload: Partial<IProduct> | Partial<IProduct>[]
): Promise<IProduct | IProduct[]> => {
  const products = Array.isArray(payload) ? payload : [payload];

  // Validate required fields
  for (const product of products) {
    if (!product.name || !product.unit || product.quantity === undefined) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required fields");
    }
  }

  // Create products
  const createdProducts = await ProductModel.insertMany(products);

  if (!createdProducts || createdProducts.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create products");
  }

  // Return single product if only one was created
  return createdProducts.length === 1 ? createdProducts[0] : createdProducts;
};

// get all products
const getAllProducts = async () => {
  const products = await ProductModel.find({availability:false});
  if (!products) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to get products"
    );
  }
  return products;
};

// delete product from db

const deleteProductFromDB = async (id: string) => {
  const productData = await ProductModel.findByIdAndDelete(id);
  if (!productData) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Product not found");
  }
  return productData;
};

// update product in db
const updateProductInDB = async (id: string, payload: any) => {
  console.log("payload", payload);

  const updatedProduct = await ProductModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updatedProduct) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Failed to update product");
  }
  return updatedProduct;
};

export const orderService = {
  createProductIntoDB,
  getAllProducts,
  deleteProductFromDB,
  updateProductInDB,
};
