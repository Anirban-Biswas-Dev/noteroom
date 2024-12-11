function errorHandler(err, req, res, next) {
    res.status(err.status || 500)
    if (err.errorID == 1000) {
        res.render('404-error', { message: `User with ID: ${req.studentID} not found` }) // 404 if any user can't be found with a student id
    } else {
        res.render('500-error', { message: err.message })
    }
}

export default errorHandler
