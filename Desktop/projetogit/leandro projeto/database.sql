

CREATE TABLE IF NOT EXISTS dono (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS animal (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_dono INTEGER NOT NULL,
    nome_pet VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(100) NOT NULL,
    data_nascimento DATE NOT NULL,
    observacoes TEXT,
    FOREIGN KEY (id_dono) REFERENCES dono(id) ON DELETE CASCADE
);


CREATE INDEX IF NOT EXISTS idx_dono_cpf ON dono(cpf);
CREATE INDEX IF NOT EXISTS idx_animal_dono ON animal(id_dono);
