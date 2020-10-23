import "source-map-support/register"
import Stackchat, { MessengerEventType, ProactiveMessageEventType } from "@stackchat/web-messenger"
import { messengerConfig } from "./config"
import { finishSetup, onProactiveDismissed } from "./helpers"
import { BrandConfig } from "../luma-api/fetch-brand"

// Listen for the web messenger finishing initialization
Stackchat.on(MessengerEventType.StackchatReadyEvent, onReady)

// Display an activity indicator animation when the user sends a message
Stackchat.on(MessengerEventType.StackchatMessageSentEvent, () => Stackchat.showActivityIndicator("https://assets.cmp.au.stackchat.com/public/odzafqqww61t2n/luma3.png"))

function onReady() {
  finishSetup()

  // Proactive event listeners need to be added after init
  Stackchat.on(ProactiveMessageEventType.Clear, onProactiveDismissed)
  Stackchat.on(ProactiveMessageEventType.Dismissed, onProactiveDismissed)
}

// Update our web messenger config to include dynamic Luma brand information
export function initialiseMessenger(brand: BrandConfig | null) {
  if (brand !== null) {
    messengerConfig.businessName = `${brand.brandName} Chatbot`
    messengerConfig.customText = {
      headerText: `${brand.brandName} Chat`,
      introductionText: `I'm Luma Bot! 🤖 Your go-to guide for all things ${brand.brandName}.`
    }
  }
  Stackchat.init(messengerConfig)
}
