const amqp = require('amqplib');

let connection = null;
let channel = null;
let onChannelReadyCallbacks = [];

const AMQP_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost';

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(AMQP_URL);

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error", err);
    });

    connection.on("close", () => {
      console.warn("RabbitMQ connection closed. Reconnecting...");
      setTimeout(connectRabbitMQ, 5000);
    });

    channel = await connection.createChannel();
    console.log("RabbitMQ connected");

    // 🔥 Re-register all consumers
    for (const cb of onChannelReadyCallbacks) {
      await cb(channel);
    }

    return channel;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    // Retry connection after 5 seconds
    setTimeout(connectRabbitMQ, 5000);
  }
}

function getChannel() {
  return channel;
}

/**
 * Register a callback that runs whenever a channel is ready
 */
function onChannelReady(callback) {
  onChannelReadyCallbacks.push(callback);

  // If channel already exists, run immediately
  if (channel) {
    callback(channel);
  }
}

module.exports = { connectRabbitMQ, getChannel, onChannelReady };
