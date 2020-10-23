import * as dc from "@stackchat/dynamic-content-toolkit";
import { setSlot } from "./util";

// Populate our slots with values passed from the Web Messenger, if they're present.
export async function extractMetadaAndPopulateSlots(
  userData: Record<string, any>,
  extra: Record<string, any>
): Promise<dc.DynamicFlowElement[]> {
  if(extra?.additionalData) {
    return [setSlot(extra.additionalData)];
  } else {
    return []
  }
}

// Populate our slots with value passed from the Web Messenger as a direct invocation.
export async function populateSlots(
  userData: Record<string, any>,
  extra: Record<string, any>
): Promise<dc.DynamicFlowElement[]> {

  if (!extra?.postBackPayload) {
    console.error('Missing postback payload');
  }

  let payload;
  if (!!extra && typeof extra.postBackPayload === 'string' && extra.postBackPayload.startsWith('%7B')) {
    payload = JSON.parse(decodeURIComponent(extra.postBackPayload));
  } else {
    payload = extra.postBackPayload;
  }
  // console.log(`payload is now JSON: ${JSON.stringify(payload)}`)
  return [setSlot(payload)];
}
