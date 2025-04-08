import { OfferModel } from "./offer.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IOrder } from "./offer.interface";
import { notificationSender } from "../../../helpers/notificationSender";
import { Server } from "socket.io";
import { STATUS } from "../../../enums/status";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { USER_ROLES } from "../../../enums/user";
import mongoose from "mongoose";
// Service to create a new product (order)

const createOffers = async (payloads: IOrder[], io: Server) => {
    if (!Array.isArray(payloads) || payloads.length === 0) {
        console.error("Invalid payloads: Must be an array with at least 1 item");
        throw new ApiError(StatusCodes.BAD_REQUEST, "You must provide at least 1 order");
    }

    if (payloads.length > 5) {
        console.error("Too many orders: Cannot exceed 5");
        throw new ApiError(StatusCodes.BAD_REQUEST, "You can only send between 1 to 5 orders at a time");
    }

    const createdOrders = [];

    for (const payload of payloads) {
        // @ts-ignore
        if (!payload.wholeSeller || !payload.retailer || !Array.isArray(payload.products) || payload.products.length === 0) {
            console.error("Missing required fields in payload:", payload);
            throw new ApiError(StatusCodes.BAD_REQUEST, "Wholesaler, Retailer, and at least one Product ID are required");
        }

        // Transform products into the required format (with productId, availability, price)
        // @ts-ignore
        const formattedProducts = payload?.products?.map(productId => ({
            productId, // The ID of the product
            availability: payload.availability || false, // Default to false if not provided
            price: payload.price || 0, // Default to 0 if not provided
        }));

        // Ensure the product is passed as an array of objects, as per the schema
        const order = await OfferModel.create({
            retailer: payload.retailer,
            wholeSeller: payload.wholeSeller,
            product: formattedProducts,
            status: payload.status,
            price: payload.price,
            Delivery: payload.Delivery,
            availability: payload.availability
        });

        if (!order) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create the offer");
        }

        createdOrders.push(order);

        // Send Notification
        const notificationData = {
            userId: payload.wholeSeller.toString(),
            title: "New Order Received",
            message: `Retailer has sent an order with multiple products for ${order._id}.`,
            type: "order",
        };

        await notificationSender(io, `getNotification::${payload.wholeSeller}`, notificationData);
    }

    return { orders: createdOrders };
};








// update offer from wholesaler
const updateOfferIntoDB = async (
    user: JwtPayload,
    offerId: string,
    productUpdates: { productId: string; availability?: boolean; price?: number }[],
    status?: string,
    // @ts-ignore
    io: Server
) => {

    if (!Array.isArray(productUpdates)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "productUpdates must be an array");
    }

    if (!mongoose.Types.ObjectId.isValid(offerId) || productUpdates.some(p => !mongoose.Types.ObjectId.isValid(p.productId))) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Offer ID or Product ID format");
    }

    const userData = await User.findById(user.id).select("isSubscribed offersUpdatedCount role").lean();
    if (!userData) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "User not found");
    }

    const { isSubscribed, offersUpdatedCount, role } = userData;  // Accessing correct user data

    const isExistLimit = await OfferModel.countDocuments({ wholeSeller: user.id, status: "Received" });
    if (!isSubscribed && isExistLimit >= 10) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "You cannot update more than 10 offers. Subscribe to update more offers."
        );
    }

    const updateObject: any = {};
    if (status) {
        updateObject.status = status;
    }

    // Prepare bulk update operations for products
    const bulkOps = productUpdates.map(update => ({
        updateOne: {
            filter: {
                _id: offerId,
                "product.productId": update.productId
            },
            update: {
                $set: {
                    "product.$.availability": update.availability,
                    "product.$.price": update.price
                }
            }
        }
    }));

    // Execute bulk write to update product details
    await OfferModel.bulkWrite(bulkOps);

    // If offer status is provided, update it
    if (status) {
        await OfferModel.updateOne({ _id: offerId }, { $set: { status } });
    }

    // Fetch the updated offer with populated product details
    const updatedOffer = await OfferModel.findById(offerId)
        .populate("product.productId")
        .lean();

    if (!updatedOffer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found after update.");
    }

    // Only apply this logic for Wholesalers
    if (role === USER_ROLES.Wholesaler) {
        if (offersUpdatedCount && offersUpdatedCount >= 10) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "You have already send 10 offers. Please subscribe to update more.");
        } else {
            await User.findByIdAndUpdate(user.id, {
                $inc: { offersUpdatedCount: 1 },
            });
        }
    }

    // Prepare notification data
    const notificationData = {
        userId: updatedOffer.retailer!.toString(),
        title: "Offer Updated",
        message: `Your offer ${offerId} has been updated with new product details and status.`,
        type: "offer-update",
    };

    // Send the notification using Socket.IO
    await notificationSender(io, `getNotification::${updatedOffer.retailer}`, notificationData);

    // Return success response
    return {
        success: true,
        message: `Offer (ID: ${offerId}) and product details updated successfully.`,
        updatedOffer
    };
};








