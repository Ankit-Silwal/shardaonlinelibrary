import { Request, Response } from "express";
import { db } from "../../config/firebase.js";
import { User } from "../../models/users/user.model.js";
import { contentRejectionMail, contentApprovalMail } from "../../utils/email.js";

// Fetch pending syllabus
export const fetchPendingSyllabus = async (req: Request, res: Response) => {
  try {
    const snap = await db.collection("syllabus")
        .where("status", "==", "pending")
        .orderBy("createdAt", "desc")
        .get();

    const syllabus = await Promise.all(snap.docs.map(async doc => {
        const d = doc.data();
        let u: any = null;
        if (d.userId) {
            const user = await User.findById(d.userId);
            if (user) u = { _id: user._id, name: user.name, email: user.email };
        }
        return { ...d, _id: doc.id, userId: u || d.userId };
    }));
    res.status(200).json({ success: true, syllabus });
  } catch (error) {
    console.error("Error fetching pending syllabus:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending syllabus" });
  }
};

// Reject syllabus
export const rejectSyllabus = async (req: Request, res: Response) => {
  const { syllabusId } = req.params;
  const { rejectionReason } = req.body;

  try {
    if (!rejectionReason) return res.status(400).json({ success: false, message: "Reason required" });

    const docRef = db.collection("syllabus").doc(syllabusId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: "Not found" });

    const data = doc.data();
    
    await docRef.set({
        status: "rejected",
        rejectionReason,
        rejectedAt: new Date(),
        rejectedBy: req.user?.userId
    }, { merge: true });

    if (data && data.userId) {
        const user = await User.findById(data.userId);
        if (user) {
            await contentRejectionMail(user.email, user.name, "Syllabus", rejectionReason);
        }
    }

    res.status(200).json({ success: true, message: "Syllabus rejected" });
  } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Internal Error" });
  }
};

// Approve syllabus
export const approveSyllabus = async (req: Request, res: Response) => {
  const { syllabusId } = req.params;
  try {
    const docRef = db.collection("syllabus").doc(syllabusId);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false, message: "Not found" });

    const data = doc.data();

    await docRef.set({
        status: "approved",
        approvedAt: new Date(),
        approvedBy: req.user?.userId
    }, { merge: true });

    if (data && data.userId) {
         const user = await User.findById(data.userId);
         if (user) {
             await contentApprovalMail(user.email, user.name, "Syllabus");
         }
    }
    
    res.status(200).json({ success: true, message: "Syllabus approved" });
  } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Internal Error" });
  }
};
