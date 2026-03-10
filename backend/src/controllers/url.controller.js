import Url from "../models/url.model.js";
import { generateShortCode } from "../services/shortCode.service.js";

const isValidUrl = (string) => {
    try {
        const url = new URL(string);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false ;
    }
};

export const shortUrl = async (req, res) => {
    const { longUrl, customAlias } = req.body;
    if(!longUrl) {
        return res.status(400).json({message: "Long URL is required"});
    }
    if(!isValidUrl(longUrl)){
        return res.status(400).json({message:"Invalid URL"});
    }
    try {
        
        const shortCode = generateShortCode();
        const newUrl = await Url.create({
            longUrl,
            shortCode,
            title: customAlias || ""
        });
        res.status(201).json({
            shortUrl: `${process.env.BASE_URL}/api/url/${shortCode}`,
        });
    } catch(error) {
        res.status(500).json({message: "Server Error"});
    }
};

export const redirectUrl = async ( req, res) => {
    const { code} = req.params;
    try {
        const url = await Url.findOne({ shortCode: code});
        if(!url){
            return res.status(404).json({message: "URL not found"});
        }
        url.clicks++;
        await url.save();
        res.redirect(url.longUrl);
    } catch(error) {
        res.status(500).json({ message: "Server Error"});
    }
};