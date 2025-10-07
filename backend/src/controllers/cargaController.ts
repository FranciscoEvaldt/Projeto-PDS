import type { Request, Response } from "express";
import { pool } from "../database/connection.js";

export async function getCargas(req: Request, res: Response) {
  const { obra_id } = req.query;
  const { rows } = await pool.query(
    "SELECT * FROM carga WHERE obra_id = $1 ORDER BY id DESC",
    [obra_id]
  );
  res.json(rows);
}

export async function createCarga(req: Request, res: Response) {
  const { obra_id, data_moldagem, caminhao, nota_fiscal, volume_m3, slump_cm, fck_mpa, pavimento, peca } = req.body;
  const result = await pool.query(
    `INSERT INTO carga (obra_id, data_moldagem, caminhao, nota_fiscal, volume_m3, slump_cm, fck_mpa, pavimento, peca)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [obra_id, data_moldagem, caminhao, nota_fiscal, volume_m3, slump_cm, fck_mpa, pavimento, peca]
  );
  res.status(201).json(result.rows[0]);
}
