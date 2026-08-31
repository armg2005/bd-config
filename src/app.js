import express from "express";
import prisma from "./config/database.js";

const app = express();
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "OK", database: "OK" });
  } catch (error) {
    res.status(503).json({ status: "DEGRADED", database: "ERROR" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: { id: true, nome: true, email: true, papel: true, foto: true, createdAt: true },
      orderBy: { id: "asc" },
    });
    res.status(200).json({ success: true, data: usuarios, total: usuarios.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar usuários" });
  }
});

app.get("/subjects", async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
    
      include: {
        professor: { select: { id: true, nome: true, email: true, papel: true, foto: true } }
      },
      orderBy: { id: "asc" },
    });
    res.status(200).json({ success: true, data: subjects, total: subjects.length });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erro ao buscar matérias" });
  }
});

app.get("/questions", async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        disciplina: true,
        autor: {
          select: { id: true, nome: true, email: true, papel: true, foto: true }
        }
      },
      orderBy: { id: "asc" },
    });

    // Desestruturamos para remover 'disciplina' e 'autor' com nomes em português,
    // e recriamos o objeto com os nomes em inglês esperados pelo teste do Bruno.
    const formattedQuestions = questions.map((q) => {
      const { disciplina, autor, ...resto } = q;
      return {
        ...resto,
        subject: disciplina,
        author: autor
      };
    });

    res.status(200).json({
      success: true,
      data: formattedQuestions,
      total: formattedQuestions.length,
    });
  } catch (error) {
    console.error("Erro ao buscar questões:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar questões" });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Rota não encontrada" });
});

export default app;