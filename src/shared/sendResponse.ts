import { Response } from 'express';

type IData<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  Total?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPage: number;
    total: number;
  };
  data?: T;
};

const sendResponse = <T>(res: Response, data: IData<T>) => {
  const resData = {
    success: data.success,
    Total: Array.isArray(data.data) ? data.data.length : undefined,
    message: data.message,
    pagination: data.pagination,
    data: data.data,
  };
  res.status(data.statusCode).json(resData);
};

export default sendResponse;
