const amqp = require('amqplib');

let connection = null;
let channel = null;

const AMQP_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';

// Queue of callbacks to run when channel is ready
const readyCallbacks = [];

/**
 * Connect to RabbitMQ and create a channel.
 * Reconnects automatically on failure.
 */
async function connectRabbitMQ() {
  if (channel) return channel; // reuse if already connected

  try {
    connection = await amqp.connect(AMQP_URL);

    connection.on("error", (err) => {
      console.error("RabbitMQ connection error:", err);
    });

    connection.on("close", async () => {
      console.warn("RabbitMQ connection closed, retrying in 5s...");
      channel = null;
      await new Promise(res => setTimeout(res, 5000));
      await connectRabbitMQ();
    });

    channel = await connection.createChannel();
    console.log("✅ RabbitMQ connected and channel created");

    // Run all callbacks waiting for channel
    readyCallbacks.forEach(cb => cb(channel));

    return channel;
  } catch (err) {
    console.error("Failed to connect to RabbitMQ, retrying in 5s...", err);
    channel = null;
    await new Promise(res => setTimeout(res, 5000));
    return connectRabbitMQ();
  }
}

function getChannel() {
  if (!channel) {
    console.warn("RabbitMQ channel not initialized yet.");
  }
  return channel;
}

/**
 * Run a function once the channel is ready
 * Useful for starting consumers safely
 */
function onChannelReady(callback) {
  if (channel) {
    callback(channel);
  } else {
    readyCallbacks.push(callback);
  }
}

module.exports = { connectRabbitMQ, getChannel, onChannelReady };
