import mongoose from 'mongoose';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const urlSchema = new mongoose.Schema(
    {
        longUrl: {
            type: String,
            required: true,
            index: true
        },
        shortCode: {
            type: String,
            required: true,
            unique: true
        },
        clicks: {
            type: Number,
            default: 0
        },
        title: {
            type: String,
            default:""
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + THIRTY_DAYS_MS),
            index: { expires: 0 }
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: true }
    }
);

export default mongoose.model('Url', urlSchema);