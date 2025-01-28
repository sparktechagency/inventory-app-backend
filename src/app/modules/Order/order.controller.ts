import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { orderService } from "./order.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
// create a new product
const createProduct = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { ...productData } = req.body;
        const result = await orderService.createProductIntoDB(productData);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: 'Product Details Create successfully.',
            data: {
                result
            },
        });
    }
);
// get fall products
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
    const result = await orderService.getAllProducts();
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'No products found!');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product retrieved successfully",
        data: result,
    });
});


// delete product
const deleteSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const ProductData = await orderService.deleteProductFromDB(id)
    if (!ProductData) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found! Please provide a valid product ID. 400 Bad Request');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product deleted successfully",
        data: ProductData,
    });

})

// update product 
const updateSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const updatedProduct = await orderService.updateProductInDB(id, payload);

    if (!updatedProduct) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found! Please provide a valid product ID.');
    }
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
    });
});


export const productController = { createProduct, deleteSingleProduct, getAllProducts, updateSingleProduct };