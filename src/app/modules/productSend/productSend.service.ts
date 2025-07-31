import { JwtPayload } from "jsonwebtoken"
import ApiError from "../../../errors/ApiError"
import { IProductSend } from "./productSend.interface"
import { ProductSendModel } from "./productSend.model"
import { StatusCodes } from "http-status-codes"
import QueryBuilder from "../../builder/QueryBuilder"
import { Types } from "mongoose"
import { ProductModel } from "../Order/order.model"
import { ReplayFromWholesalerModel } from "../replayFromWholesaler/replayFromWholesaler.model"
import { SendOfferModelForRetailer } from "../sendOrder/sendOffer.model"

const sendProductToWholesalerIntoDB = async (user: JwtPayload, payload: IProductSend) => {
    const result = await ProductSendModel.create({ ...payload, retailer: user.id })
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to send product to wholesaler")
    }
    return result
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
            product: 'productName unit quantity additionalInfo',
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

const updateProductSendDetailIntoDB = async (id: string, user: JwtPayload) => {
    const details = await ProductSendModel.findById(id);

    if (!details) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Order not found");
    }

    if (!details.product || details.product.length === 0) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No products found in the order");
    }

    const allProduct = details.product.map((product) =>
        product._id ? product._id.toString() : product.toString()
    );

    console.log("allProduct", allProduct)

    return details;
};

export const productSendService = {
    sendProductToWholesalerIntoDB,
    getAllProductSendToWholeSalerFromDB,
    updateProductSendDetailIntoDB
}