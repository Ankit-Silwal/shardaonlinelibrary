import { Request, Response } from "express";
import { db } from "../../config/firebase.js";

export const searchPyqs = async (req: Request, res: Response) => {
  try {
    const { query, program, courseCode, semester, year } = req.query;

    if (query && typeof query !== "string") {
      return res.status(400).json({ success: false, message: "Query parameter must be a string" });
    }

    const snap = await db.collection("pyqs").where("status", "==", "approved").get();
    let pyqs = snap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));

    if (query && typeof query === "string") {
      const regex = new RegExp(query, "i");
      pyqs = pyqs.filter((item: any) => 
        (item.title && regex.test(item.title)) ||
        (item.program && regex.test(item.program)) ||
        (item.courseCode && regex.test(item.courseCode)) ||
        (item.courseName && regex.test(item.courseName)) ||
        (item.year && regex.test(item.year)) ||
        (!isNaN(parseInt(query)) && item.semester === parseInt(query))
      );
    }

    if (program && typeof program === "string") {
       const reg = new RegExp(program, "i");
       pyqs = pyqs.filter((item: any) => item.program && reg.test(item.program));
    }
    if (courseCode && typeof courseCode === "string") {
       const reg = new RegExp(courseCode, "i");
       pyqs = pyqs.filter((item: any) => item.courseCode && reg.test(item.courseCode));
    }
    if (semester && typeof semester === "string") {
       const s = parseInt(semester);
       pyqs = pyqs.filter((item: any) => item.semester === s);
    }
    if (year && typeof year === "string") {
       const reg = new RegExp(year, "i");
       pyqs = pyqs.filter((item: any) => item.year && reg.test(item.year));
    }

    res.status(200).json({ success: true, pyqs });
  } catch (error) {
    console.error("Error searching pyqs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
