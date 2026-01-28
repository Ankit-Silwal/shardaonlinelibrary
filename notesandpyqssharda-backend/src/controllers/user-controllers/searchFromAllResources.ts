import { Request, Response } from "express";
import { Note } from "../../models/notes/notes.model.js";
import { Pyq } from "../../models/pyqs/pyq.model.js";
import { Syllabus } from "../../models/syllabus/syllabus.model.js";

export const searchFromAllResources = async (req: Request, res: Response) => {
  try {
    const { query, type } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required",
      });
    }
    const regex = new RegExp(query, "i");
    let results: any[] = [];

    const filterItem = (item: any) => {
        return (
            (item.title && regex.test(item.title)) ||
            (item.program && regex.test(item.program)) ||
            (item.courseCode && regex.test(item.courseCode)) ||
            (item.courseName && regex.test(item.courseName)) ||
            (item.year && regex.test(item.year)) ||
            (!isNaN(parseInt(query)) && item.semester === parseInt(query))
        );
    };

    if (!type || type === "all" || type === "notes") {
      // Fetch all approved notes - My Model doesn't support partial query well, so fetch all approved 
      // or assume find({}) fetches all. Best is to use find({ status: 'approved' }) if supported
      // My Model find supports equality.
      const notes = await Note.find({ status: "approved" });
      const filteredNotes = notes.filter(filterItem);
      results = results.concat(filteredNotes);
    }
    
    if (!type || type === "all" || type === "pyqs") {
      const pyqs = await Pyq.find({ status: "approved" });
      const filteredPyqs = pyqs.filter(filterItem);
      results = results.concat(filteredPyqs);
    }
    
    if (!type || type === "all" || type === "syllabus") {
      const syllabus = await Syllabus.find({ status: "approved" });
      const filteredSyllabus = syllabus.filter(filterItem);
      results = results.concat(filteredSyllabus);
    }
    
    res.status(200).json({
      results,
    });
  } catch (error) {
     console.error("Error in combined search:", error);
     res.status(500).json({ success: false, message: "Internal Error" });
  }
};
