module.exports = (err, req, res, next) => {
    console.error("Gateway error:", err);
    res.status(500).json({ message: "Internal Gateway Error", error: err.message });
    next();
};