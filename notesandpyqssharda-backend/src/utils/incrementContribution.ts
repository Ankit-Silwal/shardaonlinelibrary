import { db } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";

export const incrementContribution = async (userId: string) => {
  if (!userId) return;
  try {
     const userRef = db.collection("users").doc(userId);
     await userRef.update({
         contributions: FieldValue.increment(1)
     });
  } catch (error) {
     console.error("Error incrementing contribution:", error);
  }
};

export const deacrementContribution = async (userId: string) => {
  if (!userId) return;
  try {
     const userRef = db.collection("users").doc(userId);
     await userRef.update({
         contributions: FieldValue.increment(-1)
     });
  } catch (error) {
     console.error("Error decrementing contribution:", error);
  }
};

