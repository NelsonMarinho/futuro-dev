const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new sqlite3.Database('./mydatabase.db');

// Configurar para servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Rota para servir index.html
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para registrar usuário
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, "user")', [username, hashedPassword], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error creating user' });
        }
        res.status(201).json({ success: true, message: 'User created successfully' });
    });
});

// Rota para listar usuários e hashes de senha
app.get('/users', (req, res) => {
    db.all('SELECT username, password, role FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error retrieving users' });
        }
        res.json({ success: true, users: rows });
    });
});

// Rota temporária para listar todos os usuários e senhas
app.get('/list-users', (req, res) => {
    db.all('SELECT username, password, role FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error retrieving users' });
        }
        res.json({ success: true, users: rows });
    });
});

// Rota para registrar carregamentos
app.post('/carregamentos', (req, res) => {
    const { data, composicao, vagoes, destino, filial, volume } = req.body;
    if (!data || !composicao || !vagoes || !destino || !filial || !volume) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }
    const sql = 'INSERT INTO carregamentos (data, composicao, vagoes, destino, filial, volume) VALUES (?, ?, ?, ?, ?, ?)';
    db.run(sql, [data, composicao, vagoes, destino, filial, volume], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao registrar o carregamento' });
        }
        res.status(201).json({ success: true, message: 'Carregamento registrado com sucesso', id: this.lastID });
    });
});

// Rota para listar carregamentos
app.get('/carregamentos', (req, res) => {
    db.all('SELECT * FROM carregamentos', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao recuperar carregamentos' });
        }
        res.json({ success: true, carregamentos: rows });
    });
});

// Rota para editar carregamento
app.get('/carregamentos/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM carregamentos WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao recuperar carregamento' });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: 'Carregamento não encontrado' });
        }
        res.json({ success: true, carregamento: row });
    });
});

app.put('/carregamentos/:id', (req, res) => {
    const { id } = req.params;
    const { data, composicao, vagoes, destino, filial, volume } = req.body;
    if (!data || !composicao || !vagoes || !destino || !filial || !volume) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }
    const sql = 'UPDATE carregamentos SET data = ?, composicao = ?, vagoes = ?, destino = ?, filial = ?, volume = ? WHERE id = ?';
    db.run(sql, [data, composicao, vagoes, destino, filial, volume, id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao atualizar o carregamento' });
        }
        res.json({ success: true, message: 'Carregamento atualizado com sucesso' });
    });
});

// Rota para deletar carregamento
app.delete('/carregamentos/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM carregamentos WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao excluir o carregamento' });
        }
        res.json({ success: true, message: 'Carregamento excluído com sucesso' });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
