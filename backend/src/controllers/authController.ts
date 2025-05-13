import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';


const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {expiresIn: "7d"});
}

//Register a new user
export const registerUser =  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ msg: "User already exists"});
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        }) as any;

        const token = generateToken(newUser._id.toString());

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
}


//Login a user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user: any = await User.findOne({ email});
        if (!user) {
            res.status(400).json( {msg: "Invalid Credentials"});
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ msg: "Invalid Credentials"});
            return;
        }

        const token = generateToken(user._id.toString());

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
}

//logout a user
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({ msg: "Logged out successfully" });
}

//get profile of the user
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    const user = (req as any).user;

    if (!user) {
        res.status(401).json({msg: "Not authorized"});
        return;
    }

    res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    });
};