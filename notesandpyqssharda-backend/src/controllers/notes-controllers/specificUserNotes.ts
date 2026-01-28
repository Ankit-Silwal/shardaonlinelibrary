import { Request, Response } from "express";
import { db } from "../../config/firebase.js";

export const fetchSpecificUserNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const snap = await db.collection("notes")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    const notes = snap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
    console.log("specific user notes", notes);

    res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Error fetching user notes:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
