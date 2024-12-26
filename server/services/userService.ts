import Students from "../schemas/students.js";
import Notes from "../schemas/notes.js";
import { IStudentDB } from "../types/database.types.js";

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
    }
}


export const SearchProfile = {
    async getRandomStudent(sampleSize: number) {
        let students = await Students.aggregate([
            { $sample: { size: sampleSize } },
            { $project: { profile_pic: 1, displayname: 1, bio: 1, badge: 1, studentID: 1, username: 1 } }
        ])
        return students
    },

    async getStudent(searchTerm: string) {
        const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
        let students = await Students.find({ displayname: { $regex: regex } }, { profile_pic: 1, displayname: 1, bio: 1, badge: 1, studentID: 1, username: 1 })
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