const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./mydatabase.db');

// Novo usuário e senha do administrador
const adminUsername = 'novo_admin';  // O nome de usuário existente do admin que você quer redefinir a senha
const newAdminPassword = 'nova_senha_segura';  // A nova senha desejada

async function resetAdminPassword() {
    // Gerar um hash da nova senha
    const hashedPassword = await bcrypt.hash(newAdminPassword, 10);

    // Atualizar o registro do administrador no banco de dados
    db.run('UPDATE users SET password = ? WHERE username = ? AND role = "admin"', [hashedPassword, adminUsername], function(err) {
        if (err) {
            return console.error('Erro ao atualizar a senha do administrador:', err.message);
        }
        if (this.changes === 0) {
            console.log('Administrador não encontrado ou nenhuma alteração realizada.');
        } else {
            console.log('Senha do administrador atualizada com sucesso.');
        }
        db.close();
    });
}

// Executar a função de redefinição da senha do administrador
resetAdminPassword();
