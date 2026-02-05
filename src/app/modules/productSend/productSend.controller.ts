import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { productSendService } from "./productSend.service";
import { Request, Response } from "express";

const sendProductToWholesaler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await productSendService.sendProductToWholesalerIntoDB(
      user,
      req.body,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Product sent to wholesaler successfully",
      data: result,
    });
  },
);

const getAllProductToWholesaler = catchAsync(
  async (req: Request, res: Response) => {
    const type = req.params.type as
      | "pending"
      | "confirmed"
      | "delivered"
      | "received";
    const user = req.user;
    const result = await productSendService.getAllProductSendToWholeSalerFromDB(
      user,
      type,
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Products fetched successfully",
      pagination: result.meta,
      data: result.data,
    });
  },
);

const updateProductSendDetail = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await productSendService.updateProductSendDetailIntoDB(
      req.params.id,
      user,
      req.body,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Product updated successfully",
      data: result,
    });
  },
);

const updateAllProductSendDetail = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result =
      await productSendService.updateAllProductStatusPriceAndAvailabilityIntoDB(
        user,
        req.params.id,
        req.body,
      );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Product updated successfully",
      data: result,
    });
  },
);

const getAllReceivedProductFromWholesaler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result =
      await productSendService.getAllReceivedProductFromWholesalerDB(user!);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Get All Received Product from wholesaler",
      data: result,
    });
  },
);

const updateProductReceivedToConfirmRequestFromRetailerToWholesaler =
  catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result =
      await productSendService.updateProductReceivedToConfirmRequestFromRetailerToWholesalerIntoDB(
        user,
        req.params.id,
        req.body,
      );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Product updated successfully",
      data: result,
    });
  });

const getAllConfirmProductFromRetailer = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await productSendService.getAllConfirmProductFromRetailerDB(
      user!,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Get All Confirm Product from retailer",
      data: result,
    });
  },
);

const getAllConfirmProductFromWholesaler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result =
      await productSendService.getAllConfirmProductFromWholesalerDB(user!);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Get All Confirm Product from wholesaler",
      data: result,
    });
  },
);

const getAllReceivedProductFromRetailer = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await productSendService.getAllReceivedProductFromRetailerDB(
      user!,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Get All Received Product from retailer",
      data: result,
    });
  },
);

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await productSendService.deleteProductFromDB(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Delete Product from retailer",
    data: result,
  });
});

const updateDelivaryStatusAsaWholesaler = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result =
      await productSendService.updateDelivaryStatusAsaWholesalerIntoDB(
        user,
        req.params.id,
      );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Product updated successfully",
      data: result,
    });
  },
);

// save as draft
const saveAsDraftStatusTrue = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await productSendService.saveAsDraftStatusTrueIntoDB(
      user,
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Product updated successfully",
      data: result,
    });
  },
);

export const productSendControllerFromRetailer = {
  sendProductToWholesaler,
  getAllProductToWholesaler,
  updateProductSendDetail,
  updateAllProductSendDetail,
  getAllReceivedProductFromWholesaler,
  updateProductReceivedToConfirmRequestFromRetailerToWholesaler,
  getAllConfirmProductFromRetailer,
  getAllConfirmProductFromWholesaler,
  getAllReceivedProductFromRetailer,
  deleteProduct,
  updateDelivaryStatusAsaWholesaler,
  saveAsDraftStatusTrue,
};
