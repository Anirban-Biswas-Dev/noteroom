import Students from "../schemas/students.js";
import Notes from "../schemas/notes.js";
import { IStudentDB } from "../types/database.types.js";
import mongoose from "mongoose";
import { deleteNoteImages, upload } from "./firebaseService.js";
import { log } from "../helpers/utils.js";
import Badges from "../schemas/badges.js";

export const Convert = {
    async getStudentID_username(username: string) {
        try {
            let studentID = (await Students.findOne({ username: username }, { studentID: 1 }))["studentID"]
            return studentID
        } catch (error) {
            log('error', `On Convert.getStudentID_username for ${username}: ${error.message}`)
            return null
        }
    },
    
    async getDocumentID_studentid(studentID: string) {
        try {
            let documentID = (await Students.findOne({ studentID: studentID }, { _id: 1 }))["_id"]
            return documentID
        } catch (error) {
            log('error', `On Convert.getDocumentID_studentid for ${studentID}: ${error.message}`)
            return null
        }
    },

    async getUserName_studentid(studentID: string) {
        try {
            let username = (await Students.findOne({ studentID: studentID }, { username: 1 }))["username"]
            return username
        } catch (error) {
            log('error', `On Convert.getUserName_studentid for ${studentID}: ${error.message}`)
            return null
        }
    },

    async getStudentID_email(email: string) {
        try {
            let studentID = (await Students.findOne({ email: email }, { studentID: 1 }))["studentID"]
            return studentID
        } catch (error) {
            log('error', `On Convert.getStudentID_email for ${email}: ${error.message}`)
            return null
        }
    },

    async getEmail_studentid(studentID: string) {
        try {
            let email = (await Students.findOne({ studentID: studentID }, { email: 1 }))["email"]
            return email
        } catch (error) {
            log('error', `On Convert.getEmail_studentid for ${studentID}: ${error.message}`)
            return null
        }
    },

    async getDisplayName_email(email: string) {
        try {
            let displayname = (await Students.findOne({ email: email }, { displayname: 1 }))["displayname"]
            return displayname
        } catch (error) {
            log('error', `On Convert.getDisplayName_email for ${email}: ${error.message}`)
            return null
        }
    },
    async getDocumentID_username(username: string) {
        try {
            let documentID = (await Students.findOne({ username: username }, { _id: 1 }))["_id"]
            return documentID
        } catch (error) {
            log('error', `On Convert.getDocumentID_username for ${username}: ${error.message}`)
            return null
        }
    }
}


export const SearchProfile = {
    async getRandomStudent(sampleSize: number, exclude?: string[]) {
        try {
            let students = await Students.aggregate([
                { $match: { visibility: "public", username: { $nin: exclude }, onboarded: true } },
                { $sample: { size: sampleSize } },
                { $project: { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0, collegeID: 1 } }
            ])
            return students
        } catch (error) {
            return []
        }
    },

    async getMutualCollegeStudents(studentDocID: string, options?: any) {
        let collegeID = (await Students.findOne({ _id: studentDocID }, { collegeID: 1 }))["collegeID"]
        if (!options) {
            let students = await Students.find({ collegeID: collegeID, visibility: "public", _id: { $ne: studentDocID } }, { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0, collegeID: 1 })
            return students
        } else {
            let resultCount: number | null 
            if (options.countDoc) {
                resultCount = await Students.countDocuments({ collegeID: collegeID, visibility: "public", _id: { $ne: new mongoose.Types.ObjectId(studentDocID) } })
            }

            let students = await Students.aggregate([
                { $match: { collegeID: collegeID, visibility: "public", _id: { $ne: new mongoose.Types.ObjectId(studentDocID) } } },
                { $skip: options.skip },
                { $limit: options.count },
                { $project: {
                    profile_pic: 1, 
                    displayname: 1, 
                    bio: 1, 
                    username: 1, 
                    _id: 0, 
                    collegeID: 1
                } }
            ])
            return {students, totalCount: resultCount}
        }
    },

    async getStudent(searchTerm: string, options?: any) {
        const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
        if (!options) {
            let students = await Students.find({ username: { $regex: regex }, visibility: "public", onboarded: true }, { profile_pic: 1, displayname: 1, bio: 1, username: 1, _id: 0 })
            return students
        } else {
            let resultCount: number | null 
            if (options.countDoc) {
                resultCount = await Students.countDocuments({ username: { $regex: regex }, visibility: "public", onboarded: true })
            }

            let students = await Students.aggregate([
                { $match: { username: { $regex: regex }, visibility: "public", onboarded: true } },
                { $skip: options.skip },
                { $limit: options.maxCount },
                { $project: {
                    profile_pic: 1, 
                    displayname: 1, 
                    bio: 1, 
                    username: 1, 
                    _id: 0 
                } }
            ])
            return {students, totalCount: resultCount}
        }
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
                    username: student["username"],
                    authProvider: student["authProvider"]
                })
            } else {
                reject('Sorry! No student account is associated with that email account')
            }
        })
    }
} 

