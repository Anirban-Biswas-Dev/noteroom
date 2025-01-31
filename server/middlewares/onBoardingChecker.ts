import Students from "../schemas/students.js";

/* An onboarded user is identified if he has a collegeID */
function checkOnboarded(isOnBoardingFile: boolean) {
    async function middleware(req: any, res: any, next: any) {
        try {
            if (req.session["stdid"]) {
                let student = await Students.findOne({ studentID: req.session["stdid"] })
                if (student["collegeID"] === null) {
                    isOnBoardingFile ? res.render("onboarding") : res.redirect("/onboarding")
                } else {
                    next()
                }
            } else {
                let headers = req.headers['user-agent']
                if (headers.includes('facebook')) {
                    next()
                } else {
                    res.redirect("/login")
                }
            }
        } catch (error) {
            res.redirect('/')
        }
    }

    return middleware
}


export default checkOnboarded
