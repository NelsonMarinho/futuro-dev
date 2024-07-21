const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./mydatabase.db');

// Novo usuário e senha do administrador
const newAdminUsername = 'nelson';
const newAdminPassword = 'nelson123';

async function resetAdmin() {
    // Gerar um hash da nova senha
    const hashedPassword = await bcrypt.hash(newAdminPassword, 10);

    // Atualizar o registro do administrador no banco de dados
    db.run('UPDATE users SET username = ?, password = ? WHERE role = "admin"', [newAdminUsername, hashedPassword], function(err) {
        if (err) {
            return console.error('Erro ao atualizar o administrador:', err.message);
        }
        if (this.changes === 0) {
            // Se não encontrou um usuário admin, cria um novo
            db.run('INSERT INTO users (username, password, role) VALUES (?, ?, "admin")', [newAdminUsername, hashedPassword], function(err) {
                if (err) {
                    return console.error('Erro ao criar o administrador:', err.message);
                }
                console.log('Administrador criado com sucesso.');
            });
        } else {
            console.log('Administrador atualizado com sucesso.');
        }
    });
}

// Executar a função de redefinição do administrador
resetAdmin().then(() => db.close());
