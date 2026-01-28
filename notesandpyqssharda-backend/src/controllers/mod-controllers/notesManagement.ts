import { Request, Response } from "express";
import { db } from "../../config/firebase.js";
import { User } from "../../models/users/user.model.js";
import { contentRejectionMail, contentApprovalMail } from "../../utils/email.js";

// Fetch pending notes
export const fetchPendingNotes = async (req: Request, res: Response) => {
  try {
    const snap = await db.collection("notes")
        .where("status", "==", "pending")
        .orderBy("createdAt", "desc")
        .get();

    const notes = await Promise.all(snap.docs.map(async doc => {
        const d = doc.data();
        let u: any = null;
        if (d.userId) {
            const user = await User.findById(d.userId);
            if (user) u = { _id: user._id, name: user.name, email: user.email };
        }
        return { ...d, _id: doc.id, userId: u || d.userId };
    }));
    res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error("Error fetching pending notes:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending notes" });
  }
};

// Reject note
export const rejectNote = async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const { rejectionReason } = req.body;

  try {
    if (!rejectionReason) return res.status(400).json({ success: false, message: "Reason required" });

    const docRef = db.collection("notes").doc(noteId);
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
            await contentRejectionMail(user.email, user.name, "Note", rejectionReason);
        }
    }

    res.status(200).json({ success: true, message: "Note rejected" });
  } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Internal Error" });
  }
};

// Approve note
export const approveNote = async (req: Request, res: Response) => {
  const { noteId } = req.params;
  try {
    const docRef = db.collection("notes").doc(noteId);
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
             await contentApprovalMail(user.email, user.name, "Note");
         }
    }
    
    res.status(200).json({ success: true, message: "Note approved" });
  } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Internal Error" });
  }
};
