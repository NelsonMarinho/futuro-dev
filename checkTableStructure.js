const sqlite3 = require('sqlite3').verbose();

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./mydatabase.db');

// Verificar a estrutura da tabela users
db.all('PRAGMA table_info(users)', [], (err, rows) => {
    if (err) {
        return console.error('Erro ao recuperar a estrutura da tabela:', err.message);
    }
    console.log('Estrutura da tabela users:', rows);
    db.close();
});
