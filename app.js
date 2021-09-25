const express = require('express');
const app = express();
const morgan = require('morgan');

const rotaprodutos = require('./routes/produtos');
const rotapedidos = require('./routes/pedidos');
const rotaUsuarios = require('./routes/usuarios')

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Header',
     'Content-Type,Origin,X-Requested-With,Accept,Authorization');
     if(req.method == 'OPTIONS'){
         res.header('Acess-Control-Allow-Methods', 'POST,PUT,DELETE,PATCH,GET');
         return res.status(200).send({});
     }
     next();
});
app.use('/produtos', rotaprodutos);
app.use('/pedidos', rotapedidos);
app.use('/usuario', rotaUsuarios);
app.use((req, res, next) => {
    const error = new Error('Não encontrado');
  error.status = 404;
  next(error);
});
app.use((error,req,res,next) => {
    res.status(error.status || 500);
    return res.send({
        error: {
            mensagem: error.message,
        }
    })
})

module.exports = app;