import { db } from "../../config/firebase.js";

const collection = db.collection("users");

export class User {
  _id: string; // Firestore ID
  name: string;
  email: string;
  password?: string;
  contributions: number;
  passwordChangedAt?: Date;
  role: "user" | "mod" | "admin";
  isActive: boolean;
  modRequest?: "pending" | "approved" | "rejected" | null;
  contactNo?: string | null;
  modRequestAt?: Date | null;
  modMotivation?: string | null;
  isEmailVerified: boolean;
  emailOtpHash?: string;
  emailOtpExpiry?: Date;
  forgotPasswordToken?: string;
  forgotPasswordExpiry?: Date;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: any) {
    this._id = data._id || data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.contributions = data.contributions || 0;
    this.role = data.role || "user";
    this.isActive = data.isActive !== undefined ? data.isActive : true;

    // Optional fields
    this.modRequest = data.modRequest || null;
    this.contactNo = data.contactNo || null;
    this.modMotivation = data.modMotivation || null;
    this.isEmailVerified = data.isEmailVerified || false;
    this.emailOtpHash = data.emailOtpHash;
    this.forgotPasswordToken = data.forgotPasswordToken;
    this.refreshToken = data.refreshToken;

    // Dates
    this.passwordChangedAt = this.toDate(data.passwordChangedAt);
    this.modRequestAt = this.toDate(data.modRequestAt);
    this.emailOtpExpiry = this.toDate(data.emailOtpExpiry);
    this.forgotPasswordExpiry = this.toDate(data.forgotPasswordExpiry);
    this.createdAt = this.toDate(data.createdAt);
    this.updatedAt = this.toDate(data.updatedAt);
  }

  private toDate(val: any): Date | undefined {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    if (val.toDate && typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
    return new Date(val);
  }

  // Instance methods
  async save() {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) this.createdAt = now;

    // Copy properties to save
    const toSave: any = { ...this };
    delete toSave._id; // don't save DB ID in doc

    // Clean undefineds if needed, or rely on Firestore ignoreUndefinedProperties if set
    // Generally safe to send undefined to Firestore Admin SDK (it ignores them)

    if (this._id) {
      await collection.doc(this._id).set(toSave, { merge: true });
    } else {
      const res = await collection.add(toSave);
      this._id = res.id;
    }
    return this;
  }

  // Static methods
  static async findOne(query: any) {
    let ref: FirebaseFirestore.Query = collection;
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined) ref = ref.where(key, "==", val);
    }
    const snap = await ref.limit(1).get();
    if (snap.empty) return null;
    return new User({ ...snap.docs[0].data(), _id: snap.docs[0].id });
  }

  static async findById(id: string) {
    if (!id) return null;
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return new User({ ...doc.data(), _id: doc.id });
  }

  static async find(query: any = {}) {
    let ref: FirebaseFirestore.Query = collection;
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) ref = ref.where(key as string, "==", value);
    }
    const snapshot = await ref.get();
    return snapshot.docs.map(
      (doc: any) => new User({ ...doc.data(), _id: doc.id })
    );
  }
}

