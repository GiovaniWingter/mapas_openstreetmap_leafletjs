var pool = require("../../config/pool_conexoes");

    const mapaModel = {
        findAll: async () => {
            try {
                const [resultados] = await pool.query(
                    "SELECT * FROM pontos"
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;  
            }
        },
        findTipo: async (tipo) => {
            try {
                const [resultados] = await pool.query(
                    "SELECT * FROM pontos where tipo = ?",[tipo]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;  
            }
        }
    };

module.exports = {mapaModel}