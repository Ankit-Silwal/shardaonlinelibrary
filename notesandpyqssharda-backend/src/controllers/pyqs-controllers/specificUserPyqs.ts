import { Request, Response } from "express";
import { db } from "../../config/firebase.js";

export const fetchSpecificUserPyqs = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const snap = await db.collection("pyqs")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    const pyqs = snap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
    console.log("specific user pyqs", pyqs);

    res.status(200).json({
      success: true,
      pyqs,
    });
  } catch (error) {
    console.error("Error fetching user pyqs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
