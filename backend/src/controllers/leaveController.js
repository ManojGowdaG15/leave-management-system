import prisma from "../prisma/prismaClient.js";

export const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;

    const leave = await prisma.leave.create({
      data: {
        userId: req.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType,
        reason,
      },
    });

    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const leaveHistory = async (req, res) => {
  const leaves = await prisma.leave.findMany({
    where: { userId: req.user.id },
    orderBy: { appliedDate: "desc" },
  });

  res.json(leaves);
};

export const cancelLeave = async (req, res) => {
  const { id } = req.params;

  const leave = await prisma.leave.update({
    where: { id: Number(id) },
    data: { status: "Cancelled" },
  });

  res.json(leave);
};
