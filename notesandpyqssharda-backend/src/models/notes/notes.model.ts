import { db } from "../../config/firebase.js";
import { User } from "../users/user.model.js";

const collection = db.collection("notes");

class NoteQueryBuilder {
  query: any;
  ref: any;
  _limit: number | null = null;
  withUser: boolean = false;
  userFields: string | null = null;

  constructor(query: any) {
    this.query = query;
    this.ref = collection;
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) this.ref = this.ref.where(key, "==", value);
    }
  }

  sort(options: any) {
    const key = Object.keys(options)[0];
    const dir = options[key] === -1 ? "desc" : "asc";
    this.ref = this.ref.orderBy(key, dir);
    return this;
  }

  limit(num: number) {
    this._limit = num;
    this.ref = this.ref.limit(num);
    return this;
  }

  populate(field: string, fields?: string) {
    if (field === "userId") {
      this.withUser = true;
      this.userFields = fields || null;
    }
    return this;
  }

  lean() {
    return this;
  }

  async then(resolve: any, reject: any) {
    try {
      const snapshot = await this.ref.get();
      const notes = snapshot.docs.map(
        (doc: any) => new Note({ ...doc.data(), _id: doc.id })
      );

      if (this.withUser) {
        const userCache: any = {};
        await Promise.all(notes.map(async (note: any) => {
            if (!note.userId) return;
            const uid = typeof note.userId === 'object' ? note.userId.id || note.userId._id : note.userId;
            if (!uid) return;

            if (!userCache[uid]) {
                const u = await User.findById(uid.toString());
                if (u) {
                     let userObj: any = { _id: u._id, name: u.name, email: u.email }; 
                     userCache[uid] = userObj;
                }
            }
            if (userCache[uid]) {
                note.userId = userCache[uid];
            }
        }));
      }
      resolve(notes);
    } catch (err) {
      reject(err);
    }
  }
}

export class Note {
  _id: string;
  title: string;
  fileUrl: string;
  publicId: string;
  userId: any;
  program: string;
  courseCode: string;
  courseName: string;
  semester: number;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string; // ID
  approvedAt?: Date;
  rejectedBy?: string; // ID
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: any) {
    this._id = data._id || data.id;
    this.title = data.title;
    this.fileUrl = data.fileUrl;
    this.publicId = data.publicId;
    this.userId = data.userId;
    this.program = data.program;
    this.courseCode = data.courseCode;
    this.courseName = data.courseName;
    this.semester = data.semester;
    this.status = data.status || "pending";
    this.approvedBy = data.approvedBy ? data.approvedBy.toString() : null;
    this.approvedAt = this.toDate(data.approvedAt);
    this.rejectedBy = data.rejectedBy ? data.rejectedBy.toString() : null;
    this.rejectedAt = this.toDate(data.rejectedAt);
    this.rejectionReason = data.rejectionReason || null;
    this.createdAt = this.toDate(data.createdAt) || new Date();
    this.updatedAt = this.toDate(data.updatedAt) || new Date();
  }

  private toDate(val: any): Date | undefined {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    if (val.toDate) return val.toDate(); 
    return new Date(val);
  }

  async save() {
    this.updatedAt = new Date();
    if (!this.createdAt) this.createdAt = new Date();
    
    const toSave: any = { ...this };
    delete toSave._id; 
    
    if (typeof toSave.userId === 'object' && toSave.userId._id) {
        toSave.userId = toSave.userId._id;
    }

    if (this._id) {
       await collection.doc(this._id).set(toSave, { merge: true });
    } else {
       const res = await collection.add(toSave);
       this._id = res.id;
    }
    return this;
  }

  static find(query: any = {}) {
     return new NoteQueryBuilder(query);
  }

  static async findById(id: string) {
    if (!id) return null;
    const doc = await collection.doc(id).get();
    if (!doc.exists) return null;
    return new Note({ ...doc.data(), _id: doc.id });
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

