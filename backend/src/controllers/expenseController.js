import prisma from "../prisma/prismaClient.js";

export const submitExpense = async (req, res) => {
  const { amount, category, expenseDate, description } = req.body;

  const expense = await prisma.expense.create({
    data: {
      userId: req.user.id,
      amount,
      category,
      expenseDate: new Date(expenseDate),
      description,
    },
  });

  res.json(expense);
};

export const expenseHistory = async (req, res) => {
  const expenses = await prisma.expense.findMany({
    where: { userId: req.user.id },
    orderBy: { submittedDate: "desc" },
  });

  res.json(expenses);
};
