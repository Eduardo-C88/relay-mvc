const purchasesService = require("../services/purchasesService");

exports.createPurchaseReq = async (req, res) => {
  try {
    const purchaseData = {
      resourceId: req.body.resourceId,
      buyerId: req.user.id,
      // Add other necessary fields from req.body if needed
    };
    const purchase = await purchasesService.createPurchaseReq(purchaseData);
    res.status(201).json(purchase);
  } catch (error) {
    console.error("Error creating purchase request:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to create purchase request" });
  }
};

exports.approveTransaction = async (req, res) => {
  try {
    const purchaseId = parseInt(req.params.purchaseId);

    const transaction = await purchasesService.approveTransaction(
      purchaseId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Transaction approved",
      data: transaction,
    });
  } catch (error) {
    console.error("Error approving transaction:", error);

    return res.status(400).json({
      success: false,
      error: error.message || "Failed to approve transaction",
    });
  }
};

exports.rejectTransaction = async (req, res) => {
  try {
    //Ir buscar o ID da transação a rejeitar a partir dos parâmetros da rota
    const { purchaseId } = req.params;

    //Chamar o service responsável por tratar da lógica de rejeição
    const transaction = await purchasesService.rejectTransaction(
      purchaseId,
      req.user.id
    );

    //Se tudo correr bem, devolver resposta de sucesso
    return res.status(200).json({
      success: true,
      message: "Transaction rejected",
      data: transaction,
    });
  } catch (error) {
    //Caso ocorra algum erro, mostrar no servidor para debug
    console.error("Error rejecting transaction:", error);

    //Enviar resposta de erro para o cliente
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to reject transaction",
    });
  }
};

exports.getPurchasesHistory = async (req, res) => {
  try {
    //Buscar o ID do comprador a partir do utilizador autenticado
    const buyerId = req.user.id;

    //Chamar o service que retorna o histórico de compras do utilizador
    const purchases = await purchasesService.getPurchasesHistory(buyerId);

    //Devolver resposta de sucesso com os dados
    return res.status(200).json({
      success: true,
      message: "Purchases history retrieved",
      data: purchases,
    });
  } catch (error) {
    //Log para debug
    console.error("Error retrieving purchases history:", error);

    //Devolver resposta de erro
    return res.status(400).json({
      success: false,
      error: error.message || "Failed to retrieve purchases history",
    });
  }
};
