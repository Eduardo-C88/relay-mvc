const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../static/swagger/swagger.json');
const { connectRabbitMQ } = require("./utils/rabbitmq");
const { startUserUpdatedConsumer, startUserCreatedConsumer } = require("./events/resourceConsumer");

// App Routes
const purchasesRoutes = require('./routes/purchasesRoutes');
const borrowingRoutes = require('./routes/borrowingRoutes');


require('dotenv').config();

const app = express();
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//Serve static files from the 'static' directory
app.use('/', express.static(path.join(__dirname, '../static')));
//access api documentation
app.use('/doc', express.static(path.join(__dirname, '../static/doc')));
app.use('/apidoc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Connect to RabbitMQ and start consumers
(async () => {
    const channel = await connectRabbitMQ();
    await startUserCreatedConsumer(channel);
    await startUserUpdatedConsumer(channel);
})();

//app.use(express.json());

// app.use Routes
app.use('/api/borrowings', borrowingRoutes);
app.use('/api/purchases', purchasesRoutes);
 
module.exports = app;
