import Students from "../schemas/students.js";

async function checkOnboarded(isOnBoardingFile: boolean) {
    async function middleware(req: any, res: any, next: any) {
        if (req.session["stdid"]) {
            let student = await Students.findOne({ studentID: req.session["stdid"] })
            if (student["collegeID"] === null) {
                isOnBoardingFile ? res.render("onboarding") : res.redirect("/onboarding")
            } else {
                next()
            }
        } else {
            res.redirect("/login")
        }
    }

    return middleware
}


export default checkOnboarded
