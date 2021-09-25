const jwt = require('jsonwebtoken');
const authconfig = require('../config/auth.json')

module.exports = (req,res, next) => {
   

    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, authconfig.secret);
        req.usuario = decode;
        next();
    } catch (error) {
        return res.status(401).send({
            mensagem: "falha na autenticação"
        })
    }
}