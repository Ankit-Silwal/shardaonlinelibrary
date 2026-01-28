import { Request, Response } from "express";
import { db } from "../../config/firebase.js";
import { User } from "../../models/users/user.model.js";

export const fetchAllPyqs = async (req: Request, res: Response) => {
  try {
    const { limit = "10" } = req.query;
    const limitNum = parseInt(limit as string);

    const snap = await db.collection("pyqs")
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .limit(limitNum)
      .get();

    const pyqs = await Promise.all(snap.docs.map(async (doc) => {
      const data = doc.data();
      let userDetails: any = null;
      if (data.userId) {
        const u = await User.findById(data.userId);
        if (u) userDetails = { _id: u._id, username: u.name };
      }
      return {
        ...data,
        _id: doc.id,
        userId: userDetails || data.userId,
      };
    }));

    res.status(200).json({
      success: true,
      pyqs,
      count: pyqs.length,
    });
  } catch (error) {
    console.error("Error fetching recent pyqs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
