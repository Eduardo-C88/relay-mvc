let channel;
let borrowChannel;

/**
 * Inicializa o publisher com o canal RabbitMQ.
 * @param {Object} ch - Canal do RabbitMQ.
 */
async function initTransactionPublisher(ch) {
  channel = ch;

  // Criação das filas se ainda não existirem
  await channel.assertQueue("TransactionUpdated");
  await channel.assertQueue("TransactionRejected");
  await channel.assertQueue("TransactionCompleted");
  await channel.assertQueue("TransactionCreated");

  console.log("TransactionPublisher initialized with queues.");
}

/** * Publica evento de transação criada.
 * @param {Object} data - Dados da transação criada.
 *   { transactionId, itemId, createdBy }
 */
async function onTransactionCreated(data) {
  if (!channel) {
    throw new Error("TransactionPublisher not initialized");
  }
  await channel.assertQueue("TransactionCreated"); // garante que a fila existe
  const message = Buffer.from(JSON.stringify(data));
  channel.sendToQueue("TransactionCreated", message);
  console.log("Event TransactionCreated published:", data);
}

/**
 * Publica evento de transação aprovada.
 * @param {Object} data - Dados da transação aprovada.
 *   { transactionId, itemId, approvedBy }
 */
async function onTransactionApproved(data) {
  if (!channel) {
    throw new Error("TransactionPublisher not initialized");
  }

  await channel.assertQueue("TransactionUpdated"); // garante que a fila existe
  const message = Buffer.from(JSON.stringify(data));

  channel.sendToQueue("TransactionUpdated", message);
  console.log("Event TransactionApproved published:", data);
}

/**
 * Publica evento de transação rejeitada.
 * @param {Object} data - Dados da transação rejeitada.
 *   { transactionId, itemId, rejectedBy }
 */
async function onTransactionRejected(data) {
  if (!channel) {
    throw new Error("TransactionPublisher not initialized");
  }

  await channel.assertQueue("TransactionRejected"); // fila específica para rejeição
  const message = Buffer.from(JSON.stringify(data));

  channel.sendToQueue("TransactionRejected", message);
  console.log("Event TransactionRejected published:", data);
}

/**
 * Publica evento de transação completada.
 * @param {Object} data - Dados da transação completada.
 *   { transactionId, itemId, completedBy }
 */
async function onTransactionCompleted(data) {
  if (!channel) {
    throw new Error("TransactionPublisher not initialized");
  }

  await channel.assertQueue("TransactionCompleted"); // fila específica para conclusão
  const message = Buffer.from(JSON.stringify(data));

  channel.sendToQueue("TransactionCompleted", message);
  console.log("Event TransactionCompleted published:", data);
}

//borrow

/**
 * Inicializa o publisher de borrowings.
 * @param {*} ch - canal do RabbitMQ
 */
async function initBorrowPublisher(ch) {
  borrowChannel = ch;

  // Criação das filas se ainda não existirem
  await borrowChannel.assertQueue("BorrowCreated");
  await borrowChannel.assertQueue("BorrowUpdated");
  await borrowChannel.assertQueue("BorrowRejected");
  await borrowChannel.assertQueue("BorrowCompleted");

  console.log("BorrowPublisher initialized with queues.");
}

async function onBorrowCreated(data) {
  if (!borrowChannel) {
    throw new Error("BorrowPublisher not initialized");
  }
  await borrowChannel.assertQueue("BorrowCreated"); // garante que a fila existe
  const message = Buffer.from(JSON.stringify(data));
  borrowChannel.sendToQueue("BorrowCreated", message);
  console.log("Event BorrowCreated published:", data);
}

module.exports = {
  initTransactionPublisher,
  onTransactionCreated,
  onTransactionApproved,
  onTransactionRejected,
  onTransactionCompleted,

  initBorrowPublisher,
  onBorrowCreated,
};
