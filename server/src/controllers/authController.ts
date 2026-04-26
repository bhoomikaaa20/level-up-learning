import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
        expiresIn: "7d"
    });
};

// SIGNUP
export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, displayName } = req.body;

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "User exists" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashed,
            displayName
        });

        const token = generateToken(user._id.toString(), user.role);

        res.json({ user, token });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        const token = generateToken(user._id.toString(), user.role);

        res.json({ user, token });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};

// GET CURRENT USER
export const getMe = async (req: Request, res: Response) => {
    res.json((req as any).user);
};

