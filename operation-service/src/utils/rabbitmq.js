// utils/rabbitmq.js
const amqp = require('amqplib');

let connection = null;
let channel = null;

const AMQP_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost';

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(AMQP_URL);
    
    connection.on("error", (err) => {
      console.error("RabbitMQ connection error", err);
      setTimeout(connectRabbitMQ, 5000); // Retry connection
    });

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed, retrying...");
      setTimeout(connectRabbitMQ, 5000); 
    });

    channel = await connection.createChannel();
    console.log("RabbitMQ connected");
    return channel;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    // Retry logic
    setTimeout(connectRabbitMQ, 5000);
  }
}

function getChannel() {
  return channel;
}

module.exports = { connectRabbitMQ, getChannel };