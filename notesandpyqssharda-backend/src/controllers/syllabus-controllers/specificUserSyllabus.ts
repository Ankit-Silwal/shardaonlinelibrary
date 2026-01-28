import { Request, Response } from "express";
import { db } from "../../config/firebase.js";

export const fetchSpecificUserSyllabus = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const snap = await db.collection("syllabus")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
        
    const syllabus = snap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
    console.log("specifi users syllabus", syllabus);
    
    res.status(200).json({
      success: true,
      syllabus,
    });
  } catch (error) {
    console.error("Error fetching user syllabus:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
