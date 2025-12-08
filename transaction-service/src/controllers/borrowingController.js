const borrowingService = require("../services/borrowingService");

exports.createBorrow = async (req, res) => {
  try {
    const borrowingData = {
      resourceId: req.params.id,
      borrowerId: req.user.id, // quem quer emprestar
      ownerId: req.body.ownerId, // dono do item
      startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      statusId: 4, // PENDING
    };

    const borrowing = await borrowingService.createBorrowingReq(borrowingData);

    res.status(201).json({
      success: true,
      message: "Borrowing request created successfully",
      data: borrowing,
    });
  } catch (error) {
    console.error("Error creating borrowing request:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create borrowing request",
    });
  }
};
