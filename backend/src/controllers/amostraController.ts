import type { Request, Response } from "express";
import { pool } from "../database/connection.js";

export async function getAmostras(req: Request, res: Response) {
  const { carga_id } = req.query;
  const { rows } = await pool.query(
    "SELECT * FROM amostra WHERE carga_id = $1 ORDER BY id ASC",
    [carga_id]
  );
  res.json(rows);
}

export async function createAmostra(req: Request, res: Response) {
  const { carga_id, sequencia, data_prevista_rompimento, idade_dias, diametro_mm, altura_mm } = req.body;
  const result = await pool.query(
    `INSERT INTO amostra (carga_id, sequencia, data_prevista_rompimento, idade_dias, diametro_mm, altura_mm)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [carga_id, sequencia, data_prevista_rompimento, idade_dias, diametro_mm, altura_mm]
  );
  res.status(201).json(result.rows[0]);
}
