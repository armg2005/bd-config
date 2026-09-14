import * as questionService from "../services/questionService.js";

/**
 * Controller de Questões (Question)
 * Responsável por gerenciar as operações de questões vinculadas
 * a uma matéria (subject) e a um author
 */

const DIFICULDADES_VALIDAS = [1, 2, 3]; // 1 = fácil, 2 = média, 3 = difícil

// CREATE - Criar nova questão
export const create = async (req, res) => {
  try {
    const { enunciado, dificuldade, respostaCorreta, subjectId, authorId } =
      req.body;

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
        message:
          "enunciado, dificuldade, subjectId e authorId são obrigatórios",
      });
    }

    // Validação da dificuldade (1, 2 ou 3)
    const dificuldadeNum = Number(dificuldade);

    if (!DIFICULDADES_VALIDAS.includes(dificuldadeNum)) {
      return res.status(400).json({
        success: false,
        message:
          "dificuldade inválida. Use 1 (fácil), 2 (média) ou 3 (difícil)",
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

    const result = await questionService.createQuestion({
      enunciado,
      dificuldade: dificuldadeNum,
      respostaCorreta,
      subjectId: subjectIdNum,
      authorId: authorIdNum,
    });

    // Matéria não encontrada
    if (!result.ok && result.reason === "SUBJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectIdNum} não encontrada`,
      });
    }

    // Author não encontrado
    if (!result.ok && result.reason === "AUTHOR_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `author com ID ${authorIdNum} não encontrado`,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Questão criada com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao criar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar questão",
    });
  }
};

// READ - Listar todas as questões
export const getAll = async (req, res) => {
  try {
    const questions = await questionService.getAllQuestions();

    return res.status(200).json({
      success: true,
      data: questions,
      total: questions.length,
    });
  } catch (error) {
    console.error("Erro ao listar questões:", error);

    return res.status(500).json({
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

    const question = await questionService.getQuestionById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Erro ao buscar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar questão",
    });
  }
};
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const questionId = Number(id);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      ativa,
      subjectId,
      authorId,
    } = req.body;

    if (
      enunciado === undefined &&
      dificuldade === undefined &&
      respostaCorreta === undefined &&
      ativa === undefined &&
      subjectId === undefined &&
      authorId === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Informe pelo menos um campo para atualizar",
      });
    }

    if (enunciado !== undefined) {
      if (typeof enunciado !== "string" || enunciado.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "enunciado deve ser um texto não vazio",
        });
      }
    }

    let dificuldadeNum;

    if (dificuldade !== undefined) {
      dificuldadeNum = Number(dificuldade);

      if (!DIFICULDADES_VALIDAS.includes(dificuldadeNum)) {
        return res.status(400).json({
          success: false,
          message:
            "dificuldade inválida. Use 1 (fácil), 2 (média) ou 3 (difícil)",
        });
      }
    }

    if (respostaCorreta !== undefined && respostaCorreta !== null) {
      if (typeof respostaCorreta !== "string") {
        return res.status(400).json({
          success: false,
          message: "respostaCorreta deve ser um texto ou null",
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

    let subjectIdNum;

    if (subjectId !== undefined) {
      subjectIdNum = Number(subjectId);

      if (!Number.isInteger(subjectIdNum) || subjectIdNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "subjectId inválido. Deve ser um número inteiro positivo",
        });
      }
    }

    let authorIdNum;

    if (authorId !== undefined) {
      authorIdNum = Number(authorId);

      if (!Number.isInteger(authorIdNum) || authorIdNum <= 0) {
        return res.status(400).json({
          success: false,
          message: "authorId inválido. Deve ser um número inteiro positivo",
        });
      }
    }

    const result = await questionService.updateQuestion(questionId, {
      enunciado,
      dificuldade: dificuldadeNum,
      respostaCorreta,
      ativa,
      subjectId: subjectIdNum,
      authorId: authorIdNum,
    });

    if (!result.ok && result.reason === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "SUBJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectIdNum} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "AUTHOR_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `author com ID ${authorIdNum} não encontrado`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Questão atualizada com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao atualizar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar questão",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const questionId = Number(id);

    if (!Number.isInteger(questionId) || questionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const result = await questionService.deleteQuestion(questionId);

    if (!result.ok && result.reason === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Questão excluída com sucesso",
      data: result.data,
});
  } catch (error) {
    console.error("Erro ao excluir questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao excluir questão",
    });
  }
};
