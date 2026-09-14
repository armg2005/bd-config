import prisma from "../config/database.js";

const publicSubjectSelect = {
  id: true,
  nome: true,
  ativa: true,
  professorId: true,
  createdAt: true,
  professor: {
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
    },
  },
};

/**
 * Busca todas as matérias no formato público.
 * @returns {Promise<Object[]>} Lista de matérias.
 */
export const getAllSubjects = async () => {
  return prisma.subject.findMany({
    select: publicSubjectSelect,
    orderBy: { id: "asc" },
  });
};

/**
 * Busca uma matéria pelo identificador único.
 * @param {number} subjectId - ID da matéria.
 * @returns {Promise<Object|null>} Matéria encontrada ou null.
 */
export const getSubjectById = async (subjectId) => {
  return prisma.subject.findUnique({
    where: { id: subjectId },
    select: publicSubjectSelect,
  });
};

/**
 * Cria uma nova matéria depois de verificar se o professor existe.
 * @param {{ nome: string, professorId: number }} subjectData - Dados da matéria.
 * @returns {Promise<{ ok: boolean, data?: Object, reason?: string }>}
 */
export const createSubject = async (subjectData) => {
  const professor = await prisma.user.findUnique({
    where: { id: subjectData.professorId },
  });

  if (!professor) {
    return {
      ok: false,
      reason: "PROFESSOR_NOT_FOUND",
    };
  }

  const novaSubject = await prisma.subject.create({
    data: {
      nome: subjectData.nome.trim(),
      professorId: subjectData.professorId,
    },
    select: publicSubjectSelect,
  });

  return {
    ok: true,
    data: novaSubject,
  };
};
export const updateSubject = async (subjectId, subjectData) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    return {
      ok: false,
      reason: "NOT_FOUND",
    };
  }

  if (subjectData.professorId !== undefined) {
    const professor = await prisma.user.findUnique({
      where: { id: subjectData.professorId },
    });

    if (!professor) {
      return {
        ok: false,
        reason: "PROFESSOR_NOT_FOUND",
      };
    }
  }

  const data = {};

  if (subjectData.nome !== undefined) {
    data.nome = subjectData.nome.trim();
  }

  if (subjectData.ativa !== undefined) {
    data.ativa = subjectData.ativa;
  }

  if (subjectData.professorId !== undefined) {
    data.professorId = subjectData.professorId;
  }

  const novaSubject = await prisma.subject.update({
    where: { id: subjectId },
    data,
    select: publicSubjectSelect,
  });

  return {
    ok: true,
    data: novaSubject,
  };
};

export const deleteSubject = async (subjectId) => {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  if (!subject) {
    return {
      ok: false,
      reason: "NOT_FOUND",
    };
  }

  if (subject._count.questions > 0) {
    return {
      ok: false,
      reason: "SUBJECT_IN_USE",
    };
  }

  try {
    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return {
      ok: true,
    };
  } catch (error) {
    if (error.code === "P2003" || error.code === "P2014") {
      return {
        ok: false,
        reason: "SUBJECT_IN_USE",
      };
    }

    throw error;
  }
};
