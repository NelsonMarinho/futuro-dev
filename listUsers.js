const sqlite3 = require('sqlite3').verbose();

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./mydatabase.db');

// Listar todos os usuários e suas senhas
db.all('SELECT username, password, role FROM users', [], (err, rows) => {
    if (err) {
        return console.error('Erro ao recuperar usuários:', err.message);
    }
    console.log('Usuários:', rows);
    db.close();
});