const updateOfferFromRetailer = async (
    offerId: string,
    payload: { productQuantities?: { productId: string, quantity: number }[]; status?: STATUS },
    io: Server
) => {
    try {
        // Step 1: Find the offer and populate product.productId
        const existingOffer = await OfferModel.findById(offerId)
            .populate({
                path: "product.productId",
                model: "Product",
                select: "name quantity unit additionalInfo"
            });

        if (!existingOffer) {
            throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
        }


        if (!existingOffer.product || existingOffer.product.length === 0) {
            throw new ApiError(StatusCodes.NOT_FOUND, "No products found in this offer.");
        }

        // Step 2: Update quantity for multiple products if provided
        if (payload.productQuantities && payload.productQuantities.length > 0) {
            for (let prodQty of payload.productQuantities) {
                // Correct way to instantiate ObjectId
                const productObjectId = new mongoose.Types.ObjectId(prodQty.productId); // Use `new` to create an ObjectId

                // Find the product in the offer by comparing ObjectId
                // @ts-ignore
                const product = existingOffer.product.find(p => p.productId.equals(productObjectId)); // Use `.equals()` to compare ObjectId

                if (!product) {
                    throw new ApiError(StatusCodes.NOT_FOUND, `Product with ID ${prodQty.productId} not found in the offer.`);
                }


                // Check if quantity is available
                // @ts-ignore
                if (prodQty.quantity > product.productId.quantity) {
                    throw new ApiError(
                        StatusCodes.BAD_REQUEST,
                        // @ts-ignore
                        `Insufficient stock for ${product.productId.name}. Available: ${product.productId.quantity}`
                    );
                }

                // Deduct stock only when status is 'confirm'
                if (payload.status === STATUS.confirm) {
                    // @ts-ignore
                    product.productId.quantity -= prodQty.quantity;
                }
            }

            // Save updated product stocks
            // @ts-ignore
            await Promise.all(existingOffer.product.map(prod => prod.productId?.save()));
        }

        // Step 3: Update offer status if provided
        if (payload.status) {
            existingOffer.status = payload.status;
        }

        // Step 4: Save the updated offer
        await existingOffer.save();

        // Step 5: Notify the wholesaler via Socket.IO
        const notificationData = {
            userId: existingOffer.wholeSeller!.toString(),
            title: "Order Updated by Retailer",
            message: `Retailer has updated the order ${offerId}.`,
            type: "order-update",
        };

        await notificationSender(io, `getNotification::${existingOffer.wholeSeller}`, notificationData);

        return { updatedOffer: existingOffer };
    } catch (error) {
        console.error("Error updating order:", error);
        throw new ApiError(StatusCodes.BAD_REQUEST, `Error updating order: ${error}`);
    }
};










// get all pending product from retailer
const getPendingOffersFromRetailerIntoDB = async (userId: string, role: string) => {
    try {
        if (!userId || !role) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid user credentials");
        }

        let filter: any = { status: STATUS.pending };

        if (role === USER_ROLES.Retailer) {
            filter.retailer = userId;
        } else if (role === USER_ROLES.Wholesaler) {
            filter.wholeSeller = userId;
        } else {
            throw new ApiError(StatusCodes.FORBIDDEN, "Unauthorized access");
        }

        // Correct way to populate product.productId
        const pendingOffers = await OfferModel.find(filter)
            .populate("retailer", "name email storeInformation") // Populate retailer
            .populate("wholeSeller", "name email storeInformation") // Populate wholesaler
            .populate({
                path: "product.productId", // Deep populate productId inside product array
                model: "Product",
                select: "name unit quantity additionalInfo", // Select only necessary fields
            })
            .lean();

        return {
            data: pendingOffers || []
        };
    } catch (error) {
        console.error("Error fetching pending offers:", error);
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to fetch pending offers");
    }
};






