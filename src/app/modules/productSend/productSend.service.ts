import mongoose, { Types } from "mongoose";
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
  payload: any,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productIds = payload.flatMap((item: any) => item.product);

    // product status update only for given productIds
    await SendOfferModelForRetailer.updateMany(
      { retailer: user.id, _id: { $in: productIds } },
      { status: true },
      { session },
    );

    const formattedPayload: IProductSend[] = payload.map((item: any) => ({
      product: item.product?.map((id: any) => ({
        _id: id,
        price: 0,
        availability: false,
      })),
      retailer: user.id as any,
      wholesaler: item.wholesaler as any,
      status: "pending",
      isDeleted: false,
    }));

    const result = await ProductSendModel.insertMany(formattedPayload, {
      session,
    });

    if (!result) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Failed to send product to wholesaler",
      );
    }

    await session.commitTransaction();
    session.endSession();
    // TODO: need to send notification to wholesaler
    process.nextTick(async () => {
      const userInfo = await User.findById(user.id);
      for (const item of formattedPayload) {
        await sendNotifications({
          sender: user.id,
          receiver: item.wholesaler,
          message: `${userInfo?.name || "Retailer"} has sent products. Please check availability.`,
        });
      }
    });

    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
  // collect all product IDs from payload
};

// get all just status true
const getAllProductSendToWholeSalerFromDB = async (
  user: JwtPayload,
  type: "pending" | "confirmed" | "received" | "delivered",
  query: Record<string, any>,
) => {
  if (type === "confirmed") type = "delivered";
  const filter: Record<string, any> = {
    status: type,
    isDeleted: false,
  };

  if (user.role === "Retailer") {
    filter.retailer = new Types.ObjectId(user.id);
  } else if (user.role === "Wholesaler") {
    filter.wholesaler = { $in: [user.id] };
  }

  if (query.status) {
    filter.status = query.status;
  }

  const productQuery = ProductSendModel.find(filter)
    .select("product retailer wholesaler note status createdAt updatedAt")
    .populate({
      path: "product._id",
      select: "productName unit quantity additionalInfo status",
      options: { lean: true },
    })
    .populate({
      path: "retailer",
      select:
        "name email phone storeInformation.businessName storeInformation.location image",
      options: { lean: true },
    })
    .populate({
      path: "wholesaler",
      select:
        "name email phone storeInformation.businessName storeInformation.location image",
      options: { lean: true },
    })
    .lean();


  const queryBuilder = new QueryBuilder(productQuery, {
    ...query,
    limit: query.limit ? Math.min(Number(query.limit), 100) : 50,
    page: query.page || 1,
  })
    .search(["note"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await queryBuilder.modelQuery.exec();
  const meta = await queryBuilder.getPaginationInfo();

  const updatedData = data?.map((doc: any) => ({
    ...doc,
    createdAt: new Date(new Date(doc?.updatedAt).getTime() + 3600000),
  }));

  return {
    meta,
    data: updatedData,
  };
};

const updateProductSendDetailIntoDB = async (
  id: string,
  user: JwtPayload,
  productData: {
    product: string;
    price: number;
    availability: boolean;
  }[],
) => {
  const [details, findThisUser] = await Promise.all([
    ProductSendModel.findById(id),
    User.findById(user.id),
  ]);
  const updateStatusRequest = await ProductSendModel.findByIdAndUpdate(id, {
    status: "received",
  });

  if (!details) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }
  if (!details.product || details.product.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "No products found in the order",
    );
  }
  if (findThisUser?.role !== USER_ROLES.Wholesaler) return;

  const currentOrder = findThisUser.order ?? 0;

  if (!findThisUser.isSubscribed && currentOrder <= 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Free trial order count is over please subscribe to continue",
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
        "Missing product, price or availability",
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
    message: `${findThisUser?.name || "Wholesaler"} has confirmed the order id ${id}`,
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
  // for 1 hour ahead time display
  const updatedData = details?.map((doc: any) => {
    const obj = doc.toObject(); // Mongoose document -> plain object
    obj.createdAt = new Date(
      new Date(obj.createdAt).getTime() + 60 * 60 * 1000,
    );
    return obj;
  });


  return updatedData;
};
// TODO: update product jeta wholesaler price and availability update korbe.
const updateAllProductStatusPriceAndAvailabilityIntoDB = async (
  user: JwtPayload,
  id: string,
  payload: IProductSend,
) => {
  const productSend = await ProductSendModel.findById(id);
  if (!productSend) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Product not found");
  }

  productSend.status = "received";

  for (const updatedProd of payload.product) {
    const prodIndex = productSend.product.findIndex(
      (p) => p._id.toString() === updatedProd._id.toString(),
    );
    if (prodIndex !== -1) {
      productSend.product[prodIndex].price = updatedProd.price;
      productSend.product[prodIndex].availability = updatedProd.availability;
    }
  }

  await productSend.save();

  for (const prod of payload.product) {
    await SendOfferModelForRetailer.findByIdAndUpdate(prod._id, {
      price: prod.price,
      availability: prod.availability,
      status: true,
      $unset: { isDraft: 1 },
    });
  }

  const notificationPayload = {
    sender: user.id,
    receiver: productSend.retailer,
    message: `${user.name || "Wholesaler"} has confirmed the order id ${id}`,
  };
  await sendNotifications(notificationPayload);

  return productSend;
};

