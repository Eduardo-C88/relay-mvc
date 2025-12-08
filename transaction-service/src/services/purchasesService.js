const { prisma } = require("../models/prismaClient");
const purchaseEvents = require("../events/transactionPublisher");

exports.createPurchaseReq = async (purchaseData) => {
  const purchase = await prisma.purchases.create({
    data: purchaseData,
  });

  return purchase;
};

exports.approveTransactionReq = async (transactionId, currentUserId) => {
  const transaction = await prisma.purchases.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) throw new Error("Transaction not found");
  if (transaction.statusId !== 4)
    throw new Error("Only PENDING transactions can be approved");
  //if (!transaction.item) throw new Error("Associated item not found");

  // if (transaction.item.ownerId !== currentUserId) {
  //   throw new Error("You are not allowed to approve this transaction");
  // }

  // if (!transaction.item.isAvailable) {
  //   throw new Error("Item is no longer available");
  // }

  const [updatedTransaction] = await prisma.$transaction([
    prisma.purchases.update({
      where: { id: transactionId },
      data: {
        statusId: 5,
        //approvedAt: new Date(),
      },
    }),

    // prisma.items.update({
    //   where: { id: transaction.itemId },
    //   data: {
    //     isAvailable: false,
    //     isForSale: false,
    //   },
    // }),
  ]);

  // Disparar evento
  purchaseEvents.onTransactionApproved({
    transactionId: updatedTransaction.id,
    itemId: transaction.item.id,
    approvedBy: currentUserId,
  });

  return updatedTransaction;
};

exports.rejectTransactionReq = async (transactionId, currentUserId) => {
  //Buscar a transação pelo ID e incluir os dados do item associado
  const transaction = await prisma.purchases.findUnique({
    where: { id: transactionId },
    include: { item: true },
  });

  //Validar se a transação existe
  if (!transaction) throw new Error("Transaction not found");

  //Garantir que apenas transações pendentes podem ser rejeitadas
  if (transaction.status !== "PENDING")
    throw new Error("Only PENDING transactions can be rejected");

  //Garantir que a transação tem um item associado
  if (!transaction.item) throw new Error("Associated item not found");

  //Validar se quem está a rejeitar é o dono do item
  if (transaction.item.ownerId !== currentUserId) {
    throw new Error("You are not allowed to reject this transaction");
  }

  //Atualizar o status da transação para 'REJECTED' e registrar a data de rejeição
  const updatedTransaction = await prisma.purchases.update({
    where: { id: transactionId },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
    },
  });

  //Disparar evento para notificar outros serviços/sistemas da rejeição
  purchaseEvents.onTransactionRejected({
    transactionId: updatedTransaction.id,
    itemId: transaction.item.id,
    rejectedBy: currentUserId,
  });

  //Retornar a transação atualizada
  return updatedTransaction;
};

exports.completeTransactionReq = async (transactionId, currentUserId) => {
  //Buscar transação + item
  const transaction = await prisma.purchases.findUnique({
    where: { id: transactionId },
    include: { item: true },
  });

  if (!transaction) throw new Error("Transaction not found");

  //Verifica se o status é APPROVED (statusId = 5)
  if (transaction.statusId !== 5)
    throw new Error("Only APPROVED transactions can be completed");

  //Atualiza transação + item de forma atômica
  const [updatedTransaction] = await prisma.$transaction([
    prisma.purchases.update({
      where: { id: transactionId },
      data: {
        statusId: 6, // COMPLETED
        completedAt: new Date(),
      },
    }),
    prisma.items.update({
      where: { id: transaction.itemId },
      data: {
        isAvailable: false,
        isForSale: false,
      },
    }),
  ]);

  //Dispara evento
  purchaseEvents.onTransactionCompleted({
    transactionId: updatedTransaction.id,
    itemId: transaction.item.id,
    completedBy: currentUserId,
  });

  return updatedTransaction;
};

exports.getPurchasesHistoryReq = async (userId) => {
  //Buscar todas as compras do utilizador (buyerId) no Prisma
  const purchases = await prisma.purchases.findMany({
    where: { buyerId: userId },
    include: { item: true }, // incluir dados do item
    orderBy: { createdAt: "desc" }, // mais recentes primeiro
  });

  //Se não houver compras, lançar erro (opcional)
  if (purchases.length === 0) {
    throw new Error("No purchase history found");
  }

  //Retornar histórico
  return purchases;
};

exports.getUserPurchasesReq = async (userId) => {
  // Buscar todas as compras do usuário pelo ID
  const purchases = await prisma.purchases.findMany({
    where: { buyerId: userId },
    include: { item: true }, // incluir dados do item
    orderBy: { createdAt: "desc" }, // mais recentes primeiro
  });

  // Se não houver compras, lançar erro
  if (purchases.length === 0) {
    throw new Error("No purchases found for this user");
  }
  // Retornar as compras
  return purchases;
};

exports.getAllPurchasesReq = async () => {
  // Buscar todas as compras no sistema
  const purchases = await prisma.purchases.findMany({
    include: { item: true }, // incluir dados do item
    orderBy: { createdAt: "desc" }, // mais recentes primeiro
  });
  // Verificar se há compras
  if (!purchases || purchases.length === 0)
    throw new Error("No purchases found");

  return purchases;
};
