import { JwtPayload } from "jsonwebtoken";
import { ReplayFromWholesalerModel } from "../replayFromWholesaler/replayFromWholesaler.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import QueryBuilder from "../../builder/QueryBuilder";
import { User } from "../user/user.model";
import { sendNotifications } from "../../../helpers/notificationsHelper";

const updatePendingProductAsRetailerFromDB = async (user: JwtPayload) => {
    const result = await ReplayFromWholesalerModel.updateMany(
        { retailer: user.id, status: "received" },
        { $set: { status: "confirm" } }
    );
    if (!result) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update product")
    }
    const updatedProducts = await ReplayFromWholesalerModel.find({
        retailer: user.id,
        status: "confirm",
    })
    const findThisUser = await User.findById(user.id)
    const wholesalerIds = updatedProducts.map((item) => item.wholesaler?.toString())
    const notificationPayload = {
        sender: user.id,
        receiver: wholesalerIds[0],
        message: `${findThisUser?.name} has confirmed the order id please check`,
    };
    await sendNotifications(notificationPayload);
    return updatedProducts
}


const getAllConfrimRequestFromRetailerIntoDB = async (user: JwtPayload, query: Record<string, any>) => {
    const queryBuilder = new QueryBuilder(ReplayFromWholesalerModel.find({ wholesaler: user.id, status: "confirm" }), query)
    queryBuilder
        .populate(['retailer'], { retailer: 'name phone storeInformation.location' })
        .populate(['wholesaler'], { wholesaler: 'name phone storeInformation.location' })
        .populate(['product'], { product: 'productName unit quantity additionalInfo status createdAt updatedAt' });
    const result = await queryBuilder.modelQuery;
    const meta = await queryBuilder.getPaginationInfo();
    const productsMap = new Map();
    const retailersMap = new Map();
    const wholesalersMap = new Map();
    result.forEach((item: any) => {
        if (item.product) {
            const productId = item.product._id.toString();

            // Check if product is already added — if not, then add with price
            if (!productsMap.has(productId)) {
                productsMap.set(productId, {
                    _id: item.product._id,
                    productName: item.product.productName,
                    unit: item.product.unit,
                    quantity: item.product.quantity,
                    additionalInfo: item.product.additionalInfo,
                    status: item.product.status,

                    // 🆕 Extra fields from ReplayFromWholesalerModel (i.e. order/request)
                    price: item.price,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                });
            }
        }

        if (item.retailer) {
            retailersMap.set(item.retailer._id.toString(), {
                _id: item.retailer._id,
                name: item.retailer.name,
                phone: item.retailer.phone,
                location: item.retailer.storeInformation?.location || '',
            });
        }

        if (item.wholesaler) {
            wholesalersMap.set(item.wholesaler._id.toString(), {
                _id: item.wholesaler._id,
                name: item.wholesaler.name,
                phone: item.wholesaler.phone,
                location: item.wholesaler.storeInformation?.location || '',
            });
        }
    });
    const data = {
        products: Array.from(productsMap.values()),
        retailers: Array.from(retailersMap.values()),
        wholesalers: Array.from(wholesalersMap.values()),
    };

    return {
        meta,
        data,
    };
}


const getAllConfirmRequerstFromRetailerIntoDBForRetailer = async (
    user: JwtPayload,
    query: Record<string, any>
) => {
    const queryBuilder = new QueryBuilder(
        ReplayFromWholesalerModel.find({ retailer: user.id, status: "confirm" }),
        query
    );

    queryBuilder
        .populate(['retailer'], { retailer: 'name phone storeInformation.location' })
        .populate(['wholesaler'], { wholesaler: 'name phone storeInformation.location' })
        .populate(['product'], { product: 'productName unit quantity additionalInfo status createdAt updatedAt' });

    const result = await queryBuilder.modelQuery;
    const meta = await queryBuilder.getPaginationInfo();

    // Extract unique product, retailer, wholesaler
    const productsMap = new Map();
    const retailersMap = new Map();
    const wholesalersMap = new Map();

    result.forEach((item: any) => {
        if (item.product) {
            const productId = item.product._id.toString();

            // Check if product is already added — if not, then add with price
            if (!productsMap.has(productId)) {
                productsMap.set(productId, {
                    _id: item.product._id,
                    productName: item.product.productName,
                    unit: item.product.unit,
                    quantity: item.product.quantity,
                    additionalInfo: item.product.additionalInfo,
                    status: item.product.status,

                    // 🆕 Extra fields from ReplayFromWholesalerModel (i.e. order/request)
                    price: item.price,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                });
            }
        }

        if (item.retailer) {
            retailersMap.set(item.retailer._id.toString(), {
                _id: item.retailer._id,
                name: item.retailer.name,
                phone: item.retailer.phone,
                location: item.retailer.storeInformation?.location || '',
            });
        }

        if (item.wholesaler) {
            wholesalersMap.set(item.wholesaler._id.toString(), {
                _id: item.wholesaler._id,
                name: item.wholesaler.name,
                phone: item.wholesaler.phone,
                location: item.wholesaler.storeInformation?.location || '',
            });
        }
    });

    const data = {
        products: Array.from(productsMap.values()),
        retailers: Array.from(retailersMap.values()),
        wholesalers: Array.from(wholesalersMap.values()),
    };

    return {
        meta,
        data,
    };
};





const testFromDB = async (user: JwtPayload) => {
    const result = await ReplayFromWholesalerModel.find({ retailer: user.id })
    console.log(result)
    return result
}


export const confirmationFromRetailerService = {
    updatePendingProductAsRetailerFromDB,
    getAllConfrimRequestFromRetailerIntoDB,
    getAllConfirmRequerstFromRetailerIntoDBForRetailer,
    testFromDB
}