// single pending Offer From retailer
const getSinglePendingOfferFromRetailerIntoDB = async (retailerId: string, offerId: string) => {
    const offer = await OfferModel.findOne({
        _id: offerId,
        retailer: retailerId,
        status: STATUS.pending,
    }).populate("retailer").populate("wholeSeller").populate("product").lean();;

    if (!offer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }

    return offer;
};


//  delete single pending offers from retailer


const deleteSinglePendingOfferFromRetailer = async (retailerId: string, offerId: string) => {
    const deletedOffer = await OfferModel.findByIdAndDelete({
        _id: offerId,
        retailer: retailerId,
        status: STATUS.pending,
    });
    if (!deletedOffer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }
    return deletedOffer
}


//  for receive offer from wholesaler
const getAllReceiveOffers = async (user: JwtPayload) => {
    const offers = await OfferModel.find({
        retailer: user.id,
        status: "Receieved",
    })
        .populate("retailer")
        .populate("wholeSeller")
        .populate({
            path: "product.productId",
            model: "Product",
        })
        .lean();
    if (offers.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No received offers found");
    }
    return offers;
};



// single receive offer from wholesaler
const getSingleReceiveOfferFromRetailerIntoDB = async (retailerId: string, offerId: string) => {
    const offer = await OfferModel.findOne({
        _id: offerId,
        retailer: retailerId,
        status: STATUS.received,
    }).populate("retailer").populate("wholeSeller").populate("product").lean();;
    if (!offer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }

    return offer;
}


// delete receive offers
const deleteReceiveOffers = async (user: JwtPayload, offerId: string) => {
    const deletedOffer = await OfferModel.findByIdAndDelete({
        _id: offerId,
        retailer: user.id,
        status: STATUS.received,
    });
    if (!deletedOffer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Offer not found");
    }
    return deletedOffer
}


// confirm 


// get all from confirm

const getAllConfirmOffers = async (user: JwtPayload) => {
    let query: any = {};

    if (user.role === "Retailer") {
        query.retailer = user.id;
        query.status = STATUS.confirm;
    } else if (user.role === "Wholesaler") {
        query.wholeSeller = user.id;
        query.status = STATUS.confirm;
    } else {
        throw new ApiError(StatusCodes.FORBIDDEN, "Access denied");
    }

    const offers = await OfferModel.find(query)
        .populate("retailer")  // Populate retailer details
        .populate("wholeSeller")  // Populate wholesaler details
        .populate({
            path: "product.productId",  // Populate the productId inside the product array
            model: "Product",           // Specify the model to populate from
            select: "name unit quantity additionalInfo price" // Select the fields you need from Product model
        }).lean();

    if (!offers || offers.length === 0) {
        // throw new ApiError(StatusCodes.NOT_FOUND, "No offers found");
        return []
    }

    return offers;
};

// confirm single one
const getSingleConfirmOffer = async (user: JwtPayload) => {
    const offer = await OfferModel.findOne({
        retailer: user.id,
        status: STATUS.confirm,
    }).populate("retailer").populate("wholeSeller").populate("product").lean();;
    if (!offer) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No confirmed offers found");
    }
    return offer
}

// delete confirm offers
const deleteConfirmOffers = async (user: JwtPayload) => {
    const deletedOffers = await OfferModel.deleteMany({
        retailer: user.id,
        status: STATUS.confirm,
    });
    if (!deletedOffers) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No confirmed offers found to delete");
    }
    return deletedOffers
}

export const sendOfferService = {
    createOffers,
    updateOfferIntoDB,
    updateOfferFromRetailer,
    getPendingOffersFromRetailerIntoDB,
    getSinglePendingOfferFromRetailerIntoDB,
    deleteSinglePendingOfferFromRetailer,
    // receive
    getAllReceiveOffers,
    getSingleReceiveOfferFromRetailerIntoDB,

    deleteReceiveOffers,

    // confirm
    getAllConfirmOffers,
    getSingleConfirmOffer,
    deleteConfirmOffers
};