export async function getProfile(username: string) {
    try {
        let student = await Students.aggregate([
            { $match: { username: username } },
            { $addFields: {
                featuredNoteCount: { $size: "$featured_notes" }
            } },
            { $lookup: {
                from: "notes",
                localField: "owned_notes",
                foreignField: "_id",
                as: "owned_posts"
            } },
            { $lookup: {
                from: 'badges',
                localField: 'badges',
                foreignField: 'badgeID',
                as: 'badges'
            } },    
            { $project: {
                _id: 0,
                username: 1, displayname: 1, group: 1,
                profile_pic: 1, bio: 1, collegeID: 1, collegeyear: 1,
                favouritesubject: 1, notfavsubject: 1, featuredNoteCount: 1,
                rollnumber: 1, badges: 1,
                owned_posts: {
                    $map: {
                        input: "$owned_posts",
                        as: "post",
                        in: {
                            noteTitle: "$$post.title",
                            noteID: "$$post._id",
                            noteThumbnail: { $first: "$$post.content" }
                        }
                    }
                }
            } }
        ])
        if (student.length === 0) return { ok: false }

        return { ok: true, student: student[0] }
    } catch (error) {
        console.log(error)
        return { ok: false }
    }
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


export async function changeProfileDetails(studentID: any, values: { fieldName: any, newValue: any }) {
    const allowedFields = ['displayname', 'bio', 'profile_pic', 'favouritesubject', 'notfavsubject', 'rollnumber'];
    try {
        let fieldName = values.fieldName;
        if (allowedFields.includes(fieldName)) {
            if (fieldName !== 'profile_pic') {
                await Students.updateOne({ studentID }, { $set: { [fieldName]: values.newValue } })
            } else {
                let student = await Students.findOne({ studentID: studentID, onboarded: true }, { profile_pic: 1 })
                if (student) {
                    let prvProfilePicURL = student.profile_pic
                    let savePath = `${student._id.toString()}/${values.newValue["name"]}`
                    let profilePicUrl = await upload(values.newValue, savePath, prvProfilePicURL.split('/')[1] === 'images' ? undefined : { replaceWith: prvProfilePicURL })
                    if (profilePicUrl) {
                        await Students.updateOne({ studentID }, { $set: { profile_pic: profilePicUrl } })
                    } else {
                        return prvProfilePicURL
                    }
                } else {
                    return false
                }
            }
            return true
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

export async function deleteAccount(studentDocID: string, firebase=false) {
    try {
        let deleteResult = await Students.deleteOne({ _id: studentDocID })
        if (deleteResult.deletedCount !== 0) {
            if (!firebase) {
                return { ok: true }
            } else {
                await deleteNoteImages({ studentDocID, noteDocID: ''}, false, true)
                return { ok: true }
            }
        } else {
            return { ok: false }
        }
    } catch (error) {
        return { ok: false }
    }
    
}

export async function deleteSessionsByStudentID(studentID: string) {
    try {
        const sessionSchema = new mongoose.Schema({}, { collection: 'sessions', strict: false });
        const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);
    
        let result = await Session.deleteMany({
            session: { $regex: `"stdid":"${studentID}"` } // Match the serialized JSON
        });
        if (result.deletedCount !== 0) {
            log('info', `On deleteSessionsByStudentID StudentID=${studentID || "--studentid--"}: Deleted session`)
            return { ok: true }
        } else {
            log('info', `On deleteSessionsByStudentID StudentID=${studentID || "--studentid--"}: Couldn't delete session`)
            return { ok: false }
        }
    } catch (error) {
        log('error', `On deleteSessionsByStudentID StudentID=${studentID || "--studentid--"}: ${error.message}`)
        return { ok: false }
    }
}