// update bulk quantity base on retailer
const updateProductReceivedToConfirmRequestFromRetailerToWholesalerIntoDB =
  async (user: JwtPayload, id: string, payload: any) => {
    const statusUpdate = await ProductSendModel.findByIdAndUpdate(
      id,
      { status: "confirmed" },
      { new: true },
    ).exec();
    if (!statusUpdate) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update product");
    }
    for (const prod of payload.product) {
      if (prod.quantity !== undefined) {
        await SendOfferModelForRetailer.findByIdAndUpdate(
          prod._id,
          { quantity: prod.quantity },
          { new: true },
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

  console.log("User in getAllConfirmProductFromRetailerDB:", user);
  const details = await ProductSendModel.find({
    retailer: user.id,
    status: { $in: ["confirmed", "delivered"] },
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
  // for 1 hour ahead time display
  const updatedData = details?.map((doc: any) => {
    const obj = doc.toObject(); // Mongoose document -> plain object
    obj.createdAt = new Date(
      new Date(obj.createdAt).getTime() + 60 * 60 * 1000,
    );
    return obj;
  });



  return updatedData;
};

const getAllReceivedProductFromRetailerDB = async (user: JwtPayload) => {

  const details = await ProductSendModel.find({
    wholesaler: user.id,
    status: "received",
  })
    .populate({
      path: "product._id",
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
  console.log("User in getAllConfirmProductFromWholesalerDB:", user);
  const details = await ProductSendModel.find({
    wholesaler: user.id,
    status: { $in: ["confirmed", "delivered"] },
  })
    .populate({
      path: "product._id",
      select: "productName unit quantity additionalInfo retailer status ",
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

  if (!details) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }
  // for 1 hour ahead time display
  const updatedData = details.map((doc: any) => ({
    ...doc,
    createdAt: new Date(new Date(doc.createdAt).getTime() + 60 * 60 * 1000),
  }));
  return updatedData;
};

// delivary status change
const updateDelivaryStatusAsaWholesalerIntoDB = async (
  user: JwtPayload,
  id: string,
) => {
  const statusUpdate = await ProductSendModel.findByIdAndUpdate(
    id,
    { status: "delivered" },
    { new: true },
  ).exec();
  if (!statusUpdate) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update product");
  }
  const findThisUser = await User.findById(user.id);
  if (!findThisUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (!findThisUser.isSubscribed) {
    if (findThisUser.order! > 50) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Order limit reached. Please subscribe.",
      );
    }
    // Increment order for non-subscribed user
    await User.findByIdAndUpdate(user.id, {
      order: findThisUser.order! + 1,
    });
  }
  const notificationPayload = {
    sender: user.id,
    receiver: statusUpdate.retailer,
    message: `${findThisUser?.name || "Wholesaler"} has confirmed the order id ${id}`,
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

// product update save as like isDraft true.

const saveAsDraftStatusTrueIntoDB = async (
  user: JwtPayload,
  productSendId: string,
  payload: any,
) => {
  const productSend = await ProductSendModel.findById(productSendId);
  if (!productSend) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
  }

  for (const prod of payload.product) {
    const result = await ProductSendModel.updateOne(
      { _id: productSendId, "product._id": prod._id },
      {
        $set: {
          "product.$.isDraft": true,
          "product.$.price": prod.price,
          "product.$.availability": prod.availability,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Failed to update product with ID ${prod._id}`,
      );
    }
  }

  const updatedProductSend = await ProductSendModel.findById(productSendId);

  return updatedProductSend;
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
  saveAsDraftStatusTrueIntoDB,
};
