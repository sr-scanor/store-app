const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const authconfig = require('../config/auth.json')

router.post('/cadastro', (req,res,next) => {
    mysql.getConnection((err,conn) => {
        if(err) {return res.status(500).send({erro: err})}
        conn.query('SELECT * FROM usuarios WHERE email = ?', [req.body.email,], (err, results) => {
            if(err) {return res.status(500).send({erro: err})}
            if(results.length > 0) {
                res.status(409).send({
                    mensagem: "Usuario já cadastrado"
                })
            } else {
                bcrypt.hash(req.body.senha, 10, (errBcrypt, hash) => {
                    if(errBcrypt) {
                        return res.status(500).send({error: errBcrypt})}
                        conn.query('INSERT INTO usuarios (email, senha) VALUES (?,?)', [req.body.email, hash],
                        (err,results) => {
                            conn.release();
                            if(err) {
                                return res.status(500).send({error: err}) }
                                const response = {
                                    mensagem: 'usuario cadastrado com sucesso',
                                    UsuarioCriado: {
                                        id: results.insertId,
                                        email: req.body.email,
                                       
                                }}
                              
                                return res.status(201).send(response)
                                
                        })
                })
            }
        })
       
    });
})

router.post('/login', (req, res, next) => {
    mysql.getConnection((error,conn) => {
        if(error) {return res.status(500).send({erro: error})}
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        conn.query(query, [req.body.email], (error, results, fields) => {
            conn.release();
            if(error) {return res.status(500).send({erro: error})}
            if(results.length < 1 ) {return res.status(401).send({message: "falha na autenticação"})}
            bcrypt.compare(req.body.senha, results[0].senha, (err, result) => {
                if(err) {return res.status(401).send({mensagem: "falha na autenticação"})}
                if(result) {
let token = jwt.sign({
    id_usuario: results[0].id_usuario,
    email: results[0].email
}, authconfig.secret,
{
    expiresIn: "2d"
}
)

                    return res.status(200).send({
                        mensagem: "Autenticado com sucesso",
                        token: token
                    })
                }
                return res.status(401).send({message: "falha na autenticação"})
            })
        });
    })
})






module.exports = router;