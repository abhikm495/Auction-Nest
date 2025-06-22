import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const secureRoute = (required = false) => {
    return (req, res, next) => {
        const token = req.cookies.auth_token;
        
        if (!token) {
            if (required) {
                return res.status(401).json({ error: "Unauthorized" });
            } else {
                req.user = null;
                return next();
            }
        }

        try {
            const decode = jwt.verify(token, JWT_SECRET);
            req.user = decode;
            next();
        } catch (error) {
            console.log(error);
            if (required) {
                return res.status(401).json({ error: "Invalid or expired token" });
            } else {
                req.user = null;
                next();
            }
        }
    }
}