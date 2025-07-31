import { model, Schema, Types } from "mongoose";
import { IReplayFromWholesaler } from "./replayFromWholesaler.interface";

const replayFromWholesalerSchema = new Schema<IReplayFromWholesaler>(
    {
        product: { type: [Types.ObjectId], ref: "sendOffer", required: true },
        status: { type: String, enum: ["confirm", "received"], default: "received" },
        retailer: { type: Types.ObjectId, ref: "User", required: true },
        wholesaler: { type: Types.ObjectId, ref: "User", required: true }
    },
    {
        timestamps: true,
    }
);

export const ReplayFromWholesalerModel = model<IReplayFromWholesaler>("ReplayFromWholesaler", replayFromWholesalerSchema);