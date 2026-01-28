//to manage all the users

import { Request, Response } from "express";
import { User } from "../../models/users/user.model.js";

//fetch all users
export const fetchAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({});
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

export const fetchActiveUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({ isActive: true });
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch active users" });
    }
};

export const fetchInactiveUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({ isActive: false });
        res.status(200).json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch inactive users" });
    }
};


//deactivate a user account
export const deactivateUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isActive = false;
        await user.save();
        return res.status(200).json({ success: true, message: 'User account deactivated successfully' });
    } catch (error) {
        console.error('Error in deactivate user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

//activate a user account
export const activateUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isActive = true;
        await user.save();
        return res.status(200).json({ success: true, message: 'User account activated successfully' });
    } catch (error) {
        console.error('Error in activate user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


//delete a user account
export const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, message: 'User account deleted successfully' });
    } catch (error) {
        console.error('Error in delete user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


