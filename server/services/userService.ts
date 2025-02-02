import Students from "../schemas/students.js";
import Notes from "../schemas/notes.js";
import { IStudentDB } from "../types/database.types.js";
import mongoose from "mongoose";

export const Convert = {
    async getStudentID_username(username: string) {
        let studentID = (await Students.findOne({ username: username }, { studentID: 1 }))["studentID"]
        return studentID
    },
    
    async getDocumentID_studentid(studentID: string) {
        let documentID = (await Students.findOne({ studentID: studentID }, { _id: 1 }))["_id"]
        return documentID
    },

    async getUserName_studentid(studentID: string) {
        let username = (await Students.findOne({ studentID: studentID }, { username: 1 }))["username"]
        return username
    },

    async getStudentID_email(email: string) {
        let studentID = (await Students.findOne({ email: email }, { studentID: 1 }))["studentID"]
        return studentID
    },

    async getEmail_studentid(studentID: string) {
        let email = (await Students.findOne({ studentID: studentID }, { email: 1 }))["email"]
        return email
    },

    async getDisplayName_email(email: string) {
        let displayname = (await Students.findOne({ email: email }, { displayname: 1 }))["displayname"]
        return displayname
    },
    async getDisplayName_studentID(studentID: string) {
        let displayname = (await Students.findOne({ studentID: studentID }, { displayname: 1 }))["displayname"]
        return displayname
    }
}


export const SearchProfile = {
    async getRandomStudent(sampleSize: number) {
        let students = await Students.aggregate([
            { $match: { visibility: "public" } },
            { $sample: { size: sampleSize } },
            { $project: { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0 } }
        ])
        return students
    },

    async getMutualCollegeStudents(studentDocID: string) {
        let collegeID = (await Students.findOne({ _id: studentDocID }, { collegeID: 1 }))["collegeID"]
        let students = await Students.find({ collegeID: collegeID, visibility: "public", _id: { $ne: studentDocID } }, { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0 })
        return students
    },

    async getStudent(searchTerm: string) {
        const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
        let students = await Students.find({ displayname: { $regex: regex }, visibility: "public" }, { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0 })
        return students
    }
}


export const SignUp = {
    async addStudent(studentData: IStudentDB) {
        let student = await Students.create(studentData)
        return student
    }
}

export const LogIn = {
    async getProfile(email: string) {
        let student = await Students.findOne({ email: email })
        return new Promise((resolve, reject) => {
            if (student) {
                resolve({
                    studentPass: student["password"],
                    recordID: student["_id"],
                    studentID: student["studentID"],
                    authProvider: student["authProvider"]
                })
            } else {
                reject('Sorry! No student account is associated with that email account')
            }
        })
    }
} 

export async function getProfile(studentID: string) {
    let student = await Students.findOne({ studentID: studentID })
    let students_notes_ids = student['owned_notes']
    let notes: any;
    if (students_notes_ids.length != 0) {
        notes = await Notes.find({ _id: { $in: students_notes_ids } })
    } else {
        notes = 0
    }
    return new Promise((resolve, reject) => {
        if ((student["length"] != 0)) {
            resolve({ student: student, notes: notes })
        } else {
            reject('No students found!')
        }
    })
}


export async function changePassword(email: string, password: string, current_password?: string): Promise<boolean | null> {
    try {
        if (!current_password) {
            await Students.updateOne({ 
                $and: [
                    { email: email },
                    { password: { $ne: null } }
                ]
            }, { $set: { password: password } })
            return true
        } else {
            let doc = await Students.updateOne({ 
                $and: [
                    { email: email },
                    { password: { $eq: current_password } }
                ]
            }, { $set: { password: password } })

            return doc.matchedCount === 1 ? true : null
        }
    } catch (error) {
        return false
    }
}


export async function deleteAccount(studentDocID: string) {
    try {
        let deleteResult = await Students.deleteOne({ _id: studentDocID })
        if (deleteResult.deletedCount !== 0) {
            return { ok: true }
        } else {
            return { ok: false }
        }
    } catch (error) {
        return { ok: false }
    }
    
}

export async function deleteSessionsByStudentID(studentID: string) {
    const sessionSchema = new mongoose.Schema({}, { collection: 'sessions', strict: false });
    const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
    
    try {
        let result = await Session.deleteMany({
            session: { $regex: `"stdid":"${studentID}"` } // Match the serialized JSON
        });
        if (result.deletedCount !== 0) {
            return { ok: true }
        } else {
            return { ok: false }
        }
    } catch (error) {
        return { ok: false }
    }
}
