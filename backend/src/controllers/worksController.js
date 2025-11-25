import pool from '../database/db.js';

// GET /api/works - Listar todas as obras
export async function getAllWorks(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT w.*, c.nome as empresa_nome
       FROM works w
       LEFT JOIN companies c ON w.empresa_id = c.id
       ORDER BY w.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar obras:', error);
    res.status(500).json({ error: 'Erro ao buscar obras' });
  }
}

// GET /api/works/:id - Buscar obra por ID
export async function getWorkById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT w.*, c.nome as empresa_nome
       FROM works w
       LEFT JOIN companies c ON w.empresa_id = c.id
       WHERE w.id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar obra:', error);
    res.status(500).json({ error: 'Erro ao buscar obra' });
  }
}

// POST /api/works - Criar nova obra
export async function createWork(req, res) {
  try {
    const {
      empresa_id,
      codigo,
      nome,
      endereco,
      cidade,
      estado,
      fck_projeto,
      responsavel_obra,
      contrato,
      data_inicio,
      status
    } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Nome da obra é obrigatório' });
    }
    
    const { rows } = await pool.query(
      `INSERT INTO works (
        empresa_id, codigo, nome, endereco, cidade, estado,
        fck_projeto, responsavel_obra, contrato, data_inicio, status
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        empresa_id,
        codigo,
        nome,
        endereco,
        cidade,
        estado,
        fck_projeto,
        responsavel_obra,
        contrato,
        data_inicio,
        status || 'active'
      ]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar obra:', error);
    res.status(500).json({ error: 'Erro ao criar obra' });
  }
}

// PUT /api/works/:id - Atualizar obra
export async function updateWork(req, res) {
  try {
    const { id } = req.params;
    const {
      empresa_id,
      codigo,
      nome,
      endereco,
      cidade,
      estado,
      fck_projeto,
      responsavel_obra,
      contrato,
      data_inicio,
      status
    } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE works
       SET empresa_id = COALESCE($1, empresa_id),
           codigo = COALESCE($2, codigo),
           nome = COALESCE($3, nome),
           endereco = COALESCE($4, endereco),
           cidade = COALESCE($5, cidade),
           estado = COALESCE($6, estado),
           fck_projeto = COALESCE($7, fck_projeto),
           responsavel_obra = COALESCE($8, responsavel_obra),
           contrato = COALESCE($9, contrato),
           data_inicio = COALESCE($10, data_inicio),
           status = COALESCE($11, status)
       WHERE id = $12
       RETURNING *`,
      [
        empresa_id,
        codigo,
        nome,
        endereco,
        cidade,
        estado,
        fck_projeto,
        responsavel_obra,
        contrato,
        data_inicio,
        status,
        id
      ]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar obra:', error);
    res.status(500).json({ error: 'Erro ao atualizar obra' });
  }
}

// DELETE /api/works/:id - Excluir obra
export async function deleteWork(req, res) {
  try {
    const { id } = req.params;
    
    const { rowCount } = await pool.query(
      'DELETE FROM works WHERE id = $1',
      [id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Obra não encontrada' });
    }
    
    res.json({ success: true, message: 'Obra excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir obra:', error);
    res.status(500).json({ error: 'Erro ao excluir obra' });
  }
}
