import Stackchat from "@stackchat/web-messenger"
import { addCustomStyles } from "./customStyles"

const store = require("store") as StoreJsAPI

let email:string
let firstName:string

export const finishSetup = () => {
  hydrate()
  setEventDelegates()
  displayProactiveMessage()
  addCustomStyles()
}

const setEventDelegates = (): void => {
  Stackchat.setDelegate({
    // Attach user information to message metadata so that the
    // chatbot doesn't have to ask for info we already know. See more:
    // https://docs.stackchat.com/Cloud-Functions/Reference-and-Examples/Filtering-and-Transforming-Messages-with-Metadata.html
    beforeSend(message) {
      message.metadata = getUserPayload()
      return message;
    },
    // Open product carousel links in the parent window
    // instead of the web messenger iFrame window.
    beforeWebviewDisplay: (url: string) => {
      if (url.indexOf("aepdemo.net") > -1) {
        window.location.href = url
        return false
      }
      return true
    }
  });
}

// Pull user information from local storage.
const hydrate = () => {
  email = store.get("email")
  firstName = store.get("firstname")
}

function getUserPayload() {
  // These payload keys need to match the Slot names you created.
  return {
    Email: email,
    FirstName: firstName,
  }
}

export const onProactiveDismissed = () => {
  store.set("stackchat.proactive.dismissed", new Date().getTime())
}

/**
 * Display a proactive message if this is a new user and they
 * dismissed the message prior to the cooldown time having elapsed.
 */
const displayProactiveMessage = () => {
  if (cooldownHasElapsed() && !Stackchat.hasConversationStarted()) {
    const DEFAULT_CTA = {
      text: `Psst${ firstName ? `, ${firstName}` : "" }! 🤫 Looking for some great Luma deals?`,
      quickReplies: [
        {
          text: "Let's go! 🚀",
          openMessengerOnReply: true
        }
      ]
    }
    Stackchat.addProactiveMessage(DEFAULT_CTA)
  }
}

const cooldownHasElapsed = () => {
  const proactiveDismissedTimestamp = store.get("stackchat.proactive.dismissed")
  if (!proactiveDismissedTimestamp) {
    return true
  }
  const cooldownDuration = 1 * 60 * 1000 // 1 minute in milliseconds
  return (new Date().getTime() - cooldownDuration) > proactiveDismissedTimestamp
}
