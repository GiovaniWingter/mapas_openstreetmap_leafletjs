var express = require("express");
var router = express.Router();

const {mapaController} = require("../controllers/mapaController")

router.get('/', (req, res) => {
    res.render("pages/index")
});

router.get('/api/pontos', (req, res) => {
    mapaController.listar(req, res);
});





module.exports = router;