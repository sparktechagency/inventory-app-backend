import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import catchAsync from "../../../shared/catchAsync";
import { wholesalerServices } from "./wholesaler.service";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";

const getAllWholeSalers = catchAsync(async (req: Request, res: Response) => {
  const result = await wholesalerServices.getAllWholeSaler(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Wholesalers retrieved successfully",
    pagination: result.meta,
    data: result.data,
  });
});

// get single wholesaler
const getWholeSalerById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Fetch wholesaler by ID from service
  const result = await wholesalerServices.getWholeSalerById(id);

  // Send response
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Wholesaler retrieved successfully",
    data: result,
  });
});
// update wholesaler details
const updateSingleWholesaler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;

    const updatedRetailer = await wholesalerServices.updateRetailerIntoDB(
      id,
      payload
    );

    if (!updatedRetailer) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Retailer not found! Please provide a valid ID."
      );
    }
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      Total: updateSingleRetailer.length,
      message: "Retailer updated successfully",
      data: updatedRetailer,
    });
  }
);

//collection of retailer
const getAllRetailers = catchAsync(async (req: Request, res: Response) => {
  const {
    search,
    email,
    name,
    phone,
    businessName,
    page,
    limit,
    sortBy,
    sortOrder,
  }: any = req.query;

  const paginationOptions = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  const storeInformation = businessName ? { businessName } : undefined;

  const result = await wholesalerServices.getAllRetailers({
    search,
    email,
    name,
    phone,
    storeInformation,
    paginationOptions,
  });

  const { meta, data } = result;

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Retailers retrieved successfully",
    Total: meta.total,
    pagination: {
      page: meta.page,
      limit: meta.limit,
      totalPage: Math.ceil(meta.total / meta.limit),
      total: meta.total,
    },
    data,
  });
});

const getRetailersByMonth = catchAsync(async (req: Request, res: Response) => {
  const result = await wholesalerServices.getRetailersByMonth();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Retailers Statistics Retrieved Successfully",
    data: result,
  });
});

const getWholesalerByMonth = catchAsync(async (req: Request, res: Response) => {
  const result = await wholesalerServices.getWholesalerByMonth();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Wholesalers Statistics Retrieved Successfully",
    data: result,
  });
});

// update retailer details
const updateSingleRetailer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const updatedRetailer = await wholesalerServices.updateRetailerIntoDB(
    id,
    payload
  );

  if (!updatedRetailer) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Retailer not found! Please provide a valid ID."
    );
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    Total: updateSingleRetailer.length,
    message: "Retailer updated successfully",
    data: updatedRetailer,
  });
});

// retailer delete
const deleteSingleRetailer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedRetailer = await wholesalerServices.deleteRetailerFromDB(id);
  if (!deletedRetailer) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Retailer not found! Please provide a valid ID."
    );
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Retailer deleted successfully",
    data: null,
  });
});

const getDashboardStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const result = await wholesalerServices.getDashboardStatistics();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Dashboard Statistics Retrieved Successfully",
      data: result,
    });
  }
);

//
export const wholesalerController = {
  // * all wholesaler controller
  getAllWholeSalers,
  getWholeSalerById,
  // deleteSingleWholesaler,
  updateSingleWholesaler,

  // * all retailer controller
  getAllRetailers,
  updateSingleRetailer,
  deleteSingleRetailer,
  getRetailersByMonth,
  getWholesalerByMonth,
  getDashboardStatistics,
};
