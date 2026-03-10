import mongoose from 'mongoose';
const urlSchema = new mongoose.Schema(
    {
        longUrl: {
            type: String,
            required: true
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
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: true }
    }
);

export default mongoose.model('Url', urlSchema);