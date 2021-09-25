const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const multer = require('multer')
const login = require('../middleware/login')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const dateStr = new Date().toISOString().replace(/:/g, '-');
        cb(null, dateStr + file.originalname); 
      }
});
const upload = multer({
    storage: storage,

});

router.get('/', (req, res, next) => {
mysql.getConnection((error,conn) => {
    if(error) {
        return res.status(500).send({erro: error});
    }
    conn.query(
        `SELECT * FROM produtos;
            `,
        (error,result, fields) => {
            conn.release();
            if(error) {
                return res.status(500).send({erro: error})}
                const response = {
                  
                    produtos: result.map(prod => {
                        console.log(prod)
                        return {
                            id_produto: prod.id_produtos,
                            nome: prod.nome,
                            preco: prod.preco,
                            imagem:prod.imagem_produto,
                            request: {
                                tipo: 'GET',
                                descricao: 'Retorna os detalhes de todos os produtos',
                                url: "http://localhost:3000/produtos/" + prod.id_produtos
                            }
                        }
                    })
                } 
                console.log(response);
                return res.status(200).send(response); 
            }
         
        
    )
});
});



router.post('/', login ,upload.single('produto_imagem'), (req, res, next) => {
console.log(req.file,req.body)
mysql.getConnection((error,conn) => {

    if(error) {
        return res.status(500).send({erro: error});
    }
    conn.query('INSERT INTO produtos (nome,preco, imagem_produto) VALUES (?,?,?)',
    [req.body.nome, req.body.preco,req.file.path],
    (error,result, field) => {
        conn.release();

        if(error) {
            return res.status(500).send({erro: error});
           
           
        }
        const response = {
            mensagem: 'Produto cadatrado com sucesso',
            ProdutoCriado:{ id_produto: result.id_produtos,
                nome: req.body.nome,
                preco: req.body.preco,
                imagem:req.file.path,
                request: {
                    tipo: 'GET',
                    descricao: 'Retorna o produto cadastrado',
                    url: "http://localhost:3000/produtos/"
                }}
           
            
        }

        return res.status(201).send(response);
       
    }
     
    );});

   
});




router.get('/:id_produtos', (req, res, next) => {
    mysql.getConnection((error,conn) => {
        if(error) {
            return res.status(500).send({erro: error});
        }
        conn.query(
            'SELECT * FROM produtos WHERE id_produtos = ?;',
            [req.params.id_produtos],
            (error,result, fields) => {
                if(error) {
                    return res.status(500).send({erro: error})}
                    if(result.length == 0) {
                        return res.status(404).send({
                            mensagem:"Não foi encontrado produto com esse ID"
                        })
                    }
                    const response = {
                        produto:{
                             id_produto: result[0].id_produtos,
                            nome: result[0].nome,
                            preco: result[0].preco,
                            imagem: result[0].imagem_produto,
                            request: {
                                tipo: 'GET',
                                descricao: 'retorna um produto especifico',
                                url: "http://localhost:3000/produtos" 
                            }}
                       
                        
                    }

                    return res.status(202).send(response);
            }
        )
    });
});

router.patch('/', (req, res, next) => {
    mysql.getConnection((error,conn) => {
        if(error) {
            return res.status(500).send({erro: error});
        }
        conn.query(
           `UPDATE produtos
            SET nome = ?,
              preco = ?
              WHERE id_produtos = ? `,
            [
                req.body.nome,
                req.body.preco,
                req.body.id_produtos,
            ],

            (error,result, fields) => {
                if(error) {return res.status(500).send({erro: error})}
                
                const response = {
                    mensagem : "Produto atualizado com sucesso",
                    produtoAtualizado:{
                         id_produto: req.body.id_produtos,
                        nome: req.body.nome,
                        preco: req.body.preco,
                        request: {
                            tipo: 'GET',
                            descricao: 'retorna detalhes de um produto especifico',
                            url: "http://localhost:3000/produtos/" + req.body.id_produtos
                        }}
                   
                    
                }


                 res.status(202).send(response)
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
        'DELETE FROM produtos WHERE id_produtos = ? ',
            [
                req.body.id_produtos,
            ],

            (error,resultado, fields) => {
                if(error) {return res.status(500).send({erro: error})}
                const response = {
                    mensagem : "Produto removido com sucesso",
                        request: {
                            tipo: 'POST',
                            descricao: 'inseri um produto',
                            url: "http://localhost:3000/produtos",
                            body: {
                                nome: 'String',
                                preco: 'Number'
                            }
                        }
                   
                    
                }

                 res.status(202).send(response)
            }
        )
    });
});

module.exports = router;