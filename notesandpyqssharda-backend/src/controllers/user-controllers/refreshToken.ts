import jwt from "jsonwebtoken";
import { User } from "../../models/users/user.model.js";
import { generateAccessToken } from "../../utils/generateJwtTokens.js";
import { Request, Response } from "express";
import { accessTokenCookieOptions } from "../../config/cookies.js";

export const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;


  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { userId: string };

    // Must use .select("+refreshToken") because it has select: false in the model
    const user = await User.findById(payload.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.role);
    res.cookie("accessToken", newAccessToken, accessTokenCookieOptions);
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.log("Refresh token error:", err);
    return res.status(403).json({ message: "Refresh token expired" });
  }
};
