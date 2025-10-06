const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Inicializar banco de dados
const db = new Database('amigo-fiel.db');

// Criar tabelas se não existirem
const sqlScript = fs.readFileSync('database.sql', 'utf8');
db.exec(sqlScript);

console.log('Banco de dados inicializado com sucesso!');

// Rota para cadastrar dono e pet
app.post('/api/cadastro', (req, res) => {
    try {
        const { dono, pet } = req.body;

        // Validação dos campos obrigatórios do dono
        if (!dono.nome_completo || !dono.cpf || !dono.email || !dono.telefone || !dono.endereco) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos os campos do dono são obrigatórios!' 
            });
        }

        // Validação dos campos obrigatórios do pet
        if (!pet.nome_pet || !pet.especie || !pet.raca || !pet.data_nascimento) {
            return res.status(400).json({ 
                success: false, 
                message: 'Todos os campos do pet são obrigatórios (exceto observações)!' 
            });
        }

        // Verificar se CPF já existe
        const cpfExistente = db.prepare('SELECT id FROM dono WHERE cpf = ?').get(dono.cpf);
        if (cpfExistente) {
            return res.status(400).json({ 
                success: false, 
                message: 'CPF já cadastrado no sistema!' 
            });
        }

        // Iniciar transação
        const insertDono = db.prepare(`
            INSERT INTO dono (nome_completo, cpf, email, telefone, endereco)
            VALUES (?, ?, ?, ?, ?)
        `);

        const insertAnimal = db.prepare(`
            INSERT INTO animal (id_dono, nome_pet, especie, raca, data_nascimento, observacoes)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const transaction = db.transaction((dono, pet) => {
            const resultDono = insertDono.run(
                dono.nome_completo,
                dono.cpf,
                dono.email,
                dono.telefone,
                dono.endereco
            );

            insertAnimal.run(
                resultDono.lastInsertRowid,
                pet.nome_pet,
                pet.especie,
                pet.raca,
                pet.data_nascimento,
                pet.observacoes || null
            );

            return resultDono.lastInsertRowid;
        });

        const donoId = transaction(dono, pet);

        res.json({ 
            success: true, 
            message: 'Cliente e pet cadastrados com sucesso!',
            donoId: donoId
        });

    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao processar cadastro: ' + error.message 
        });
    }
});

// Rota para listar todos os cadastros
app.get('/api/cadastros', (req, res) => {
    try {
        const cadastros = db.prepare(`
            SELECT 
                d.id as dono_id,
                d.nome_completo,
                d.cpf,
                d.email,
                d.telefone,
                d.endereco,
                a.id as animal_id,
                a.nome_pet,
                a.especie,
                a.raca,
                a.data_nascimento,
                a.observacoes
            FROM dono d
            LEFT JOIN animal a ON d.id = a.id_dono
            ORDER BY d.id DESC
        `).all();

        res.json({ success: true, data: cadastros });
    } catch (error) {
        console.error('Erro ao buscar cadastros:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao buscar cadastros' 
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Fechar banco de dados ao encerrar
process.on('SIGINT', () => {
    db.close();
    console.log('Banco de dados fechado');
    process.exit(0);
});
