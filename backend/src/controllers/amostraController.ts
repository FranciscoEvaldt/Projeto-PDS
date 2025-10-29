import type { Request, Response } from "express";
import { pool } from "../database/connection.js";

// 🧾 Buscar amostras por carga
export async function getAmostras(req: Request, res: Response) {
  const { carga_id } = req.query;
  const { rows } = await pool.query(
    "SELECT * FROM amostra WHERE carga_id = $1 ORDER BY sequencia ASC",
    [carga_id]
  );
  res.json(rows);
}

// ➕ Criar amostras manualmente
export async function createAmostra(req: Request, res: Response) {
  const {
    carga_id,
    sequencia,
    idade_dias,
    data_prevista_rompimento,
    diametro_mm,
    altura_mm,
  } = req.body;

  const result = await pool.query(
    `INSERT INTO amostra (carga_id, sequencia, idade_dias, data_prevista_rompimento, diametro_mm, altura_mm)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [carga_id, sequencia, idade_dias, data_prevista_rompimento, diametro_mm, altura_mm]
  );

  res.status(201).json(result.rows[0]);
}

// 🤖 Criar amostras automáticas com base em idades padrão (7 e 28 dias)
export async function gerarAmostrasAutomaticas(req: Request, res: Response) {
  const { carga_id, data_moldagem } = req.body;

  const idades = [7, 28];
  const inserts = [];

  for (const idade of idades) {
    const result = await pool.query(
      `INSERT INTO amostra (carga_id, sequencia, idade_dias, data_prevista_rompimento)
       VALUES ($1, (SELECT COALESCE(MAX(sequencia),0)+1 FROM amostra), $2, $3) RETURNING *`,
      [
        carga_id,
        idade,
        new Date(
          new Date(data_moldagem).getTime() + idade * 24 * 60 * 60 * 1000
        ),
      ]
    );
    inserts.push(result.rows[0]);
  }

  res.status(201).json(inserts);
}

// 🧮 Registrar rompimento e calcular resistência
export async function registrarRompimento(req: Request, res: Response) {
  const { id, data_rompimento, carga_quebrada_kn } = req.body;

  const { rows } = await pool.query(
    `SELECT diametro_mm, altura_mm FROM amostra WHERE id = $1`,
    [id]
  );
  if (!rows[0]) return res.status(404).json({ error: "Amostra não encontrada" });

  const { diametro_mm } = rows[0];
  const area = Math.PI * Math.pow(Number(diametro_mm) / 2, 2); // mm²
  const resistencia = (Number(carga_quebrada_kn) * 1000) / area; // MPa

  const result = await pool.query(
    `UPDATE amostra
     SET data_rompimento=$1, carga_quebrada_kn=$2, resistencia_calculada_mpa=$3
     WHERE id=$4 RETURNING *`,
    [data_rompimento, carga_quebrada_kn, resistencia, id]
  );

  res.json(result.rows[0]);
}
