import PDFDocument from "pdfkit";
import type { Request, Response } from "express";
import { pool } from "../database/connection.js";
import fs from "fs";
import path from "path";

export async function gerarRelatorioPDF(req: Request, res: Response) {
  const { carga_id } = req.params;

  // 🔹 Buscar dados da carga, obra e empresa
  const cargaQuery = await pool.query(
    `SELECT c.*, o.nome AS obra_nome, o.cidade, o.estado, o.fck_projeto,
            e.nome AS empresa_nome
     FROM carga c
     LEFT JOIN obra o ON o.id = c.obra_id
     LEFT JOIN empresa e ON e.id = o.empresa_id
     WHERE c.id = $1`,
    [carga_id]
  );

  const carga = cargaQuery.rows[0];
  if (!carga) return res.status(404).json({ error: "Carga não encontrada" });

  const amostrasQuery = await pool.query(
    "SELECT * FROM amostra WHERE carga_id = $1 ORDER BY idade_dias ASC",
    [carga_id]
  );
  const amostras = amostrasQuery.rows;

  // 🔹 Configuração do PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const outputDir = "relatorios";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const filePath = path.join(outputDir, `Relatorio_Carga_${carga_id}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // --- 🔸 Cabeçalho ---
  const logoPath = path.resolve("Logo MODEL ENG.pdf");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 100 });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("RELATÓRIO DE ENSAIO DE CORPOS DE PROVA", 0, 60, { align: "center" })
    .moveDown(2);

  // --- 🔸 Identificação do laboratório ---
  doc
    .font("Helvetica")
    .fontSize(10)
    .text("MODEL ENGENHARIA E TECNOLOGIA", { align: "center" })
    .text("Vila Morro Azul, 455", { align: "center" })
    .text("Responsável Técnico: Eng. Civil Felipe Model – CREA 146678", {
      align: "center",
    })
    .text("Telefone: (51) 99710-4142", { align: "center" })
    .moveDown(1.5);

  // --- 🔸 Dados da obra ---
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("DADOS DA OBRA", { underline: true })
    .moveDown(0.5);

  doc.font("Helvetica").fontSize(11);
  doc.text(`Empresa: ${carga.empresa_nome || "-"}`);
  doc.text(`Obra: ${carga.obra_nome}`);
  doc.text(`Cidade/UF: ${carga.cidade || ""} - ${carga.estado || ""}`);
  doc.text(`Fck de projeto: ${carga.fck_projeto || "-"} MPa`);
  doc.moveDown();

  // --- 🔸 Dados da carga ---
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("DADOS DA CARGA DE CONCRETO", { underline: true })
    .moveDown(0.5);

  doc.font("Helvetica").fontSize(11);
  doc.text(`Nota Fiscal: ${carga.nota_fiscal}`);
  doc.text(`Data da Moldagem: ${new Date(carga.data_moldagem).toLocaleDateString()}`);
  doc.text(`Caminhão: ${carga.caminhao}`);
  doc.text(`Volume (m³): ${carga.volume_m3}`);
  doc.text(`Slump (cm): ${carga.slump_cm}`);
  doc.text(`Fck (MPa): ${carga.fck_mpa}`);
  doc.text(`Pavimento: ${carga.pavimento}`);
  doc.text(`Peça concretada: ${carga.peca}`);
  doc.moveDown(1.5);

  // --- 🔸 Tabela de resultados ---
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("RESULTADOS DO ENSAIO", { underline: true })
    .moveDown(0.5);

  const startY = doc.y + 10;
  const colX = [50, 110, 170, 250, 330, 410, 500];
  const headers = [
    "Seq.",
    "Idade",
    "Data Romp.",
    "Carga (kN)",
    "fck (MPa)",
    "Altura (mm)",
    "Obs.",
  ];

  // Cabeçalho da tabela
  doc.fontSize(10).font("Helvetica-Bold");
  headers.forEach((h, i) => doc.text(h, colX[i], startY));
  doc.moveTo(50, startY - 3).lineTo(550, startY - 3).stroke();

  // Linhas da tabela
  let y = startY + 12;
  doc.font("Helvetica").fontSize(10);
  amostras.forEach((a) => {
    doc.text(a.sequencia, colX[0], y);
    doc.text(`${a.idade_dias} dias`, colX[1], y);
    doc.text(
      a.data_rompimento
        ? new Date(a.data_rompimento).toLocaleDateString()
        : "-",
      colX[2],
      y
    );
    doc.text(a.carga_quebrada_kn ? a.carga_quebrada_kn.toFixed(1) : "-", colX[3], y);
    doc.text(
      a.resistencia_calculada_mpa
        ? a.resistencia_calculada_mpa.toFixed(2)
        : "-",
      colX[4],
      y
    );
    doc.text(a.altura_mm ? a.altura_mm.toFixed(1) : "-", colX[5], y);
    doc.text(a.observacoes || "-", colX[6], y);
    y += 16;
  });

  doc.moveTo(50, y).lineTo(550, y).stroke();

  // --- 🔸 Rodapé ---
  doc.moveDown(3);
  doc
    .fontSize(10)
    .text("_______________________________", 350, 730)
    .text("Eng. Civil Felipe Model – CREA 146678", 340, 745);

  doc
    .fontSize(9)
    .text(
      `Relatório gerado automaticamente em ${new Date().toLocaleString()}`,
      50,
      780,
      { align: "center" }
    );

  doc.end();

  stream.on("finish", () => {
    res.download(filePath);
  });
}
