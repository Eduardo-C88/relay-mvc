const app = require('./app');

const RESOURCE_PORT = process.env.RESOURCE_PORT || 3002;

app.listen(RESOURCE_PORT, () => {
    console.log(`Server is running on http://localhost:${RESOURCE_PORT}`);
});
