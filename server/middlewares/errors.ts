import { log } from "../helpers/utils"

function errorHandler(err: any, req: any, res: any, next: any) {
    res.status(err.status || 500)
    log('error', `On error username=${req.studentID || "--username--"}: ${err.message}`)
    if (err.status === 404) {
        res.render('404-error', { message: err.message }) // 404 if any user can't be found with a student id
    } else {
        res.render('500-error', { message: err.message })
    }
}

export default errorHandler
