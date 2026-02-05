const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const auth = require('basic-auth');
const { Parser } = require('json2csv');
const path = require('path');

// Carrega variáveis de ambiente do arquivo .env (apenas no dev local)
require('dotenv').config();

const app = express();
const port = 3000;

// Configuração do Banco de Dados
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'dadostse_postgresdadostse',
    database: process.env.DB_NAME || 'cadastro',
    password: process.env.DB_PASS || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos na raiz e em /cadastro
app.use(express.static(path.join(__dirname, '.')));
app.use('/cadastro', express.static(path.join(__dirname, '.')));

// Redirecionar /cadastro para /cadastro/ (com barra no final) para resolver caminhos relativos
app.get('/cadastro', (req, res) => {
    if (!req.originalUrl.endsWith('/')) {
        return res.redirect(req.originalUrl + '/');
    }
    next();
});


// Middleware de Autenticação Básica para Admin
const adminAuth = (req, res, next) => {
    const user = auth(req);
    // Usuário: admin, Senha: 123 (Em produção, usar variáveis de ambiente!)
    if (!user || user.name !== 'postgres' || user.pass !== 'postgres') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
        res.end('Acesso negado');
    } else {
        next();
    }
};

// Router para API
const apiRouter = express.Router();

// Rota para Salvar Cadastro
apiRouter.post('/cadastro', async (req, res) => {
    const { nome, telefone, cpf, cep, cidade, profissao, ocupaCargo, cargoPolitico } = req.body;
    const ocupa_cargo_politico = ocupaCargo === 'sim';
    const cargo_politico_val = ocupa_cargo_politico ? cargoPolitico : null;

    try {
        const query = `
            INSERT INTO cadastro_contato 
            (nome, telefone, cpf, cep, cidade, profissao, ocupa_cargo_politico, cargo_politico)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `;
        const values = [nome, telefone, cpf, cep, cidade, profissao, ocupa_cargo_politico, cargo_politico_val];

        const result = await pool.query(query, values);
        res.json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique constraint violation (CPF)
            res.status(400).json({ success: false, message: 'CPF já cadastrado.' });
        } else {
            res.status(500).json({ success: false, message: 'Erro ao salvar cadastro.' });
        }
    }
});

// Rota Admin: Listar Cadastros
apiRouter.get('/admin/cadastros', adminAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cadastro_contato ORDER BY data_cadastro DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// Rota Admin: Exportar CSV
apiRouter.get('/admin/export', adminAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cadastro_contato ORDER BY data_cadastro DESC');
        const dados = result.rows;

        if (dados.length === 0) {
            return res.status(404).send('Nenhum dado para exportar');
        }

        const fields = ['id', 'nome', 'telefone', 'cpf', 'cep', 'cidade', 'profissao', 'ocupa_cargo_politico', 'cargo_politico', 'data_cadastro'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(dados);

        res.header('Content-Type', 'text/csv');
        res.attachment('cadastros.csv');
        return res.send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao exportar dados');
    }
});

// Mount API router
app.use('/api', apiRouter);
app.use('/cadastro/api', apiRouter);

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
    console.log(`Página de cadastro: http://localhost:${port}/index.html`);
    console.log(`Painel Admin: http://localhost:${port}/admin.html`);
});
