import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/database.js";
import companiesRouter from "./routes/companies.js";
import worksRouter from "./routes/works.js";
import loadsRouter from "./routes/loads.js";
import samplesRouter from "./routes/samples.js";
import usersRouter from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend API do Laboratório de Concreto está funcionando!",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/companies", companiesRouter);
app.use("/api/works", worksRouter);
app.use("/api/loads", loadsRouter);
app.use("/api/samples", samplesRouter);
app.use("/api/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.url,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  console.error("❌ Erro no servidor:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

async function startServer() {
  try {
    const connected = await testConnection();

   if (!connected) {
  console.error("❌ Não foi possível conectar ao banco de dados.");
  console.error("   → Verifique se a variável DATABASE_URL está configurada no Render.");
  console.error("   → Verifique se a senha do banco está correta.");
  process.exit(1);
}


    app.listen(PORT, () => {
      console.log("");
      console.log(
        "═══════════════════════════════════════════════════════════"
      );
      console.log("🚀 Servidor Backend iniciado com sucesso!");
      console.log(
        "═══════════════════════════════════════════════════════════"
      );
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log("");
      console.log("📚 Rotas disponíveis:");
      console.log(`   • GET/POST/PUT/DELETE /api/companies`);
      console.log(`   • GET/POST/PUT/DELETE /api/works`);
      console.log(`   • GET/POST/PUT/DELETE /api/loads`);
      console.log(`   • GET/POST/PUT/DELETE /api/samples`);
      console.log(`   • POST              /api/samples/bulk`);
      console.log(`   • POST              /api/users/authenticate`);
      console.log(`   • GET/POST/PUT/DELETE /api/users`);
      console.log("");
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
