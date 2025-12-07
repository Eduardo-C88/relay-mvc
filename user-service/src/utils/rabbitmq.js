const amqp = require('amqplib');

let connection;
let channel;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect('amqp://admin:admin@localhost');
    channel = await connection.createChannel();
    console.log("RabbitMQ connected");
    return channel;
  } catch (error) {
    console.error("RabbitMQ connection error:", error);
  }
}

module.exports = { connectRabbitMQ };
