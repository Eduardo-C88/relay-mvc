require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   📊 Analytics & Reporting Service                       ║
║                                                           ║
║   🚀 Server running on port ${PORT}                        ║
║   📝 Environment: ${process.env.NODE_ENV || 'development'}                        ║
║   📚 API Docs: http://localhost:${PORT}/api-docs           ║
║   ❤️  Health: http://localhost:${PORT}/health              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});
