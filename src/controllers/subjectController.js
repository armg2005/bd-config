// src/controllers/subjectController.js
import prisma from "../config/database.js";

/**
 * Controller de Matérias (Subject)
 * Responsável por gerenciar as operações de matérias vinculadas a um professor
 */

// CREATE - Criar nova matéria
export const create = async (req, res) => {
  try {
    const { nome, professorId } = req.body;

    // Validação de campos obrigatórios
    if (!nome || nome.trim() === "" || professorId === undefined || professorId === null) {
      return res.status(400).json({
        success: false,
        message: "Nome e professorId são obrigatórios",
      });
    }

    // Validação do ID (inteiro positivo)
    const professorIdNum = Number(professorId);
    if (!Number.isInteger(professorIdNum) || professorIdNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "professorId inválido. Deve ser um número inteiro positivo",
      });
    }

    // Verifica se o professor existe
    const professor = await prisma.user.findUnique({
      where: { id: professorIdNum },
    });

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: `Professor com ID ${professorIdNum} não encontrado`,
      });
    }

    // Cria a matéria no banco
    const novaSubject = await prisma.subject.create({
      data: {
        nome,
        professorId: professorIdNum,
      },
      select: {
        id: true,
        nome: true,
        ativa: true,
        professorId: true,
        createdAt: true,
        professor: {
          select: { id: true, nome: true, email: true, papel: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Matéria criada com sucesso",
      data: novaSubject,
    });
  } catch (error) {
    console.error("Erro ao criar matéria:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao criar matéria",
    });
  }
};

// READ - Listar todas as matérias
export const getAll = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        nome: true,
        ativa: true,
        professorId: true,
        createdAt: true,
        professor: {
          select: { id: true, nome: true, email: true, papel: true },
        },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length,
    });
  } catch (error) {
    console.error("Erro ao listar matérias:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao listar matérias",
    });
  }
};

// READ - Buscar matéria por ID
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const subjectId = Number(id);

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        id: true,
        nome: true,
        ativa: true,
        professorId: true,
        createdAt: true,
        professor: {
          select: { id: true, nome: true, email: true, papel: true },
        },
      },
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectId} não encontrada`,
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error("Erro ao buscar matéria:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar matéria",
    });
  }
};