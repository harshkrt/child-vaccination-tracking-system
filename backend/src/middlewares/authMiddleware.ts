import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User, IUser } from "../models/User";

export interface AuthenticatedRequest extends Request {
    user?: IUser;
}

// Middleware to protect routes
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            const token = req.cookies.token || req.headers.authorization.split(" ")[1];
            
            if (!token) {
                res.status(401).json({ msg: "Couldn't authorize, no token found." });
                return;
            }

            const decoded: any = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                res.status(401).json({ msg: "User not found" });
                return;
            }

            return next();
        } catch (error) {
            res.status(401).json({ msg: "Couldn't authorize" });
            return;
        }
    }

    res.status(401).json({ msg: "Couldn't authorize, no token found." });
    return;
};

//isadmin middleware
export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (req.user && req.user.role === 'admin') {
        next();
      } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
      }
    };
    
// Middleware to check roles
export const authorize = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "Access Denied." });
        }

        return next();
    };
};