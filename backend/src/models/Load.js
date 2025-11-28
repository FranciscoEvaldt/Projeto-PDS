import { query } from '../config/database.js';

const Load = {
  // Buscar todas as cargas
  async findAll() {
    const result = await query(`
      SELECT 
        l.*,
        w.name as work_name,
        w.code as work_code,
        c.name as company_name
      FROM loads l
      LEFT JOIN works w ON w.id = l.work_id
      LEFT JOIN companies c ON c.id = w.company_id
      ORDER BY l.load_date DESC
    `);
    return result.rows;
  },

  // Buscar cargas com detalhes e contagem de amostras
  async findAllWithDetails() {
    const result = await query(`
      SELECT 
        l.*,
        w.name as work_name,
        w.code as work_code,
        c.name as company_name,
        COUNT(s.id) as sample_count
      FROM loads l
      LEFT JOIN works w ON w.id = l.work_id
      LEFT JOIN companies c ON c.id = w.company_id
      LEFT JOIN samples s ON s.load_id = l.id
      GROUP BY l.id, w.name, w.code, c.name
      ORDER BY l.load_date DESC
    `);
    return result.rows;
  },

  // Buscar carga por ID
  async findById(id) {
    const result = await query(`
      SELECT 
        l.*,
        w.name as work_name,
        w.code as work_code,
        c.name as company_name
      FROM loads l
      LEFT JOIN works w ON w.id = l.work_id
      LEFT JOIN companies c ON c.id = w.company_id
      WHERE l.id = $1
    `, [id]);
    return result.rows[0];
  },

  // Buscar cargas por obra
  async findByWork(workId) {
    const result = await query(`
      SELECT l.*
      FROM loads l
      WHERE l.work_id = $1
      ORDER BY l.load_date DESC
    `, [workId]);
    return result.rows;
  },

  // Criar nova carga
  async create(loadData) {
    const {
      work_id,
      invoice_number,
      concrete_type,
      slump,
      load_date,
      quantity_7_days,
      quantity_14_days,
      quantity_28_days,
      quantity_63_days,
      notes,
    } = loadData;
    
    const result = await query(
      `INSERT INTO loads (
        work_id, invoice_number, concrete_type, slump, load_date,
        quantity_7_days, quantity_14_days, quantity_28_days, quantity_63_days, notes
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        work_id,
        invoice_number,
        concrete_type,
        slump,
        load_date,
        quantity_7_days || 0,
        quantity_14_days || 0,
        quantity_28_days || 0,
        quantity_63_days || 0,
        notes,
      ]
    );
    
    return result.rows[0];
  },

  // Atualizar carga
  async update(id, loadData) {
    const {
      work_id,
      invoice_number,
      concrete_type,
      slump,
      load_date,
      quantity_7_days,
      quantity_14_days,
      quantity_28_days,
      quantity_63_days,
      notes,
    } = loadData;
    
    const result = await query(
      `UPDATE loads 
       SET work_id = $1, invoice_number = $2, concrete_type = $3, slump = $4, 
           load_date = $5, quantity_7_days = $6, quantity_14_days = $7, 
           quantity_28_days = $8, quantity_63_days = $9, notes = $10, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        work_id,
        invoice_number,
        concrete_type,
        slump,
        load_date,
        quantity_7_days,
        quantity_14_days,
        quantity_28_days,
        quantity_63_days,
        notes,
        id,
      ]
    );
    
    return result.rows[0];
  },

  // Deletar carga
  async delete(id) {
    const result = await query(
      'DELETE FROM loads WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

export default Load;
