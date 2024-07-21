const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./mydatabase.db');

// Novo usuário e senha do administrador
const newAdminUsername = 'novo_admin';
const newAdminPassword = 'nova_senha_segura';

async function resetAdmin() {
    // Adicionar a coluna 'role' se não existir
    db.run('ALTER TABLE users ADD COLUMN role TEXT', [], function(err) {
        if (err && err.message.indexOf('duplicate column name') === -1) {
            return console.error('Erro ao adicionar a coluna role:', err.message);
        }

        // Gerar um hash da nova senha
        bcrypt.hash(newAdminPassword, 10, (err, hashedPassword) => {
            if (err) {
                return console.error('Erro ao gerar o hash da senha:', err.message);
            }

            // Atualizar o registro do administrador no banco de dados
            db.run('UPDATE users SET username = ?, password = ?, role = "admin" WHERE role = "admin"', [newAdminUsername, hashedPassword], function(err) {
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
                db.close();
            });
        });
    });
}

// Executar a função de redefinição do administrador
resetAdmin();
