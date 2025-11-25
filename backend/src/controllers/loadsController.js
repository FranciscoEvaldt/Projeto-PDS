import pool from '../database/db.js';

// GET /api/loads - Listar todas as cargas
export async function getAllLoads(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT l.*, w.nome as obra_nome, w.codigo as obra_codigo
       FROM loads l
       LEFT JOIN works w ON l.obra_id = w.id
       ORDER BY l.data_moldagem DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar cargas:', error);
    res.status(500).json({ error: 'Erro ao buscar cargas' });
  }
}

// GET /api/loads/:id - Buscar carga por ID
export async function getLoadById(req, res) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT l.*, w.nome as obra_nome, w.codigo as obra_codigo
       FROM loads l
       LEFT JOIN works w ON l.obra_id = w.id
       WHERE l.id = $1`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar carga:', error);
    res.status(500).json({ error: 'Erro ao buscar carga' });
  }
}

// GET /api/loads/work/:obraId - Buscar cargas de uma obra
export async function getLoadsByWork(req, res) {
  try {
    const { obraId } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM loads
       WHERE obra_id = $1
       ORDER BY numero_planilha ASC`,
      [obraId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar cargas da obra:', error);
    res.status(500).json({ error: 'Erro ao buscar cargas da obra' });
  }
}

// POST /api/loads - Criar nova carga
export async function createLoad(req, res) {
  try {
    const {
      obra_id,
      numero_planilha,
      data_moldagem,
      caminhao,
      nota_fiscal,
      volume_m3,
      slump_cm,
      fck_mpa,
      pavimento,
      peca,
      fornecedor_concreto,
      observacoes
    } = req.body;
    
    if (!obra_id || !data_moldagem) {
      return res.status(400).json({ error: 'Obra e data de moldagem são obrigatórios' });
    }
    
    // Se não informou numero_planilha, busca o próximo
    let planilhaNum = numero_planilha;
    if (!planilhaNum) {
      const { rows } = await pool.query(
        `SELECT COALESCE(MAX(numero_planilha), 0) + 1 as next_num
         FROM loads
         WHERE obra_id = $1`,
        [obra_id]
      );
      planilhaNum = rows[0].next_num;
    }
    
    const { rows } = await pool.query(
      `INSERT INTO loads (
        obra_id, numero_planilha, data_moldagem, caminhao, nota_fiscal,
        volume_m3, slump_cm, fck_mpa, pavimento, peca, fornecedor_concreto, observacoes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        obra_id,
        planilhaNum,
        data_moldagem,
        caminhao,
        nota_fiscal,
        volume_m3,
        slump_cm,
        fck_mpa,
        pavimento,
        peca,
        fornecedor_concreto,
        observacoes
      ]
    );
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar carga:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Já existe uma carga com este número de planilha para esta obra' });
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Obra não encontrada' });
    } else {
      res.status(500).json({ error: 'Erro ao criar carga' });
    }
  }
}

// PUT /api/loads/:id - Atualizar carga
export async function updateLoad(req, res) {
  try {
    const { id } = req.params;
    const {
      obra_id,
      numero_planilha,
      data_moldagem,
      caminhao,
      nota_fiscal,
      volume_m3,
      slump_cm,
      fck_mpa,
      pavimento,
      peca,
      fornecedor_concreto,
      observacoes
    } = req.body;
    
    const { rows } = await pool.query(
      `UPDATE loads
       SET obra_id = COALESCE($1, obra_id),
           numero_planilha = COALESCE($2, numero_planilha),
           data_moldagem = COALESCE($3, data_moldagem),
           caminhao = COALESCE($4, caminhao),
           nota_fiscal = COALESCE($5, nota_fiscal),
           volume_m3 = COALESCE($6, volume_m3),
           slump_cm = COALESCE($7, slump_cm),
           fck_mpa = COALESCE($8, fck_mpa),
           pavimento = COALESCE($9, pavimento),
           peca = COALESCE($10, peca),
           fornecedor_concreto = COALESCE($11, fornecedor_concreto),
           observacoes = COALESCE($12, observacoes)
       WHERE id = $13
       RETURNING *`,
      [
        obra_id,
        numero_planilha,
        data_moldagem,
        caminhao,
        nota_fiscal,
        volume_m3,
        slump_cm,
        fck_mpa,
        pavimento,
        peca,
        fornecedor_concreto,
        observacoes,
        id
      ]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar carga:', error);
    res.status(500).json({ error: 'Erro ao atualizar carga' });
  }
}

// DELETE /api/loads/:id - Excluir carga (e amostras relacionadas em cascata)
export async function deleteLoad(req, res) {
  try {
    const { id } = req.params;
    
    const { rowCount } = await pool.query(
      'DELETE FROM loads WHERE id = $1',
      [id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Carga não encontrada' });
    }
    
    res.json({ success: true, message: 'Carga excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir carga:', error);
    res.status(500).json({ error: 'Erro ao excluir carga' });
  }
}

// GET /api/loads/next-sheet-number/:obraId - Obter próximo número de planilha
export async function getNextSheetNumber(req, res) {
  try {
    const { obraId } = req.params;
    
    const { rows } = await pool.query(
      `SELECT COALESCE(MAX(numero_planilha), 0) + 1 as next_number
       FROM loads
       WHERE obra_id = $1`,
      [obraId]
    );
    
    res.json({ number: rows[0].next_number });
  } catch (error) {
    console.error('Erro ao buscar próximo número de planilha:', error);
    res.status(500).json({ error: 'Erro ao buscar próximo número de planilha' });
  }
}
