import { query } from '../config/database.js';

const Sample = {
  // Buscar todas as amostras
  async findAll() {
    const result = await query(`
      SELECT 
        s.*,
        l.invoice_number as load_invoice,
        w.name as work_name,
        w.code as work_code,
        c.name as company_name
      FROM samples s
      LEFT JOIN loads l ON l.id = s.load_id
      LEFT JOIN works w ON w.id = l.work_id
      LEFT JOIN companies c ON c.id = w.company_id
      ORDER BY s.break_date ASC
    `);
    return result.rows;
  },

  // Buscar amostras com detalhes completos
  async findAllWithDetails() {
    const result = await query(`
      SELECT 
        s.*,
        l.invoice_number as load_invoice,
        w.name as work_name,
        w.code as work_code,
        c.name as company_name
      FROM samples s
      LEFT JOIN loads l ON l.id = s.load_id
      LEFT JOIN works w ON w.id = l.work_id
      LEFT JOIN companies c ON c.id = w.company_id
      ORDER BY s.break_date ASC
    `);
    return result.rows;
  },

  // Buscar amostra por ID
  async findById(id) {
    const result = await query(`
      SELECT 
        s.*,
        l.invoice_number as load_invoice,
        w.name as work_name,
        w.code as work_code,
        c.name as company_name
      FROM samples s
      LEFT JOIN loads l ON l.id = s.load_id
      LEFT JOIN works w ON w.id = l.work_id
      LEFT JOIN companies c ON c.id = w.company_id
      WHERE s.id = $1
    `, [id]);
    return result.rows[0];
  },

  // Buscar amostras por carga
  async findByLoad(loadId) {
    const result = await query(`
      SELECT s.*
      FROM samples s
      WHERE s.load_id = $1
      ORDER BY s.break_age, s.sample_code
    `, [loadId]);
    return result.rows;
  },

  // Buscar amostras por obra
  async findByWork(workId) {
    const result = await query(`
      SELECT 
        s.*,
        l.invoice_number as load_invoice
      FROM samples s
      INNER JOIN loads l ON l.id = s.load_id
      WHERE l.work_id = $1
      ORDER BY s.break_date ASC
    `, [workId]);
    return result.rows;
  },

  // Buscar amostras por status
  async findByStatus(status) {
    const result = await query(`
      SELECT 
        s.*,
        l.invoice_number as load_invoice,
        w.name as work_name,
        w.code as work_code
      FROM samples s
      LEFT JOIN loads l ON l.id = s.load_id
      LEFT JOIN works w ON w.id = l.work_id
      WHERE s.status = $1
      ORDER BY s.break_date ASC
    `, [status]);
    return result.rows;
  },

  // Criar nova amostra
  async create(sampleData) {
    const { load_id, sample_code, break_age, break_date, status, notes } = sampleData;
    
    const result = await query(
      `INSERT INTO samples (load_id, sample_code, break_age, break_date, status, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [load_id, sample_code, break_age, break_date, status || 'pending', notes]
    );
    
    return result.rows[0];
  },

  // Criar múltiplas amostras (bulk insert)
  async createMany(samplesData) {
    if (!samplesData || samplesData.length === 0) {
      return [];
    }

    // Construir query dinâmica para insert múltiplo
    const values = [];
    const placeholders = [];
    
    samplesData.forEach((sample, index) => {
      const baseIndex = index * 6;
      placeholders.push(
        `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6})`
      );
      values.push(
        sample.load_id,
        sample.sample_code,
        sample.break_age,
        sample.break_date,
        sample.status || 'pending',
        sample.notes || null
      );
    });

    const result = await query(
      `INSERT INTO samples (load_id, sample_code, break_age, break_date, status, notes)
       VALUES ${placeholders.join(', ')}
       RETURNING *`,
      values
    );
    
    return result.rows;
  },

  // Atualizar amostra
  async update(id, sampleData) {
    const { result, status, notes } = sampleData;
    
    const updateResult = await query(
      `UPDATE samples 
       SET result = $1, status = $2, notes = $3, 
           tested_at = CASE WHEN $1 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE tested_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [result, status, notes, id]
    );
    
    return updateResult.rows[0];
  },

  // Atualizar apenas resultado do teste
  async updateResult(id, resultData) {
    const { result, status, notes } = resultData;
    
    const updateResult = await query(
      `UPDATE samples 
       SET result = $1, status = $2, notes = $3, tested_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [result, status || 'tested', notes, id]
    );
    
    return updateResult.rows[0];
  },

  // Deletar amostra
  async delete(id) {
    const result = await query(
      'DELETE FROM samples WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Deletar todas as amostras de uma carga
  async deleteByLoad(loadId) {
    const result = await query(
      'DELETE FROM samples WHERE load_id = $1 RETURNING *',
      [loadId]
    );
    return result.rows;
  },
};

export default Sample;
