import { JwtPayload } from "jsonwebtoken"
import ApiError from "../../../errors/ApiError"
import { IProductSend } from "./productSend.interface"
import { ProductSendModel } from "./productSend.model"
import { StatusCodes } from "http-status-codes"
import QueryBuilder from "../../builder/QueryBuilder"
import { SendOfferModelForRetailer } from "../sendOrder/sendOffer.model"
import { ReplayFromWholesalerModel } from "../replayFromWholesaler/replayFromWholesaler.model"
import { sendNotifications } from "../../../helpers/notificationsHelper"
import { User } from "../user/user.model"
import { USER_ROLES } from "../../../enums/user"

const sendProductToWholesalerIntoDB = async (user: JwtPayload, payload: IProductSend) => {
    const result = await ProductSendModel.create({ ...payload, retailer: user.id })
    const productIds = payload.product

    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to send product to wholesaler");
    }

    const ids = Array.isArray(productIds) ? productIds : [productIds];

    for (const id of ids) {
        await SendOfferModelForRetailer.findByIdAndUpdate(id, { status: true });
    }
    const findThisUser = await User.findById(user.id)
    for (const wholesalerId of payload?.wholesaler!) {
        const notificationPayload = {
            sender: user.id,
            receiver: wholesalerId,
            message: `A new product has been sent to wholesaler by ${findThisUser?.name} and order id is ${result._id}`,
        };

        await sendNotifications(notificationPayload);
    }

    return result;
}


// get all
const getAllProductSendToWholeSalerFromDB = async (
    user: JwtPayload,
    type: "pending" | "confirm" | "received",
    query: Record<string, any>

) => {
    const filter: Record<string, any> = { status: type };

    if (user.role === 'Retailer') {
        filter.retailer = user.id;
    } else if (user.role === 'Wholesaler') {
        filter.wholesaler = { $in: [user.id] };
    }

    if (query.status) {
        filter.status = query.status;
    }

    const productQuery = ProductSendModel.find(filter);

    const queryBuilder = new QueryBuilder(productQuery, query)
        .search(['note']) // or any searchable field
        .filter()
        .sort()
        .paginate()
        .fields()
        .populate(['product', 'retailer', 'wholesaler'], {
            product: 'productName unit quantity additionalInfo price',
            retailer: 'name email',
            wholesaler: 'name email',
        });

    const data = await queryBuilder.modelQuery;
    const meta = await queryBuilder.getPaginationInfo();

    return {
        meta,
        data,
    };
};

const updateProductSendDetailIntoDB = async (id: string, user: JwtPayload, productData: any) => {
    const details = await ProductSendModel.findById(id);
    const updateStatusRequest = await ProductSendModel.findByIdAndUpdate(id, { status: "received" });
    if (!details) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
    }

    if (!details.product || details.product.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No products found in the order");
    }
    const findThisUser = await User.findById(user.id)
    if (findThisUser?.role !== USER_ROLES.Wholesaler) return;

    const currentOrder = findThisUser.order ?? 0;

    if (!findThisUser.isSubscribed && currentOrder <= 0) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Free trial order count is over please subscribe to continue"
        );
    }

    await User.findByIdAndUpdate(user.id, {
        order: currentOrder - 1,
    });
    const createdEntries = [];

    for (const item of productData) {
        if (!item.product || !item.price || item.availability === undefined) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Missing product, price or availability");
        }

        const created = await ReplayFromWholesalerModel.create({
            product: item.product,
            retailer: details.retailer,
            wholesaler: user.id,
            price: item.price,
            availability: item.availability,
            status: "received"
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





export const productSendService = {
    sendProductToWholesalerIntoDB,
    getAllProductSendToWholeSalerFromDB,
    updateProductSendDetailIntoDB,
}