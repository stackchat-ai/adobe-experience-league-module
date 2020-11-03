import * as dc from "@stackchat/dynamic-content-toolkit";

///////////////////////////////////////////
// Utilities
///////////////////////////////////////////

export function setSlot(slots: dc.MapOfSlotToSlotValue): dc.ActionSequence {
  const setSlot = new dc.SetSlotsAction();
  setSlot.slots = slots;
  const as = new dc.ActionSequence();
  as.actions = [setSlot];
  return as;
}

export function clearSlots(slots: string[]): dc.ActionSequence {
  const clearSlots = new dc.ClearSlotsAction()
  clearSlots.slotNames = slots
  const as = new dc.ActionSequence();
  as.actions = [clearSlots];
  return as;
}

export function soloMessage(text: string): dc.MessageThread[] {
  const messageThread = new dc.MessageThread();
  const tm = new dc.TextMessage();
  tm.text = text;
  messageThread.messages.push(tm);
  return [messageThread];
}

export function carouselWithCards(cards: dc.MessageCard[], additionalData?: any): dc.DynamicFlowElement[] {
  const messageThread = new dc.MessageThread();
  const carousel = new dc.CarouselMessage();
  carousel.items.push(...cards);
  carousel.additionalData = additionalData;
  messageThread.messages.push(carousel);
  return [messageThread];
}

export function messageCard(
  title: string,
  imageUrl: string,
  description: string,
  buttons: dc.Button[]
): dc.MessageCard {
  const card = new dc.MessageCard();
  card.type = "hero";
  card.title = title;
  card.imageUrl = imageUrl;
  card.description = description;
  card.buttons = buttons;

  return card;
}

export function getChannelIdentifier(userData: Record<string, any>): string {
  const lastChannel = userData?.metaData?.lastChannel;
  switch (lastChannel) {
    case 'wechat':       return 'wechat';
    case 'fb-messenger': return 'fb-messenger';
    case 'sc-messenger':
    default:             return 'web-chat';
  }
}

export function reverseTimeSort(a: any, b: any): number {
  // reverse sort based on timestamp since orderBy param doesn't seem to work as expected
  return a.timestamp < b.timestamp
    ? 1
    : a.timestamp > b.timestamp
      ? -1
      : 0
    ;
}

export function noUnderscoreTenantId(tenantId: string): string {
  return tenantId.startsWith('_')
    ? tenantId.substring(1)
    : tenantId
    ;
}

export function underscoreTenantId(tenantId: string): string {
  return tenantId.startsWith('_')
    ? tenantId
    : "_" + tenantId
    ;
}
