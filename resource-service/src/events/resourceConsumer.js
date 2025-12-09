const UserProfileService = require("../services/userProfileService");
const resourceService = require("../services/resourcesService");
const { prisma } = require("../models/prismaClient");

const userProfileService = new UserProfileService(prisma);

async function startUserUpdatedConsumer(channel) {
  await channel.assertQueue("UserUpdated");
  
  channel.consume("UserUpdated", async (msg) => {
    const userUpdate = JSON.parse(msg.content.toString());
    await userProfileService.updateUserInfo(userUpdate);
    channel.ack(msg);
  });
}

async function startUserCreatedConsumer(channel) {
  await channel.assertQueue("UserCreated");

  channel.consume("UserCreated", async (msg) => {
    const user = JSON.parse(msg.content.toString());
    await userProfileService.createOrUpdateUserProfile(user);
    channel.ack(msg);
  });
}

async function startPurchaseRequestConsumer(channel) {
  await channel.assertQueue("PurchaseRequestCreated");
  channel.consume("PurchaseRequestCreated", async (msg) => {
    const purchaseRequest = JSON.parse(msg.content.toString());
    await resourceService.changeResourceStatus(
      purchaseRequest.resourceId,
      purchaseRequest.statusId
    );
    channel.ack(msg);
  });
}
  
module.exports = { startUserUpdatedConsumer, startUserCreatedConsumer, startPurchaseRequestConsumer };