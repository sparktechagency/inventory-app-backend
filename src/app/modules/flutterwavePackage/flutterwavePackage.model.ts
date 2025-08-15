import { Schema, model } from 'mongoose';
import { IFlutterWave } from './flutterwavePackage.interface';

const flutterWaveSchema = new Schema<IFlutterWave>(
    {
        userEmail: { type: String, required: true },
        transactionId: { type: String, required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ["successful", "failed"], required: true },
        tx_ref: { type: String },
        redirect_url: { type: String },
        startTime: { type: Date }
    },
    {
        timestamps: true,
    }
);

export const flutterWaveModel = model<IFlutterWave>('flutterWavePackage', flutterWaveSchema);