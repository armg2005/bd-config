// src/controllers/questionController.js
import prisma from "../config/database.js";

/**
 * Controller de Questões (Question)
 * Responsável por gerenciar as operações de questões vinculadas
 * a uma matéria (subject) e a um author
 */

const DIFICULDADES_VALIDAS = [1, 2, 3]; // 1 = fácil, 2 = média, 3 = difícil

// CREATE - Criar nova questão
export const create = async (req, res) => {
  try {
    const { enunciado, dificuldade, respostaCorreta, subjectId, authorId } = req.body;

    // Validação de campos obrigatórios
    if (
      !enunciado ||
      enunciado.trim() === "" ||
      dificuldade === undefined ||
      dificuldade === null ||
      subjectId === undefined ||
      subjectId === null ||
      authorId === undefined ||
      authorId === null
    ) {
      return res.status(400).json({
        success: false,
        message: "enunciado, dificuldade, subjectId e authorId são obrigatórios",
      });
    }

    // Validação da dificuldade (1, 2 ou 3)
    const dificuldadeNum = Number(dificuldade);
    if (!DIFICULDADES_VALIDAS.includes(dificuldadeNum)) {
      return res.status(400).json({
        success: false,
        message: "dificuldade inválida. Use 1 (fácil), 2 (média) ou 3 (difícil)",
      });
    }

    // Validação dos IDs (inteiros positivos)
    const subjectIdNum = Number(subjectId);
    const authorIdNum = Number(authorId);

    if (!Number.isInteger(subjectIdNum) || subjectIdNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "subjectId inválido. Deve ser um número inteiro positivo",
      });
    }

    if (!Number.isInteger(authorIdNum) || authorIdNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "authorId inválido. Deve ser um número inteiro positivo",
      });
    }

    // Verifica se a matéria existe
    const subject = await prisma.subject.findUnique({
      where: { id: subjectIdNum },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectIdNum} não encontrada`,
      });
    }

    // Verifica se o author existe
    const author = await prisma.user.findUnique({
      where: { id: authorIdNum },
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: `author com ID ${authorIdNum} não encontrado`,
      });
    }

    // Cria a questão no banco
    const novaQuestion = await prisma.question.create({
      data: {
        enunciado,
        dificuldade: dificuldadeNum,
        respostaCorreta: respostaCorreta || null,
        subjectId: subjectIdNum,
        authorId: authorIdNum,
      },
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        ativa: true,
        subjectId: true,
        authorId: true,
        createdAt: true,
        subject: {
          select: { id: true, nome: true, ativa: true },
        },
        author: {
          select: { id: true, nome: true, email: true, papel: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Questão criada com sucesso",
      data: novaQuestion,
    });
  } catch (error) {
    console.error("Erro ao criar questão:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar questão",
    });
  }
};

// READ - Listar todas as questões
export const getAll = async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        ativa: true,
        subjectId: true,
        authorId: true,
        createdAt: true,
        subject: {
          select: { id: true, nome: true, ativa: true },
        },
        author: {
          select: { id: true, nome: true, email: true, papel: true },
        },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      success: true,
      data: questions,
      total: questions.length,
    });
  } catch (error) {
    console.error("Erro ao listar questões:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao listar questões",
    });
  }
};

// READ - Buscar questão por ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const questionId = Number(id);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        ativa: true,
        subjectId: true,
        authorId: true,
        createdAt: true,
        subject: {
          select: { id: true, nome: true, ativa: true },
        },
        author: {
          select: { id: true, nome: true, email: true, papel: true },
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Erro ao buscar questão:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar questão",
    });
  }
};