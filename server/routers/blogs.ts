import {Router} from 'express'


const router = Router()

export default function blogsRouter() {

    router.get('/', (req, res) => {
        res.render('blog/all')
    })

    router.get('/why-use-noteroom', (req, res) => {
        res.render('blog/why-use-noteroom')
    })


    return router    
}
