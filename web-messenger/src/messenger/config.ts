import { StackchatInitOptions } from "@stackchat/web-messenger";

export const messengerConfig: StackchatInitOptions = {
  appId: null, // Replace this null value with your Luma bot's App Id! e.g "k9s9xxxxxx"
  soundNotificationEnabled: false,
  fixedIntroPane: false,
  businessName: "Brand failed to load", // This will be dynamically populated based on the brand API response
  voice: {
    locale: "en-AU"
  },
  proactiveMessaging: {
    author: "Luma Bot",
    maxMessages: 4,
    ttl: 240 * 1000
  }
}

// Display an error if a silly goose forgets to update the appId property above.
if (messengerConfig.appId === null) {
  alert("You forgot to configure your chatbot's App Id in the config.ts file!")
}
