import { Request, Response } from "express";
import { db } from "../../config/firebase.js";

export const fetchContributors = async (req: Request, res: Response) => {
  try {
    const contributorsSnap = await db.collection("users")
      .where("contributions", ">", 0)
      .orderBy("contributions", "desc")
      .limit(50)
      .get();

    const contributors = contributorsSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        _id: doc.id,
        name: d.name,
        email: d.email,
        contributions: d.contributions,
        createdAt: d.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      contributors,
    });
  } catch (error) {
    console.error("Error fetching contributors:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
