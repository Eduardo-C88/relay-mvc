const app = require('./app');

const AUTH_PORT = process.env.AUTH_PORT || 3001;

app.listen(AUTH_PORT, () => {
    console.log(`Server is running on http://localhost:${AUTH_PORT}`);
});

