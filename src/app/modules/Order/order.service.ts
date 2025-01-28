import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IProduct } from "./order.interface";
import { ProductModel } from "./order.model";

const createProductIntoDB = async (payload: Partial<IProduct>): Promise<IProduct> => {


    const createProduct = await ProductModel.create(payload);
    if (!payload.name || !payload.unit || payload.quantity === undefined) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required fields");
    }

    if (!createProduct) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Product');
    }


    return createProduct;
};

// get all products
const getAllProducts = async () => {
    const products = await ProductModel.find();
    if (!products) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get products');
    }
    return products;
}

// delete product from db

const deleteProductFromDB = async (id: string) => {
    const productData = await ProductModel.findByIdAndDelete(id);
    if (!productData) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found');
    }
    return productData;
};

// update product in db
const updateProductInDB = async (id: string, payload: Partial<IProduct>): Promise<IProduct | null> => {
    const updatedProduct = await ProductModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return updatedProduct;
};




export const orderService = {
    createProductIntoDB,
    getAllProducts,
    deleteProductFromDB,
    updateProductInDB
}