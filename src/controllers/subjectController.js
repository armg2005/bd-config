import * as subjectService from "../services/subjectService.js";

/**
 * Controller de Matérias (Subject)
 * Responsável por gerenciar as operações de matérias vinculadas a um professor
 */

// CREATE - Criar nova matéria
export const create = async (req, res) => {
  try {
    const { nome, professorId } = req.body;

    // Validação de campos obrigatórios
    if (
      !nome ||
      nome.trim() === "" ||
      professorId === undefined ||
      professorId === null
    ) {
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

    const result = await subjectService.createSubject({
      nome,
      professorId: professorIdNum,
    });

    // Professor não encontrado
    if (!result.ok && result.reason === "PROFESSOR_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Professor com ID ${professorIdNum} não encontrado`,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Matéria criada com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao criar matéria:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar matéria",
    });
  }
};

// READ - Listar todas as matérias
export const getAll = async (req, res) => {
  try {
    const subjects = await subjectService.getAllSubjects();

    return res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length,
    });
  } catch (error) {
    console.error("Erro ao listar matérias:", error);

    return res.status(500).json({
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

    const subject = await subjectService.getSubjectById(subjectId);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    console.error("Erro ao buscar matéria:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar matéria",
    });
  }
};
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const subjectId = Number(id);

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const { nome, ativa, professorId } = req.body;

    if (
      nome === undefined &&
      ativa === undefined &&
      professorId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Informe pelo menos um campo para atualizar",
      });
    }

    if (nome !== undefined) {
      if (typeof nome !== "string" || nome.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "nome deve ser um texto não vazio",
        });
      }
    }

    if (ativa !== undefined) {
      if (typeof ativa !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "ativa deve ser um booleano",
        });
      }
    }

    let professorIdNum;

    if (professorId !== undefined) {
      professorIdNum = Number(professorId);

      if (!Number.isInteger(professorIdNum) || professorIdNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "professorId inválido. Deve ser um número inteiro positivo",
        });
      }
    }

    const result = await subjectService.updateSubject(subjectId, {
      nome,
      ativa,
      professorId: professorIdNum,
    });

    if (!result.ok && result.reason === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectId} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "PROFESSOR_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Professor com ID ${professorIdNum} não encontrado`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Matéria atualizada com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao atualizar matéria:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar matéria",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const subjectId = Number(id);

    if (!Number.isInteger(subjectId) || subjectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const result = await subjectService.deleteSubject(subjectId);

    if (!result.ok && result.reason === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectId} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "SUBJECT_IN_USE") {
      return res.status(409).json({
        success: false,
        message: `Matéria com ID ${subjectId} possui questões vinculadas e não pode ser excluída`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Matéria excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir matéria:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao excluir matéria",
    });
  }
};
