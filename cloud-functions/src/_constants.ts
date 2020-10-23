// Product Constants
//
export const API_URL = "https://563xc890w6.execute-api.us-west-2.amazonaws.com/prod";

// Brand Constants
//
export const BASE_PRODUCT_URL = "https://public.aepdemo.net/";
export const BRAND_ID = 2;
export const BRAND_NAME = 'Luma Retail'

// Additional AEP Constants
//
// Note: these should all be accessible via the same IMS Org / Client ID / private key
//       settings as provided in the 1st tab of the Stackchat AEP integration configured
//       in Stackchat Studio.
export const CUSTOM_EVENT_SCHEMA_ID = 'XXXX';   // For "product viewed" and "user identified" events
export const CUSTOM_EVENT_SCHEMA_VERSION = '1';
export const CUSTOM_EVENT_DATASET_ID = 'XXXX';
export const CUSTOM_EVENT_ORCHESTRATION_EVENT_ID = 'XXXX';