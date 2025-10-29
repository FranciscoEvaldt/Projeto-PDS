import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import relatorioRoutes from "./routes/relatorioRoutes.js";
import empresaRoutes from "./routes/empresaRoutes.js";
import obraRoutes from "./routes/obraRoutes.js";
import cargaRoutes from "./routes/cargaRoutes.js";
import amostraRoutes from "./routes/amostraRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/relatorios", relatorioRoutes);

app.use("/api/empresas", empresaRoutes);
app.use("/api/obras", obraRoutes);
app.use("/api/cargas", cargaRoutes);
app.use("/api/amostras", amostraRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
