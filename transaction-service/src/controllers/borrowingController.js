const borrowingService = require("../services/borrowingService");
const resourceClient = require("../utils/resourceClient");

exports.createBorrow = async (req, res) => {
  const resourceId = parseInt(req.params.id);
  const borrowerId = req.user.id;

  try {
    const availability = await resourceClient.checkAvailability(resourceId, borrowerId);

    if (!availability.available) {
      return res.status(400).json({ error: "Resource is not available for borrowing" });
    }

    // O front deve enviar startDate e endDate
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }

    const borrowData = {
      borrowerId,
      resourceId,
      ownerId: availability.ownerId,
      statusId: 1,              // Pending
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };

    const borrow = await borrowingService.createBorrowReq(borrowData);
    res.status(201).json(borrow);
    
  } catch (error) {
    console.error("Failed to create borrow:", error);
    res.status(500).json({ error: "Failed to create borrow" });
  }
};

exports.approveBorrow = async (req, res) => {
  const resourceId = parseInt(req.params.id);
  const ownerId = req.user.id;

  try {
    const confirmable = await resourceClient.checkConfirmable(resourceId, ownerId);

    if (!confirmable) {
      return res.status(400).json({ error: "Borrow cannot be approved" });
    }

    const updatedBorrow = await borrowingService.approveBorrowReq(resourceId);
    res.status(200).json(updatedBorrow);

  } catch (error) {
    console.error("Failed to approve borrow:", error);
    res.status(500).json({ error: "Failed to approve borrow" });
  }
};

exports.rejectBorrow = async (req, res) => {
  const resourceId = parseInt(req.params.id);
  const ownerId = req.user.id;

  try {
    const confirmable = await resourceClient.checkConfirmable(resourceId, ownerId);

    if (!confirmable) {
      return res.status(400).json({ error: "Borrow cannot be rejected" });
    }

    const updatedBorrow = await borrowingService.rejectBorrowReq(resourceId);
    res.status(200).json(updatedBorrow);

  } catch (error) {
    console.error("Failed to reject borrow:", error);
    res.status(500).json({ error: "Failed to reject borrow" });
  }
};

exports.getBorrowingsHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const borrowings = await borrowingService.getBorrowingsByUser(userId);
    res.status(200).json(borrowings);

  } catch (error) {
    console.error("Failed to get borrow history:", error);
    res.status(500).json({ error: "Failed to get borrow history" });
  }
};

exports.getUserBorrowings = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const borrowings = await borrowingService.getBorrowingsByUser(userId);
    res.status(200).json(borrowings);

  } catch (error) {
    console.error("Failed to get user borrowings:", error);
    res.status(500).json({ error: "Failed to get user borrowings" });
  }
};

exports.getAllBorrowings = async (req, res) => {
  try {
    const borrowings = await borrowingService.getAllBorrowings();
    res.status(200).json(borrowings);

  } catch (error) {
    console.error("Failed to get all borrowings:", error);
    res.status(500).json({ error: "Failed to get all borrowings" });
  }
};
