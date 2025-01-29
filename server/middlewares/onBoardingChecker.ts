import Students from "../schemas/students.js";

/* An onboarded user is identified if he has a collegeID */
//TODO: if a user gets out from the onboarding, the user account won't be created. mainly if he clicks the back button of the first slide.
function checkOnboarded(isOnBoardingFile: boolean) {
    async function middleware(req: any, res: any, next: any) {
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
    }

    return middleware
}


export default checkOnboarded
