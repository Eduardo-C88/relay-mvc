const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
    const proxyOptions = (target) => ({
        target,
        changeOrigin: true,
        proxyTimeout: 10000,
        timeout: 10000,
        selfHandleResponse: false,
    });

    // User Service
    app.use("/api/auth", createProxyMiddleware(proxyOptions(process.env.USER_SERVICE_URL)));
    app.use("/api/users", createProxyMiddleware(proxyOptions(process.env.USER_SERVICE_URL)));

    // Resources Service
    app.use("/api/resources", createProxyMiddleware(proxyOptions(process.env.RESOURCES_SERVICE_URL)));

    // Transaction Service
    app.use("/api/borrowings", createProxyMiddleware(proxyOptions(process.env.TRANSACTION_SERVICE_URL)));
    app.use("/api/purchases", createProxyMiddleware(proxyOptions(process.env.TRANSACTION_SERVICE_URL)));
};
