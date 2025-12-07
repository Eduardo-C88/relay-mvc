const app = require('./app');

const TRANSACTION_PORT = process.env.TRANSACTION_PORT || 3003;

app.listen(TRANSACTION_PORT, () => {
    console.log(`Server is running on http://localhost:${TRANSACTION_PORT}`);
});
