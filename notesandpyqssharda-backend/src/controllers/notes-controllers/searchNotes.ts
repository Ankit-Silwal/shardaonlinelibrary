import { Request, Response } from "express";
import { db } from "../../config/firebase.js";

export const searchNotes = async (req: Request, res: Response) => {
  try {
    const { query, program, courseCode, semester, year } = req.query;

    if (query && typeof query !== "string") {
      return res.status(400).json({ success: false, message: "Query parameter must be a string" });
    }

    const snap = await db.collection("notes").where("status", "==", "approved").get();
    let notes = snap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));

    if (query && typeof query === "string") {
      const regex = new RegExp(query, "i");
      notes = notes.filter((item: any) => 
        (item.title && regex.test(item.title)) ||
        (item.program && regex.test(item.program)) ||
        (item.courseCode && regex.test(item.courseCode)) ||
        (item.courseName && regex.test(item.courseName)) ||
        (!isNaN(parseInt(query)) && item.semester === parseInt(query))
      );
    }

    if (program && typeof program === "string") {
       const reg = new RegExp(program, "i");
       notes = notes.filter((item: any) => item.program && reg.test(item.program));
    }
    if (courseCode && typeof courseCode === "string") {
       const reg = new RegExp(courseCode, "i");
       notes = notes.filter((item: any) => item.courseCode && reg.test(item.courseCode));
    }
    if (semester && typeof semester === "string") {
       const s = parseInt(semester);
       if (!isNaN(s)) notes = notes.filter((item: any) => item.semester === s);
    }

    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error("Error searching notes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
