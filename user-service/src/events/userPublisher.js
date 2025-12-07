let channel;

async function initUserPublisher(ch) {
  channel = ch;
  await channel.assertQueue("UserCreated");
  await channel.assertQueue("UserUpdated");
}

function publishUserCreated(user) {
  if (!channel) throw new Error("RabbitMQ channel not initialized");

  channel.sendToQueue(
    "UserCreated",
    Buffer.from(JSON.stringify(user))
  );
}

function publishUserUpdated(user) {
  channel.sendToQueue(
    "UserUpdated",
    Buffer.from(JSON.stringify(user))
  );
}

module.exports = { initUserPublisher, publishUserCreated, publishUserUpdated };