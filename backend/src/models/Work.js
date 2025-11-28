import { query } from '../config/database.js';

const Work = {
  // Buscar todas as obras
  async findAll() {
    const result = await query(`
      SELECT 
        w.*,
        c.name as company_name
      FROM works w
      LEFT JOIN companies c ON c.id = w.company_id
      ORDER BY w.created_at DESC
    `);
    return result.rows;
  },

  // Buscar obras com contagens
  async findAllWithCounts() {
    const result = await query(`
      SELECT 
        w.*,
        c.name as company_name,
        COUNT(DISTINCT l.id) as load_count,
        COUNT(DISTINCT s.id) as sample_count
      FROM works w
      LEFT JOIN companies c ON c.id = w.company_id
      LEFT JOIN loads l ON l.work_id = w.id
      LEFT JOIN samples s ON s.load_id = l.id
      GROUP BY w.id, c.name
      ORDER BY w.created_at DESC
    `);
    return result.rows;
  },

  // Buscar obra por ID
  async findById(id) {
    const result = await query(`
      SELECT 
        w.*,
        c.name as company_name
      FROM works w
      LEFT JOIN companies c ON c.id = w.company_id
      WHERE w.id = $1
    `, [id]);
    return result.rows[0];
  },

  // Buscar obras por empresa
  async findByCompany(companyId) {
    const result = await query(`
      SELECT w.*
      FROM works w
      WHERE w.company_id = $1
      ORDER BY w.name
    `, [companyId]);
    return result.rows;
  },

  // Criar nova obra
  async create(workData) {
    const { company_id, name, code, address, concrete_supplier, start_date, status } = workData;
    
    const result = await query(
      `INSERT INTO works (company_id, name, code, address, concrete_supplier, start_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [company_id, name, code, address, concrete_supplier, start_date, status || 'active']
    );
    
    return result.rows[0];
  },

  // Atualizar obra
  async update(id, workData) {
    const { company_id, name, code, address, concrete_supplier, start_date, status } = workData;
    
    const result = await query(
      `UPDATE works 
       SET company_id = $1, name = $2, code = $3, address = $4, 
           concrete_supplier = $5, start_date = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [company_id, name, code, address, concrete_supplier, start_date, status, id]
    );
    
    return result.rows[0];
  },

  // Deletar obra
  async delete(id) {
    const result = await query(
      'DELETE FROM works WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

export default Work;
