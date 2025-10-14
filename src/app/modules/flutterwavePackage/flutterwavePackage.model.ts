import { Schema, model } from "mongoose";
import { IFlutterWave } from "./flutterwavePackage.interface";

const flutterWaveSchema = new Schema<IFlutterWave>(
  {
    userEmail: { type: String, required: true },
    transactionId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    tx_ref: { type: String },
    redirect_url: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index
flutterWaveSchema.index({ userEmail: 1, status: 1, startTime: 1, endTime: 1 });

export const flutterWaveModel = model<IFlutterWave>(
  "flutterWavePackage",
  flutterWaveSchema
);
