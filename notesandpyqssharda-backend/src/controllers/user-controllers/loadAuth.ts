import { Response, Request } from "express";
import { User } from "../../models/users/user.model.js";

declare global {
  namespace Express {
    interface Request {
      data?: { user: { id: string } };
    }
  }
}

export const getMe = async (req: Request, res: Response) => {
  const userId = req.data?.user.id;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      contributions: user.contributions,
      createdAt: user.createdAt,
    },
  });
};
