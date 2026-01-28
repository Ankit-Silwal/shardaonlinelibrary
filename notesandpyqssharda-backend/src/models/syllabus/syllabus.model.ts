import { db } from "../../config/firebase.js";

const collection = db.collection("syllabus");

export class Syllabus {
  _id: string;
  title: string;
  fileUrl: string;
  publicId: string;
  userId: string;
  program: string;
  courseCode: string;
  courseName: string;
  semester: number;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string | null;
  approvedAt?: Date | null;
  rejectedBy?: string | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: any) {
    this._id = data._id || data.id;
    this.title = data.title;
    this.fileUrl = data.fileUrl;
    this.publicId = data.publicId;
    this.userId = data.userId ? data.userId.toString() : "";
    this.program = data.program;
    this.courseCode = data.courseCode;
    this.courseName = data.courseName;
    this.semester = data.semester;
    this.status = data.status || "pending";
    this.approvedBy = data.approvedBy ? data.approvedBy.toString() : null;
    this.rejectedBy = data.rejectedBy ? data.rejectedBy.toString() : null;
    this.rejectionReason = data.rejectionReason || null;

    this.approvedAt = this.toDate(data.approvedAt);
    this.rejectedAt = this.toDate(data.rejectedAt);
    this.createdAt = this.toDate(data.createdAt);
    this.updatedAt = this.toDate(data.updatedAt);
  }

  private toDate(val: any): Date | undefined {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    if (val.toDate && typeof val.toDate === 'function') return val.toDate();
    return new Date(val);
  }

  async save() {
    const now = new Date();
    this.updatedAt = now;
    if (!this.createdAt) this.createdAt = now;

    const toSave: any = { ...this };
    delete toSave._id;

    if (this._id) {
      await collection.doc(this._id).set(toSave, { merge: true });
    } else {
      const res = await collection.add(toSave);
      this._id = res.id;
    }
    return this;
  }

  static async findOne(query: any) {
    let ref: FirebaseFirestore.Query = collection;
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined) ref = ref.where(key, "==", val);
    }
    const snap = await ref.limit(1).get();
    if (snap.empty) return null;
    return new Syllabus({ ...snap.docs[0].data(), _id: snap.docs[0].id });
  }

  static async findById(id: string) {
    if (!id) return null;
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return new Syllabus({ ...doc.data(), _id: doc.id });
  }

  static async find(query: any = {}) {
    let ref: FirebaseFirestore.Query = collection;
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && typeof value !== 'object') ref = ref.where(key as string, "==", value);
    }
    const snapshot = await ref.get();
    return snapshot.docs.map(
      (doc: any) => new Syllabus({ ...doc.data(), _id: doc.id })
    );
  }

  static async countDocuments(query: any = {}) {
     // Naive count
     return (await this.find(query)).length;
  }

  static async findByIdAndDelete(id: string) {
      if (!id) return null;
      await collection.doc(id).delete();
      return true;
  }

  async deleteOne() {
      if (this._id) {
          await collection.doc(this._id).delete();
      }
  }
}

