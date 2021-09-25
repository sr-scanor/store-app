const express = require('express');
const { restart } = require('nodemon');
const router = express.Router();
const mysql = require('../mysql').pool;



router.get('/', (req, res, next) => {
    mysql.getConnection((error,conn) => {
        if(error) {
            return res.status(500).send({erro: error});
        }
        conn.query(
            `SELECT * FROM produtos INNER JOIN pedidos ON produtos.id_produtos = pedidos.id_produtos;
            `,
            (error,result, fields) => {
                if(error) {
                    return res.status(500).send({erro: error})}
                    const response = {
                        pedidos: result.map(pedidos => {
                            return {
                                id_pedido:pedidos.id_pedidos,
                                quantidade: pedidos.quantidade,
                                produto: {
                                id_produto: pedidos.id_produtos,
                                nome: pedidos.nome,
                                preco: pedidos.preco,
                                },
                               
                                request: {
                                    tipo: 'GET',
                                    descricao: 'Retorna os detalhes de todos os pedidos',
                                    url: "http://localhost:3000/produtos/" + pedidos.id_pedidos
                                }
                            }
                        })
                    } 
                    return res.status(200).send(response); 
                }
             
            
        )
    });
});

router.post('/', (req, res, next) => {
    mysql.getConnection((error,conn) => {
        if(error) {return res.status(500).send({erro: error})}

        conn.query('SELECT * FROM produtos WHERE id_produtos = ?', [req.body.id_produtos], (error, result, fields) => {
            if(error) {return res.status(500).send({erro: error})}
            if(result.length == 0) {return res.status(404).send({
                mensagem: "produto não encontrado"
            })}
            conn.query('INSERT INTO pedidos (id_produtos, quantidade) VALUES (?, ?)',
             [req.body.id_produtos, req.body.quantidade], (error,resut) => {
            conn.release();
            if(error) {return res.status(500).send({erro: error})}
            const response = {
                 mensagem: 'Pedido inserido com sucesso',
                 PedidoCriado: {
                 id_pedido: result.id_pedidos,
                 id_produto: req.body.id_produtos,
                 quantidade: req.body.quantidade,
                 request: {
                 tipo:'GET',
                 descricao: 'retorn todos os pedidos',
                 url: 'http://localhost:3000/pedidos'
        }
    }
}
            res.status(201).send(response);
            }) 
        })
    })
});




        router.get('/:id_pedidos', (req, res, next) => {
          mysql.getConnection((error,conn) => {
        if(error) {
            return res.status(500).send({erro: error});
        }
        conn.query(
            'SELECT * FROM pedidos WHERE id_pedidos = ?;',
            [req.params.id_pedidos],
            (error,result, fields) => {
                if(error) {
                    return res.status(500).send({erro: error})}
                    if(result.length == 0) {
                        return res.status(404).send({
                            mensagem:"Não foi encontrado pedido com esse ID"
                        })
                    }
                    const response = {
                        pedido:{
                            id_pedido: result[0].id_pedidos,
                             id_produto: result[0].id_produtos,
                             quantidade: result[0].quantidade,
                            request: {
                                tipo: 'GET',
                                descricao: 'retorna um pedido especifico',
                                url: "http://localhost:3000/pedidos" 
                            }}
                       
                        
                    }

                    return res.status(202).send(response);
            }
        )
    });
});


        router.delete('/', (req, res, next) => {
         mysql.getConnection((error,conn) => {
        if(error) {
            return res.status(500).send({erro: error});
        }
        conn.query(
        'DELETE FROM pedidos WHERE id_pedidos = ? ',
            [
                req.body.id_pedidos,
            ],

            (error,resultado, fields) => {
                if(error) {return res.status(500).send({erro: error})}
                const response = {
                    mensagem : "Pedido removido com sucesso",
                        request: {
                            tipo: 'POST',
                            descricao: 'inseri um pedido',
                            url: "http://localhost:3000/pedidos",
                            body: {
                                id_produto: 'Number',
                                quantidade: 'Number'
                            }
                        }
                   
                    
                }

                 res.status(202).send(response)
            }
        )
    });
});

module.exports = router;