import { JwtPayload } from "jsonwebtoken";
import ApiError from "../../../errors/ApiError";
import { IProductSend } from "./productSend.interface";
import { ProductSendModel } from "./productSend.model";
import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import { SendOfferModelForRetailer } from "../sendOrder/sendOffer.model";
import { ReplayFromWholesalerModel } from "../replayFromWholesaler/replayFromWholesaler.model";
import { sendNotifications } from "../../../helpers/notificationsHelper";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";

const sendProductToWholesalerIntoDB = async (
  user: JwtPayload,
  payload: IProductSend[]
) => {
  // product status update
  await SendOfferModelForRetailer.updateMany(
    { retailer: user.id },
    { status: true }
  );
  const formattedPayload = payload?.map((item) => ({
    ...item,
    retailer: user.id,
  }));

  const result = await ProductSendModel.create(formattedPayload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to send product to wholesaler"
    );
  }
  // TODO: need to send notification to wholesaler
  const findThisUser = await User.findById(user.id);
  for (const item of formattedPayload) {
    const notificationPayload = {
      sender: user.id,
      receiver: item.wholesaler,
      message: `${findThisUser?.name} has send the order is this product available?`,
    };
    await sendNotifications(notificationPayload);
  }
  return result;
};

// get all just status true
const getAllProductSendToWholeSalerFromDB = async (
  user: JwtPayload,
  type: "pending" | "confirm" | "received",
  query: Record<string, any>
) => {
  const filter: Record<string, any> = { status: type };

  if (user.role === "Retailer") {
    filter.retailer = user.id;
  } else if (user.role === "Wholesaler") {
    filter.wholesaler = { $in: [user.id] };
  }

  if (query.status) {
    filter.status = query.status;
  }

  const productQuery = ProductSendModel.find(filter);

  const queryBuilder = new QueryBuilder(productQuery, query)
    .search(["note"]) // or any searchable field
    .filter()
    .sort()
    .paginate()
    .fields()
    .populate(["product", "retailer", "wholesaler"], {
      // product: 'productName unit quantity additionalInfo price availability',
      retailer:
        "name email image phone storeInformation.businessName storeInformation.location",
      wholesaler:
        "name email image phone storeInformation.businessName storeInformation.location",
    });

  const data = await queryBuilder.modelQuery;
  const meta = await queryBuilder.getPaginationInfo();

  return {
    meta,
    data,
  };
};

const updateProductSendDetailIntoDB = async (
  id: string,
  user: JwtPayload,
  productData: any
) => {
  const details = await ProductSendModel.findById(id);
  const updateStatusRequest = await ProductSendModel.findByIdAndUpdate(id, {
    status: "received",
  });

  if (!details) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }

  if (!details.product || details.product.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "No products found in the order"
    );
  }
  const findThisUser = await User.findById(user.id);
  if (findThisUser?.role !== USER_ROLES.Wholesaler) return;

  const currentOrder = findThisUser.order ?? 0;

  if (!findThisUser.isSubscribed && currentOrder <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Free trial order count is over please subscribe to continue"
    );
  }

  await User.findByIdAndUpdate(user.id, {
    order: currentOrder + 1,
  });
  const createdEntries = [];

  for (const item of productData) {
    if (!item.product || !item.price || item.availability === undefined) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Missing product, price or availability"
      );
    }

    const created = await ReplayFromWholesalerModel.create({
      product: item.product,
      retailer: details.retailer,
      wholesaler: user.id,
      price: item.price,
      availability: item.availability,
      status: "received",
    });

    createdEntries.push(created);
  }

  const notificationPayload = {
    sender: user.id,
    receiver: details.retailer,
    message: `${findThisUser?.name} has confirmed the order id ${id}`,
  };

  await sendNotifications(notificationPayload);

  return createdEntries;
};

const getAllReceivedProductFromWholesalerDB = async (user: JwtPayload) => {
  const details = await ProductSendModel.find({
    retailer: user.id,
    status: "received",
  })
    .populate("product")
    .lean();
  if (!details) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }
  return details;
};

// price?: number
// availability?: boolean
// status: "received"

