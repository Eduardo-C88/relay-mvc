const { getChannel } = require("../utils/rabbitmq");

const USER_EXCHANGE = "user_events"; // Name of the exchange

async function initUserPublisher(ch) {
  channel = getChannel();
  if (!channel) return;

  await channel.assertExchange(USER_EXCHANGE, 'fanout', { durable: true });
}

function publishUserCreated(user) {
  const channel = getChannel();
  if (!channel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }

  channel.publish(
    USER_EXCHANGE,
    '',
    Buffer.from(JSON.stringify(user)), { persistent: true }
  );
  console.log("Published UserCreated event");
}

function publishUserUpdated(user) {
  const channel = getChannel();
  if (!channel) {
    console.error("RabbitMQ channel not initialized");
    return;
  }

  channel.publish(
    USER_EXCHANGE,
    '',
    Buffer.from(JSON.stringify(user)), { persistent: true }
  );
  console.log("Published UserUpdated event");
}

// function publishUserCreated(user) {
//   if (!channel) throw new Error("RabbitMQ channel not initialized");

//   channel.sendToQueue(
//     "UserCreated",
//     Buffer.from(JSON.stringify(user))
//   );
// }

// function publishUserUpdated(user) {
//   channel.sendToQueue(
//     "UserUpdated",
//     Buffer.from(JSON.stringify(user))
//   );
// }

module.exports = { initUserPublisher, publishUserCreated, publishUserUpdated };