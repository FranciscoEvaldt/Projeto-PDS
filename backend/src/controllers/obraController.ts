import type { Request, Response } from "express";
import { pool } from "../database/connection.js";

export async function getObras(req: Request, res: Response) {
  const { rows } = await pool.query(
    `SELECT o.*, e.nome AS empresa_nome
     FROM obra o
     LEFT JOIN empresa e ON e.id = o.empresa_id
     ORDER BY o.id DESC`
  );
  res.json(rows);
}

export async function createObra(req: Request, res: Response) {
  const {
    empresa_id,
    nome,
    endereco,
    cidade,
    estado,
    fck_projeto,
    responsavel_obra,
    contrato,
  } = req.body;

  const result = await pool.query(
    `INSERT INTO obra (empresa_id, nome, endereco, cidade, estado, fck_projeto, responsavel_obra, contrato)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [empresa_id || null, nome, endereco, cidade, estado, fck_projeto, responsavel_obra, contrato]
  );

  res.status(201).json(result.rows[0]);
}
