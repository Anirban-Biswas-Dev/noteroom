import {Router} from 'express'


const router = Router()

export default function blogsRouter() {

    router.get('/', (req, res) => {
        res.render('blog/all')
    })

    router.get('/why-use-noteroom', (req, res) => {
        res.render('blog/why-use-noteroom')
    })
    router.get('/the-productivity-code-by-anirban-biswas', (req, res) => {
        res.render('blog/the-productivity-code-by-anirban-biswas')
    })


    return router    
}
