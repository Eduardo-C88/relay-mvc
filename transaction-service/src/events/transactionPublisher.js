let channel;

async function initTransactionPublisher(ch) {
  channel = ch;
  await channel.assertQueue("TransactionCreated");
  await channel.assertQueue("TransactionUpdated");
}




module.exports = { initTransactionPublisher };
