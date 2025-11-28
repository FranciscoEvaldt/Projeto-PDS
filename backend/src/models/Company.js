import { query } from '../config/database.js';

const Company = {
  // Buscar todas as empresas
  async findAll() {
    const result = await query(
      'SELECT * FROM companies ORDER BY name'
    );
    return result.rows;
  },

  // Buscar empresas com contagem de obras
  async findAllWithWorkCount() {
    const result = await query(`
      SELECT 
        c.*,
        COUNT(w.id) as work_count
      FROM companies c
      LEFT JOIN works w ON w.company_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `);
    return result.rows;
  },

  // Buscar empresa por ID
  async findById(id) {
    const result = await query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Criar nova empresa
  async create(companyData) {
    const { name, cnpj, address, phone, email } = companyData;
    
    const result = await query(
      `INSERT INTO companies (name, cnpj, address, phone, email) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, cnpj, address, phone, email]
    );
    
    return result.rows[0];
  },

  // Atualizar empresa
  async update(id, companyData) {
    const { name, cnpj, address, phone, email } = companyData;
    
    const result = await query(
      `UPDATE companies 
       SET name = $1, cnpj = $2, address = $3, phone = $4, email = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, cnpj, address, phone, email, id]
    );
    
    return result.rows[0];
  },

  // Deletar empresa
  async delete(id) {
    const result = await query(
      'DELETE FROM companies WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },
};

export default Company;
