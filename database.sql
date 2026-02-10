-- Conecte-se ao banco de dados 'dados_tse' antes de executar este script.
-- Credenciais conforme fornecido:
-- Usuário: postgres
-- Senha: postgres
-- Host: dadostse_postgresdadostse
-- Porta: 5432
-- Banco: dados_tse

CREATE TABLE IF NOT EXISTS cadastro_contato (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    cep VARCHAR(10) NOT NULL,
    cidade VARCHAR(100), -- Tornou-se opcional
    profissao VARCHAR(100),
    ocupa_cargo_politico BOOLEAN NOT NULL DEFAULT FALSE,
    cargo_politico VARCHAR(100), -- Preenchido apenas se ocupa_cargo_politico for TRUE
    aceita_informacoes BOOLEAN NOT NULL DEFAULT FALSE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN cadastro_contato.nome IS 'Nome completo do contato';
COMMENT ON COLUMN cadastro_contato.telefone IS 'Telefone ou WhatsApp';
COMMENT ON COLUMN cadastro_contato.cpf IS 'CPF do contato';
COMMENT ON COLUMN cadastro_contato.cep IS 'CEP do endereço';
COMMENT ON COLUMN cadastro_contato.cidade IS 'Cidade do endereço';
COMMENT ON COLUMN cadastro_contato.profissao IS 'Profissão do contato';
COMMENT ON COLUMN cadastro_contato.ocupa_cargo_politico IS 'Indica se ocupa cargo político (Sim/Não)';
COMMENT ON COLUMN cadastro_contato.cargo_politico IS 'Descrição do cargo político, se houver';
COMMENT ON COLUMN cadastro_contato.aceita_informacoes IS 'Indica se aceita receber informações do deputado';
