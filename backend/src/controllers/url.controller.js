import Url from "../models/url.model.js";
import { createUrlWithRetry } from "../services/shortCode.service.js";

const PRIVATE_IP_PATTERNS = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
];

const BLOCKED_HOSTNAMES = ['localhost', 'metadata.google.internal'];

const isPrivateHost = (hostname) => {
    if (BLOCKED_HOSTNAMES.includes(hostname)) return true;
    return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(hostname));
};

const isValidUrl = (string) => {
    try {
        const url = new URL(string);
        if (url.protocol !== "http:" && url.protocol !== "https:") return false;
        if (isPrivateHost(url.hostname)) return false;
        return true;
    } catch (_) {
        return false ;
    }
};

const TITLE_MAX = 100;

export const shortUrl = async (req, res) => {
    const { longUrl, title, customAlias } = req.body;
    if (!longUrl) {
        return res.status(400).json({ message: "Long URL is required" });
    }
    if (!isValidUrl(longUrl)) {
        return res.status(400).json({ message: "Invalid URL" });
    }

    const rawTitle = (typeof title === 'string' ? title : typeof customAlias === 'string' ? customAlias : '').trim();
    if (rawTitle.length > TITLE_MAX) {
        return res.status(400).json({
            message: `Title must be ${TITLE_MAX} characters or fewer`,
        });
    }

    try {
        const normalizedUrl = longUrl.trim();
        const existing = await Url.findOne({ longUrl: normalizedUrl });

        if (existing) {
            // Update title if user provided one
            if (rawTitle && existing.title !== rawTitle) {
                existing.title = rawTitle;
                await existing.save();
            }

            return res.status(200).json({
                shortUrl: `${process.env.BASE_URL}/${existing.shortCode}`,
                shortCode: existing.shortCode,
                title: existing.title,
            });
        }

        // Always generate strictly 7-character shortCode via createUrlWithRetry
        const doc = await createUrlWithRetry(normalizedUrl, rawTitle);

        res.status(201).json({
            shortUrl: `${process.env.BASE_URL}/${doc.shortCode}`,
            shortCode: doc.shortCode,
            title: doc.title,
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

export const redirectUrl = async ( req, res) => {
    const { code} = req.params;
    try {
        const url = await Url.findOneAndUpdate(
            { shortCode: code },
            { $inc: { clicks: 1 } },
            { new: true }
        );
        if(!url){
            return res.status(404).json({message: "URL not found"});
        }
        res.redirect(url.longUrl);
    } catch(error) {
        res.status(500).json({ message: "Server Error"});
    }
};