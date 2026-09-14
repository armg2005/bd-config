import prisma from "../config/database.js";

const publicQuestionSelect = {
  id: true,
  enunciado: true,
  dificuldade: true,
  respostaCorreta: true,
  ativa: true,
  subjectId: true,
  authorId: true,
  createdAt: true,
  subject: {
    select: {
      id: true,
      nome: true,
      ativa: true,
    },
  },
  author: {
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
    },
  },
};

/**
 * Busca todas as questões no formato público.
 * @returns {Promise<Object[]>} Lista de questões.
 */
export const getAllQuestions = async () => {
  return prisma.question.findMany({
    select: publicQuestionSelect,
    orderBy: { id: "asc" },
  });
};

/**
 * Busca uma questão pelo identificador único.
 * @param {number} questionId - ID da questão.
 * @returns {Promise<Object|null>} Questão encontrada ou null.
 */
export const getQuestionById = async (questionId) => {
  return prisma.question.findUnique({
    where: { id: questionId },
    select: publicQuestionSelect,
  });
};

/**
 * Cria uma nova questão depois de verificar
 * se a matéria e o autor existem.
 *
 * @param {{
 *   enunciado: string,
 *   dificuldade: number,
 *   respostaCorreta?: string|null,
 *   subjectId: number,
 *   authorId: number
 * }} questionData - Dados da questão.
 *
 * @returns {Promise<{
 *   ok: boolean,
 *   data?: Object,
 *   reason?: string
 * }>}
 */
export const createQuestion = async (questionData) => {
  // Verifica se a matéria existe
  const subject = await prisma.subject.findUnique({
    where: { id: questionData.subjectId },
  });

  if (!subject) {
    return {
      ok: false,
      reason: "SUBJECT_NOT_FOUND",
    };
  }

  // Verifica se o author existe
  const author = await prisma.user.findUnique({
    where: { id: questionData.authorId },
  });

  if (!author) {
    return {
      ok: false,
      reason: "AUTHOR_NOT_FOUND",
    };
  }

  const novaQuestion = await prisma.question.create({
    data: {
      enunciado: questionData.enunciado.trim(),
      dificuldade: questionData.dificuldade,
      respostaCorreta: questionData.respostaCorreta?.trim() || null,
      subjectId: questionData.subjectId,
      authorId: questionData.authorId,
    },
    select: publicQuestionSelect,
  });

  return {
    ok: true,
    data: novaQuestion,
  };
};
export const updateQuestion = async (questionId, questionData) => {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return {
      ok: false,
      reason: "NOT_FOUND",
    };
  }

  if (questionData.subjectId !== undefined) {
    const subject = await prisma.subject.findUnique({
      where: { id: questionData.subjectId },
    });

    if (!subject) {
      return {
        ok: false,
        reason: "SUBJECT_NOT_FOUND",
      };
    }
  }

  if (questionData.authorId !== undefined) {
    const author = await prisma.user.findUnique({
      where: { id: questionData.authorId },
    });

    if (!author) {
      return {
        ok: false,
        reason: "AUTHOR_NOT_FOUND",
      };
    }
  }

  const data = {};

  if (questionData.enunciado !== undefined) {
    data.enunciado = questionData.enunciado.trim();
  }

  if (questionData.dificuldade !== undefined) {
    data.dificuldade = questionData.dificuldade;
  }

  if (questionData.respostaCorreta !== undefined) {
    data.respostaCorreta =
      questionData.respostaCorreta === null
        ? null
        : questionData.respostaCorreta.trim();
  }

  if (questionData.ativa !== undefined) {
    data.ativa = questionData.ativa;
  }

  if (questionData.subjectId !== undefined) {
    data.subjectId = questionData.subjectId;
  }

  if (questionData.authorId !== undefined) {
    data.authorId = questionData.authorId;
  }

  const novaQuestion = await prisma.question.update({
    where: { id: questionId },
    data,
    select: publicQuestionSelect,
  });

  return {
    ok: true,
    data: novaQuestion,
  };
};

export const deleteQuestion = async (questionId) => {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return {
      ok: false,
      reason: "NOT_FOUND",
    };
  }

 const deletedQuestion = await prisma.question.delete({
  where: { id: questionId },
  select: publicQuestionSelect,
});

return {
  ok: true,
  data: deletedQuestion,
};
};
