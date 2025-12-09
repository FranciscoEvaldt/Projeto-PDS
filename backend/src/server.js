import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import { testConnection } from "./config/database.js";
import companiesRouter from "./routes/companies.js";
import worksRouter from "./routes/works.js";
import loadsRouter from "./routes/loads.js";
import samplesRouter from "./routes/samples.js";
import usersRouter from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend API do Laboratório de Concreto está funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use("/api/companies", companiesRouter);
app.use("/api/works", worksRouter);
app.use("/api/loads", loadsRouter);
app.use("/api/samples", samplesRouter);
app.use("/api/users", usersRouter);

// ======================================================================
// 🟩 SERVIR O FRONTEND (VITE) EM PRODUÇÃO
// ======================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dist está NA RAIZ, e server.js está em /src → precisa voltar 1 pasta
const distPath = path.join(__dirname, "../dist");

console.log("🟦 Caminho da build React:", distPath);

app.use(express.static(distPath));

// Rota coringa para SPA (React)
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ======================================================================
// ERROS
// ======================================================================

app.use((err, req, res, next) => {
  console.error("❌ Erro no servidor:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// ======================================================================
// INICIAR SERVIDOR
// ======================================================================

async function startServer() {
  try {
    const connected = await testConnection();

    if (!connected) {
      console.error("❌ Não foi possível conectar ao banco de dados.");
      console.error("→ Verifique a variável DATABASE_URL no Render.");
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log("\n═══════════════════════════════════════════════════════════");
      console.log("🚀 Servidor Backend iniciado com sucesso!");
      console.log("═══════════════════════════════════════════════════════════");
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log("🌐 Servindo frontend Vite /dist");
      console.log("═══════════════════════════════════════════════════════════\n");
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM recebido. Encerrando servidor...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT recebido. Encerrando servidor...");
  process.exit(0);
});
