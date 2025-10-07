import type { Request, Response } from "express";
import { pool } from "../database/connection.js";

export async function getEmpresas(req: Request, res: Response) {
  const { rows } = await pool.query("SELECT * FROM empresa ORDER BY id DESC");
  res.json(rows);
}

export async function createEmpresa(req: Request, res: Response) {
  const { nome, cnpj, endereco, telefone, email } = req.body;
  const result = await pool.query(
    "INSERT INTO empresa (nome, cnpj, endereco, telefone, email) VALUES ($1,$2,$3,$4,$5) RETURNING *",
    [nome, cnpj, endereco, telefone, email]
  );
  res.status(201).json(result.rows[0]);
}