const updateAllProductStatusPriceAndAvailabilityIntoDB = async (
  user: JwtPayload,
  id: string,
  payload: any
) => {
  const statusUpdate = await ProductSendModel.findByIdAndUpdate(
    id,
    { status: "received" },
    { new: true }
  ).exec();

  if (!statusUpdate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update product");
  }

  for (const prod of payload.product) {
    await SendOfferModelForRetailer.findByIdAndUpdate(prod._id, {
      price: prod.price,
      availability: prod.availability,
      status: true,
    });
  }

  const findThisUser = await User.findById(user.id);

  if (!findThisUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (!findThisUser.isSubscribed) {
    if (findThisUser.order! > 10) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Order limit reached. Please subscribe."
      );
    }
    // Increment order for non-subscribed user
    await User.findByIdAndUpdate(user.id, { order: findThisUser.order! + 1 });
  }

  const notificationPayload = {
    sender: user.id,
    receiver: statusUpdate.retailer,
    message: `${user.name} has confirmed the order id ${id}`,
  };

  await sendNotifications(notificationPayload);

  return statusUpdate;
};

// update bulk quantity base on retailer
const updateProductReceivedToConfirmRequestFromRetailerToWholesalerIntoDB =
  async (user: JwtPayload, id: string, payload: any) => {
    const statusUpdate = await ProductSendModel.findByIdAndUpdate(
      id,
      { status: "confirm" },
      { new: true }
    ).exec();
    if (!statusUpdate) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update product");
    }
    for (const prod of payload.product) {
      if (prod.quantity !== undefined) {
        await SendOfferModelForRetailer.findByIdAndUpdate(
          prod._id,
          { quantity: prod.quantity },
          { new: true }
        );
      }
    }
    const findThisUser = await User.findById(user.id);
    const notificationPayload = {
      sender: user.id,
      receiver: statusUpdate.retailer,
      message: `${findThisUser?.name} has confirmed the order id ${id}`,
    };

    await sendNotifications(notificationPayload);

    return statusUpdate;
  };

// get all confirm base on retailer
const getAllConfirmProductFromRetailerDB = async (user: JwtPayload) => {
  const details = await ProductSendModel.find({
    retailer: user.id,
    status: { $in: ["confirm", "delivered"] },
  })
    .populate({
      path: "product",
    })
    .populate({
      path: "retailer",
      select:
        "name email phone image storeInformation.businessName storeInformation.location",
    })
    .populate({
      path: "wholesaler",
      select:
        "name email image phone storeInformation.businessName storeInformation.location",
    })
    .lean();
  if (!details) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }
  return details;
};

// get all received base on wholesaler
const getAllReceivedProductFromRetailerDB = async (user: JwtPayload) => {
  const details = await ProductSendModel.find({
    wholesaler: user.id,
    status: "received",
  })
    .populate({
      path: "product",
    })
    .populate({
      path: "retailer",
      select:
        "name email image phone storeInformation.businessName  storeInformation.location ",
    })
    .populate({
      path: "wholesaler",
      select:
        "name email image phone storeInformation.businessName storeInformation.location ",
    })
    .lean();
  if (!details) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }
  return details;
};

// get all confirm base on wholesaler
const getAllConfirmProductFromWholesalerDB = async (user: JwtPayload) => {
  const details = await ProductSendModel.find({
    wholesaler: user.id,
    status: { $in: ["confirm", "delivered"] },
  })
    .populate({
      path: "product",
    })
    .populate({
      path: "retailer",
      select: "+phone +storeInformation",
    })
    .populate({
      path: "wholesaler",
      select: "+phone +storeInformation",
    })
    .lean();

  // Add this debug log
  //   console.log("Populated Details:", JSON.stringify(details, null, 2));

  if (!details) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }
  return details;
};

// delivary status change
const updateDelivaryStatusAsaWholesalerIntoDB = async (
  user: JwtPayload,
  id: string
) => {
  const statusUpdate = await ProductSendModel.findByIdAndUpdate(
    id,
    { status: "delivered" },
    { new: true }
  ).exec();
  if (!statusUpdate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update product");
  }
  const findThisUser = await User.findById(user.id);
  const notificationPayload = {
    sender: user.id,
    receiver: statusUpdate.retailer,
    message: `${findThisUser?.name} has confirmed the order id ${id}`,
  };

  await sendNotifications(notificationPayload);

  return statusUpdate;
};

const deleteProductFromDB = async (id: string) => {
  const result = await ProductSendModel.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete product");
  }
  return result;
};


export const productSendService = {
  sendProductToWholesalerIntoDB,
  getAllProductSendToWholeSalerFromDB,
  updateProductSendDetailIntoDB,
  getAllReceivedProductFromWholesalerDB,
  updateAllProductStatusPriceAndAvailabilityIntoDB,
  updateProductReceivedToConfirmRequestFromRetailerToWholesalerIntoDB,
  getAllConfirmProductFromRetailerDB,
  getAllConfirmProductFromWholesalerDB,
  getAllReceivedProductFromRetailerDB,
  deleteProductFromDB,
  updateDelivaryStatusAsaWholesalerIntoDB,
};
