import { createPaystackProduct } from "../../../helpers/createPaystackProduct";
import { generatePaystackPaymentLink } from "../../../helpers/generatePaystackPaymentLink";
import { IPaymentPaystack } from "./PaymentPaystack.interface";
import { PaymentPaystackModel } from "./PaymentPaystack.model";

const createPaystackPackageIntoDB = async (payload: IPaymentPaystack, userEmail: string) => {
    const { name, description, price } = payload
    const paystacKProduct = await createPaystackProduct(name, description, price)
    const paymentLink = await generatePaystackPaymentLink(price, userEmail)
    const packageData = await PaymentPaystackModel.create({
        ...payload,
        productId: paystacKProduct.data.id,
        paymentLink
    })
    return packageData
}


export const PaymentPaystackService = {
    createPaystackPackageIntoDB
}