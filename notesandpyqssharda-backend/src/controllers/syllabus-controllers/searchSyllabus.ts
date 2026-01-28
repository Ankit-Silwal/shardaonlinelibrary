import { Request, Response } from "express";
import { db } from "../../config/firebase.js";

export const searchSyllabus = async (req: Request, res: Response) => {
  try {
    const { query, program, courseCode, semester, year } = req.query;

    if (query && typeof query !== "string") {
      return res.status(400).json({ success: false, message: "Query parameter must be a string"});
    }

    // Fetch all approved syllabus
    const snap = await db.collection("syllabus").where("status", "==", "approved").get();
    let syllabus = snap.docs.map(doc => ({ ...doc.data(), _id: doc.id }));

    // Apply regex filter for query
    if (query && typeof query === "string") {
      const regex = new RegExp(query, "i");
      syllabus = syllabus.filter((item: any) => 
        (item.title && regex.test(item.title)) ||
        (item.program && regex.test(item.program)) ||
        (item.courseCode && regex.test(item.courseCode)) ||
        (item.courseName && regex.test(item.courseName)) ||
        (!isNaN(parseInt(query)) && item.semester === parseInt(query))
      );
    }

    // Additional filters
    if (program && typeof program === "string") {
       const reg = new RegExp(program, "i");
       syllabus = syllabus.filter((item: any) => item.program && reg.test(item.program));
    }
    if (courseCode && typeof courseCode === "string") {
       const reg = new RegExp(courseCode, "i");
       syllabus = syllabus.filter((item: any) => item.courseCode && reg.test(item.courseCode));
    }
    if (semester && typeof semester === "string") {
       const s = parseInt(semester);
       if (!isNaN(s)) syllabus = syllabus.filter((item: any) => item.semester === s);
    }
    
    // Sort logic not strictly requested but good (recent first):
    // Since we fetched all, we can sort JS
    // syllabus.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)); 
    // Careful with date conversion from Firestore

    res.status(200).json({ success: true, syllabus });
  } catch (error) {
    console.error("Error searching syllabus:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
