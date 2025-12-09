import pool from "../config/database.js";

class CompaniesController {
  async getAll(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM companies ORDER BY created_at DESC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      res
        .status(500)
        .json({ error: "Erro ao buscar empresas", message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM companies WHERE id = $1", [
        id,
      ]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao buscar empresa:", error);
      res
        .status(500)
        .json({ error: "Erro ao buscar empresa", message: error.message });
    }
  }

  async create(req, res) {
    try {
      const { nome, cnpj, endereco, telefone, email } = req.body;

      if (!nome) {
        return res.status(400).json({ error: "Nome é obrigatório" });
      }

      const result = await pool.query(
        `INSERT INTO companies (nome, cnpj, endereco, telefone, email)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [nome, cnpj || null, endereco || null, telefone || null, email || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao criar empresa:", error);

      if (error.code === "23505") {
        return res.status(400).json({ error: "CNPJ já cadastrado" });
      }

      res
        .status(500)
        .json({ error: "Erro ao criar empresa", message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, cnpj, endereco, telefone, email } = req.body;

      const result = await pool.query(
        `UPDATE companies
         SET nome = COALESCE($1, nome),
             cnpj = COALESCE($2, cnpj),
             endereco = COALESCE($3, endereco),
             telefone = COALESCE($4, telefone),
             email = COALESCE($5, email),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [nome, cnpj, endereco, telefone, email, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao atualizar empresa:", error);
      res
        .status(500)
        .json({ error: "Erro ao atualizar empresa", message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM companies WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar empresa:", error);

      if (error.code === "23503") {
        return res
          .status(400)
          .json({
            error: "Não é possível deletar empresa com obras cadastradas",
          });
      }

      res
        .status(500)
        .json({ error: "Erro ao deletar empresa", message: error.message });
    }
  }
}

export default new CompaniesController();
