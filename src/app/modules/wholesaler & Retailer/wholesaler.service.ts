import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { User } from "../user/user.model";
import { IUser } from "../user/user.interface";
import { flutterWaveModel } from "../flutterwavePackage/flutterwavePackage.model";
import { paymentVerificationModel } from "../multiPaymentMethod/multiPaymentMethod.model";
import { IPaginationOptions } from "../../../types/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import QueryBuilder from "../../builder/QueryBuilder";
import { USER_ROLES } from "../../../enums/user";

// get all wholesaler from db
// const getAllWholeSaler = async (query: Record<string, any>) => {
//   const queryBuilder = new QueryBuilder(
//     User.find({ role: USER_ROLES.Wholesaler }),
//     query
//   )
//     .search(["name", "email", "phone", "storeInformation.businessName"])
//     .filter()
//     .sort()
//     .paginate()
//     .fields();

//   const data = await queryBuilder.modelQuery;
//   const meta = await queryBuilder.getPaginationInfo();

//   return {
//     meta,
//     data,
//   };
// };

const getAllWholeSaler = async (query: Record<string, any>) => {
  const { searchTerm, ...filters } = query;

  const searchConditions: any[] = [];

  // if searchTerm exist → search across multiple fields
  if (searchTerm) {
    searchConditions.push({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
        {
          "storeInformation.businessName": {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ],
    });
  }

  Object.keys(filters).forEach((field) => {
    searchConditions.push({
      [field]: { $regex: filters[field], $options: "i" },
    });
  });

  // combine conditions
  const finalQuery =
    searchConditions.length > 0 ? { $and: searchConditions } : {};

  // base query
  const queryBuilder = new QueryBuilder(
    User.find({ role: USER_ROLES.Wholesaler }).find(finalQuery),
    query
  )
    .sort()
    .paginate()
    .fields();

  const data = await queryBuilder.modelQuery;
  const meta = await queryBuilder.getPaginationInfo();

  return {
    meta,
    data,
  };
};

// get single wholesaler from db
const getWholeSalerById = async (id: string) => {
  const wholeSalerUser = await User.findById(id);
  if (!wholeSalerUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Wholesaler not found!");
  }
  return wholeSalerUser;
};

// get all retailers from db
// wholesalerServices.js
const getAllRetailers = async ({
  search,
  email,
  name,
  phone,
  storeInformation,
  paginationOptions,
}: {
  search?: string;
  email?: string;
  name?: string;
  phone?: string;
  storeInformation?: any;
  paginationOptions?: IPaginationOptions;
}) => {
  const filter: any = { role: "Retailer", verified: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { "storeInformation.businessName": { $regex: search, $options: "i" } },
    ];
  }

  if (email) filter.email = { $regex: email, $options: "i" };
  if (name) filter.name = { $regex: name, $options: "i" };
  if (phone) filter.phone = { $regex: phone, $options: "i" };
  if (storeInformation?.businessName) {
    filter["storeInformation.businessName"] = {
      $regex: storeInformation.businessName,
      $options: "i",
    };
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions || {});
  const sortCondition: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const result = await User.find(filter)
    .sort(sortCondition)
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get retailers by month
const getRetailersByMonth = async () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear = new Date().getFullYear();
  const results = await Promise.all(
    months.map(async (month, index) => {
      const startDate = new Date(currentYear, index, 1);
      const endDate = new Date(currentYear, index + 1, 0);

      const total = await User.countDocuments({
        role: "Retailer",
        verified: true,
        createdAt: { $gte: startDate, $lte: endDate },
      });

      return { month, total };
    })
  );

  return results;
};

// get wholesaler by month
const getWholesalerByMonth = async () => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentYear = new Date().getFullYear();

  // Use the correct role for wholesalers
  const results = await Promise.all(
    months.map(async (month, index) => {
      const startDate = new Date(currentYear, index, 1);
      const endDate = new Date(currentYear, index + 1, 0);

      const total = await User.countDocuments({
        role: "Wholesaler",
        verified: true,
        createdAt: { $gte: startDate, $lte: endDate },
      });

      return { month, total };
    })
  );
  return results;
};

// update Wholesaler details
const updateWholesalerIntoDB = async (
  id: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  const updatedWholesaler = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updatedWholesaler) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Wholesaler not found!");
  }
  return updatedWholesaler;
};

// update Retailer details
const updateRetailerIntoDB = async (
  id: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  const updatedRetailer = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updatedRetailer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Retailer not found!");
  }
  return updatedRetailer;
};

// delete retailer from db
const deleteRetailerFromDB = async (id: string) => {
  const deletedRetailer = await User.findByIdAndDelete(id);
  if (!deletedRetailer) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Retailer not found!");
  }
  return deletedRetailer;
};

const getDashboardStatistics = async () => {
  const [
    totalWholesalers,
    totalRetailers,
    totalUniqueSubscribers,
    totalEarnings,
  ] = await Promise.all([
    User.countDocuments({ role: "Wholesaler", verified: true }),
    User.countDocuments({ role: "Retailer", verified: true }),

    // Log the raw data before aggregation
    (async () => {
      const rawPayments = await paymentVerificationModel.find({
        status: "successful",
      });
      return paymentVerificationModel.aggregate([
        { $match: { status: "successful" } },
        { $group: { _id: "$email" } },
      ]);
    })(),

    // Total Earnings Calculation
    flutterWaveModel.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  // Log the result of the aggregation for unique subscribers

  return {
    totalWholesalers,
    totalRetailers,
    totalSubscribers: totalUniqueSubscribers.length, // Directly use the length of the aggregation result
    totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
  };
};

export const wholesalerServices = {
  //* for wholesaler service
  getAllWholeSaler,
  getWholeSalerById,
  // deleteWholesalerFromDB,
  updateWholesalerIntoDB,
  //*  for retailer service
  getAllRetailers,
  updateRetailerIntoDB,
  deleteRetailerFromDB,
  getRetailersByMonth,
  getWholesalerByMonth,
  getDashboardStatistics,
};
