const app = require('./app');

const OPERATION_PORT = process.env.OPERATION_PORT || 3003;

app.listen(OPERATION_PORT, () => {
    console.log(`Server is running on http://localhost:${OPERATION_PORT}`);
});
