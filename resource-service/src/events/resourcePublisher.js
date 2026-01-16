const { initPublisher, publishEvent } = require("../messaging/publisher");
const EVENTS = require("../messaging/events");

async function initResourceMessaging() {
  await initPublisher([
    EVENTS.RESOURCE_RESERVED,  
    EVENTS.RESOURCE_RESERVATION_FAILED,
  ]);
}

function publishResourceReserved(data) {
  publishEvent(EVENTS.RESOURCE_RESERVED, "ResourceReserved", data);
}

function publishResourceReservationFailed(data) {
  publishEvent(EVENTS.RESOURCE_RESERVATION_FAILED, "ResourceReservationFailed", data);
}

module.exports = {
  initResourceMessaging,
  publishResourceReserved,
  publishResourceReservationFailed,
};