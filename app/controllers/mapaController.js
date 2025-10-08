const {mapaModel} = require("../models/mapaModel");

const mapaController = {

    regrasValidacao: [],

    listar: async(req, res) => {
        if (req.query.tipo && req.query.tipo != 0 ){            
            res.json(await mapaModel.findTipo(req.query.tipo));
            console.table(await mapaModel.findAll())
        }else{
            console.table(await mapaModel.findAll())
            res.json(await mapaModel.findAll());
        }
    },

}

module.exports = {mapaController}