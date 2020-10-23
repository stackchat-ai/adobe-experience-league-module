/**
 * Ambient globals matching the Stackchat Cloud Function runtime
 */
import * as _dc from '@stackchat/dynamic-content-toolkit';
import * as _fetch from 'node-fetch';
import * as _url from 'url';

declare global {
  export const dc: typeof _dc;
  export const fetch: typeof _fetch.default;
  export const url: typeof _url;
}

// type DCElement = import('@stackchat/dynamic-content-toolkit').DynamicFlowElement;
// type PostbackButton = import('@stackchat/dynamic-content-toolkit').PostbackButton;
// type LinkButton = import('@stackchat/dynamic-content-toolkit').LinkButton;
// type MessageThread = import('@stackchat/dynamic-content-toolkit').MessageThread;
// type CarouselMessage = import('@stackchat/dynamic-content-toolkit').CarouselMessage;
// type Button = import('@stackchat/dynamic-content-toolkit').Button;
// type MessageCard = import('@stackchat/dynamic-content-toolkit').MessageCard;

// type CloudFunctionHandler = (
//   userData: Record<string, any>,
//   extra: Record<string, any>
// ) => Promise<void | DCElement | DCElement[]>;