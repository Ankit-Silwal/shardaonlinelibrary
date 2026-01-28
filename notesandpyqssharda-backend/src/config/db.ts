import { db } from "./firebase.js";

const connectDB = async () => {
  try {
    console.log("✅ Firebase Firestore initialized (connectDB called)");
  } catch (error) {
    console.error("❌ Firebase init failed:", error);
    process.exit(1);
  }
};
export default connectDB;