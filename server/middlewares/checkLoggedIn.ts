export function checkLoggedIn(req, res, next) {
    if (req.session["stdid"]) {
        next()
    } else {
        res.redirect('/login')
    }
}
