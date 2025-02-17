"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = blogsRouter;
const express_1 = require("express");
const router = (0, express_1.Router)();
function blogsRouter() {
    router.get('/', (req, res) => {
        res.render('blog/all');
    });
    router.get('/why-use-noteroom', (req, res) => {
        res.render('blog/why-use-noteroom');
    });
    return router;
}
