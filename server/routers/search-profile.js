const express = require('express')
const router = express.Router()
const Students = require('../schemas/students')

function serachProfileRouter(io) {
    async function getRandomStudent(sampleSize) {
        let students = await Students.aggregate([
            { $sample : { size: sampleSize } },
            { $project: { profile_pic: 1, displayname: 1, bio: 1, badge: 1, studentID: 1 } }
        ])
        return students
    }

    async function getStudent(searchTerm) {
        const regex = new RegExp(searchTerm.split(' ').map(word => `(${word})`).join('.*'), 'i');
        let students = await Students.find({ displayname: { $regex: regex } }, { profile_pic: 1, displayname: 1, bio: 1, badge: 1, studentID: 1 })
        return students
    }
    
    router.get('/', async (req, res, next) => {
        if(req.session.stdid) {
            try {
                let searchTerm = req.query.q
                if(searchTerm) {
                    let students = await getStudent(searchTerm)
                    res.json({ students })
                } else {
                    let students = await getRandomStudent(3)
                    res.render('search-profile', { students: students })    
                }
            } catch (error) {
                console.log(error)
                next(error)
            }
        } else {
            res.redirect('/login')
        }
    })

    return router
}

module.exports = serachProfileRouter