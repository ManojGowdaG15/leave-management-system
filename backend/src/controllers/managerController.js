import prisma from "../prisma/prismaClient.js";

export const pendingLeaves = async (req, res) => {
  const leaves = await prisma.leave.findMany({
    where: { status: "Pending" },
    include: { user: true },
  });

  res.json(leaves);
};

export const approveLeave = async (req, res) => {
  const { id } = req.params;

  const updated = await prisma.leave.update({
    where: { id: Number(id) },
    data: { status: "Approved" },
  });

  res.json(updated);
};

export const rejectLeave = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const updated = await prisma.leave.update({
    where: { id: Number(id) },
    data: { status: "Rejected", managerComment: comment },
  });

  res.json(updated);
};
