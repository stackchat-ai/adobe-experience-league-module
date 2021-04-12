import * as dc from "@stackchat/dynamic-content-toolkit";
import { carouselWithCards, clearSlots, getChannelIdentifier, messageCard, noUnderscoreTenantId, reverseTimeSort, setSlot, soloMessage, underscoreTenantId } from "./util";
import { BRAND_ID, BRAND_NAME, CUSTOM_EVENT_DATASET_ID, CUSTOM_EVENT_ORCHESTRATION_EVENT_ID, CUSTOM_EVENT_SCHEMA_ID, CUSTOM_EVENT_SCHEMA_VERSION } from "./_constants";


///////////////////////////////////////////
// AEP Interactions
///////////////////////////////////////////

export function debugConfig(
  userData: Record<string, any>,
  extra: Record<string, any>
): dc.DynamicFlowElement[] {
  let aepConfig: AepNativeIntegrationCtx;
  try {
    aepConfig = loadAepConfigFromExtraParam(extra);
  } catch (err) {
    const errMsg = `Problem loading AEP config: ${ err.message }`;
    console.error(errMsg);
    return soloMessage(errMsg);
  }

  return soloMessage(`
  Email: ${ userData.slotData.Email }
  IMS Org Id: ${ aepConfig.orgId }
  Tenant Id: ${ aepConfig.tenantId }
  Dataset Id: ${ CUSTOM_EVENT_DATASET_ID }
  Schema Ref: ${ CUSTOM_EVENT_SCHEMA_ID }
  Inlet: ${ aepConfig.streamingConnectionEndpoint }
  Random Id suffix: ${ userData.slotData.randomSuffix }
  Brand: ${ BRAND_NAME }
  Brand Id: ${ BRAND_ID }
  ECID: ${ userData.metaData.analyticsId?.adobeAnalytics?.experienceCloudVisitorId }
  `);
}

export async function notifyAEPOfUserIdentified(
  userData: Record<string, any>,
  extra: Record<string, any>
): Promise<void> {
  let aepConfig: AepNativeIntegrationCtx;
  try {
    aepConfig = loadAepConfigFromExtraParam(extra);
  } catch (err) {
    console.error('Problem loading AEP configuration: ', err);
    return;
  }

  const userEmail = userData.slotData.Email;
  const ecid = extra.additionalData?.analyticsId?.adobeAnalytics?.experienceCloudVisitorId;

  // Optional debug logging
  console.info(`userdata: ${ JSON.stringify(userData) }`);
  console.info(`extra.additionalData: ${ JSON.stringify(extra.additionalData) }`);

  const userIdentifiedEntity = generateUserIdentifiedEntity(
    `${ userData.metaData.userId }-${ userData.slotData.randomSuffix || '' }`,
    userEmail,
    ecid,
    aepConfig
  );

  await postExperienceEvent(aepConfig, userIdentifiedEntity);
  return;
}

export async function notifyAEPOfProductView(
  userData: Record<string, any>,
  extra: Record<string, any>
): Promise<dc.DynamicFlowElement[]> {
  let aepConfig: AepNativeIntegrationCtx;
  try {
    aepConfig = loadAepConfigFromExtraParam(extra);
  } catch (err) {
    console.error('Problem loading AEP configuration: ', err);
    return [];
  }

  if (!extra?.postBackPayload) {
    console.error('Missing postback payload');
    return soloMessage('Error registering product interest');
  }

  const product = extra.postBackPayload as Product;
  const userEmail = userData.slotData.Email;
  const userName = userData.slotData.FirstName || userData.metaData.givenName || 'unidentified user';
  const ecid = extra.additionalData?.analyticsId?.adobeAnalytics?.experienceCloudVisitorId;

  // Optional debug logging
  console.info(`userdata: ${ JSON.stringify(userData) }`);
  console.info(`extra.additionalData: ${ JSON.stringify(extra.additionalData) }`);

  const productViewEntity = generateProductViewEntity({
    userId: `${ userData.metaData.userId }-${ userData.slotData.randomSuffix || '' }`,
    userEmail: userEmail,
    userName: userName,
    ecid: ecid,
    product: product,
    aepConfig: aepConfig,
    cid: getChannelIdentifier(userData)
  });

  await postExperienceEvent(aepConfig, productViewEntity);
  return soloMessage(`Thank you for registering your interest in ${ product.name }`);
}

export async function getRecentlyViewedProducts(
  userData: Record<string, any>,
  extra: Record<string, any>
): Promise<dc.DynamicFlowElement[]> {
  const userEmail = userData.slotData.Email;

  let aepConfig: AepNativeIntegrationCtx;
  try {
    aepConfig = loadAepConfigFromExtraParam(extra);
  } catch (err) {
    console.error('Problem loading AEP configuration: ', err);
    return [];
  }

  let experienceEvents: any[];
  try {
    experienceEvents = await getExperienceEventsForUser(
      aepConfig,
      `${ userData.metaData.userId }-${ userData.slotData.randomSuffix || '' }`
    );
  } catch (err) {
    console.error(`Problem retrieving experience events: `, err);
    return soloMessage(
      `I'm sorry, I ran into some trouble checking for your recently viewed products.`
    );
  }
  const viewedProducts = experienceEvents.filter((e: any) => {
    return e.entity?.[underscoreTenantId(aepConfig.tenantId)]?.productData?.productInteraction === "productView"
  })
    .sort(reverseTimeSort)
    .map((e: any) => {
      const result = e.entity.productListItems[0] as ProductListItem;
      const postbackButton = new dc.PostbackButton();
      postbackButton.text = "?";
      postbackButton.payload = {
        handler: "notifyAEPOfProductView",
        data: {
          name: result.name,
          imageUrl: result.product,
          price: result.priceTotal,
          sku: result.SKU,
          pageUrl: 'unavailable'
        }
      };

      return messageCard(result.name,
        result.product,
        "-",
        [postbackButton]);
    })
    .slice(0, 3);

  if (viewedProducts.length > 0) {
    const viewedProductsString = JSON.stringify(viewedProducts, undefined, 2);
    console.info(`Successfully populated the viewed_products slot for user ${ userEmail } with ${ viewedProductsString }`);
    const content = carouselWithCards(viewedProducts, {});
    content.push(setSlot({
      viewed_products: viewedProductsString
    }));
    return content;
  } else {
    console.info(`User ${ userEmail } hasn't viewed any products yet.`);
    return [clearSlots(["viewed_products"])];
  }
}

//////////////////////////////////////////////////////////////////////////
///// AEP Entity and Request Helpers   ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////

function generateProductViewEntity(input: {
  userId: string;
  userEmail: string;
  userName: string;
  ecid: string;
  product: Product;
  aepConfig: AepNativeIntegrationCtx;
  cid: string;
}): FullProductViewXdmEntity {
  const { userId, userEmail, ecid, product, aepConfig, cid } = input;
  const entity: Record<string, any> = {
    _id: `${ Date.now() }.${ Math.floor(Math.random() * 1e5) }`,
    timestamp: toAEPDateString(new Date()),
    eventType: "commerce.productViews",
    commerce: {
      productViews: {
        value: 1,
      },
    },
    _experience: {
      campaign: {
        orchestration: {
          eventID: CUSTOM_EVENT_ORCHESTRATION_EVENT_ID,
        },
      },
    },
    productListItems: [
      {
        SKU: product.sku,
        priceTotal: product.price,
        quantity: 1,
        name: product.name,
        product: product.imageUrl,
        productAddMethod: cid,
      },
    ],
  };
  entity["productListItems"][0][underscoreTenantId(aepConfig.tenantId)] = {
    core: {
      productURL: product.pageUrl,
      imageURL: product.imageUrl,
    },
  };
  entity[underscoreTenantId(aepConfig.tenantId)] = {
    demoEnvironment: {
      tms: "Launch",
      brandName: BRAND_NAME,
    },
    identification: {
      core: {
        stackchatId: userId,
      },
    },
  };
  if (userEmail) {
    entity[
      underscoreTenantId(aepConfig.tenantId)
    ].identification.core.email = userEmail;
  }
  if (ecid) {
    entity[underscoreTenantId(aepConfig.tenantId)].identification.core.ecid = ecid;
  }
  return entity as FullProductViewXdmEntity;
}

function generateUserIdentifiedEntity(
  userId: string,
  userEmail: string,
  ecid: string,
  aepConfig: AepNativeIntegrationCtx
): UserIdentifiedXdmEntity {
  const entity: Record<string, any> = {
    _id: `${ Date.now() }.${ Math.floor(Math.random() * 1e5) }`,
    timestamp: toAEPDateString(new Date()),
  };
  entity[underscoreTenantId(aepConfig.tenantId)] = {
    demoEnvironment: {
      tms: "Launch",
      brandName: BRAND_NAME,
    },
    identification: {
      core: {
        stackchatId: userId,
      }
    },
  };
  if (userEmail) {
    entity[
      underscoreTenantId(aepConfig.tenantId)
    ].identification.core.email = userEmail;
  }
  if (ecid) {
    entity[underscoreTenantId(aepConfig.tenantId)].identification.core.ecid = ecid;
  }
  return entity as UserIdentifiedXdmEntity;
}

async function getExperienceEventsForUser(
  aepConfig: AepNativeIntegrationCtx,
  stackchatId: string
): Promise<unknown[]> {
  // TODO: could re-parameterize this so caller can decide between 'ecid' and 'email'
  const idNamespace = 'stackchat';
  const baseUrl = 'https://platform.adobe.io/data/core/ups/access/entities';
  const params = new url.URLSearchParams({
    'schema.name': '_xdm.context.experienceevent',
    'relatedSchema.name': '_xdm.context.profile',
    'relatedEntityId': stackchatId,
    'relatedEntityIdNS': idNamespace
  });
  const fullUrl = `${ baseUrl }?${ params }`;
  console.info(`getExperienceEventsForUser(): Requesting data from: ${ fullUrl }`);
  const response = await fetch(fullUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${ aepConfig.accessToken }`,
      'x-api-key': aepConfig.clientId,
      'x-gw-ims-org-id': aepConfig.orgId,
      'x-sandbox-name': aepConfig.sandboxId
    }
  });
  console.info(
    `getExperienceEventsForUser(): Response status: ${ response.status }`
  );
  if (response.status === 404) {
    return [];
  } else if (!response.ok) {
    console.error(
      `getExperienceEventsForUser(): Received non-200 response: `
      + `${ response.status }: '${ response.statusText }'`
    );
    throw new Error('Unexpected AEP response');
  }

  const results = await response.json();
  return Array.isArray(results.children)
    ? results.children
    : []
    ;
}

async function postExperienceEvent(
  aepConfig: AepNativeIntegrationCtx,
  data: XdmEntity
): Promise<void> {
  const postBody = JSON.stringify(generatePostBodyForXdmEntity(aepConfig, data));
  console.info(`Posting event to AEP: ${ postBody }`);
  try {
    const response = await fetch(aepConfig.streamingConnectionEndpoint, {
      method: 'POST',
      headers: {
        // 'Accept': 'application/json',
        // 'Authorization': `Bearer ${ accessToken }`,
        'Content-Type': 'application/json',
        // 'x-api-key': ctx.clientId,
        // 'x-gw-ims-org-id': ctx.orgId,
        // 'x-sandbox-name': ctx.sandboxName
      },
      body: postBody
    });
    console.info(`AEP data POST response status: ${ response.status }`);
    if (!response.ok) {
      console.error(
        `Received non-2XX response from AEP data POST: `
        + `${ response.status }: '${ response.statusText }'`
      );
      throw new Error('Unexpected AEP data POST response');
    }
  } catch (err) {
    console.error('Problem POSTing data to AEP: ', err);
    throw err;
  }
}

function generatePostBodyForXdmEntity(
  aepConfig: AepNativeIntegrationCtx,
  data: XdmEntity
): Record<string, any> {
  const schemaTenantId = noUnderscoreTenantId(aepConfig.tenantId);
  return {
    header: {
      schemaRef: {
        id: `https://ns.adobe.com/${ schemaTenantId }/schemas/${ CUSTOM_EVENT_SCHEMA_ID }`,
        contentType: `application/vnd.adobe.xed-full+json;version=${ CUSTOM_EVENT_SCHEMA_VERSION }`
      },
      imsOrgId: aepConfig.orgId,
      source: {
        name: "Stackchat"
      },
      datasetId: CUSTOM_EVENT_DATASET_ID
    },
    body: {
      xdmMeta: {
        schemaRef: {
          id: `https://ns.adobe.com/${ schemaTenantId }/schemas/${ CUSTOM_EVENT_SCHEMA_ID }`,
          contentType: `application/vnd.adobe.xed-full+json;version=${ CUSTOM_EVENT_SCHEMA_VERSION }`
        }
      },
      xdmEntity: data
    }
  };
}

function toAEPDateString(date: Date): string {
  // e.g. "2020-06-09T13:04:55.123Z"
  return date.toISOString();
}

/** Adapts the native AEP integration context into something a bit more ergonomic */
function loadAepConfigFromExtraParam(extra: Record<string, any>): AepNativeIntegrationCtx {
  const origCtx = extra?.additionalData?.aepCtx;
  if (!origCtx) {
    throw new Error('Missing or invalid AEP cloud function context');
  }
  return {
    accessToken: origCtx.accessToken,
    orgId: origCtx.orgId,
    clientId: origCtx.clientId,
    sandboxId: origCtx.sandboxName,
    tenantId: origCtx.tenantId,
    streamingConnectionEndpoint: `https://dcs.adobedc.net/collection/${ origCtx.streamingConnectionId }?synchronousValidation=true`
  };
}

///////////////////////////////////////////
// Interfaces
///////////////////////////////////////////

interface Product {
  name: string;     // "Proteus Fitness Jackshirt (Orange)",
  imageUrl: string; // "https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/7bb37821cae9587a969c713a34f92490_1.jpg",
  price: number;
  sku: string;
  pageUrl: string;
}

interface ProductListItem {
  SKU: string;
  name: string;
  priceTotal: number;
  product: string;
  productAddMethod: string;
  quantity: number;
}

interface AepNativeIntegrationCtx {
  accessToken: string;
  orgId: string;
  clientId: string;
  sandboxId: string;
  // datasetId: string;
  tenantId: string;
  // schemaId: string;
  streamingConnectionEndpoint: string;
}

interface ProductViewXdmEntity {
  _id: string;
  timestamp: string; // "2020-06-19T07:51:57Z",
  _experience: {
    campaign: {
      orchestration: {
        eventID: string; // '1942b21dc4a92a9dfa5c0d6ad7189c036a64f7e04fbb5865c6f65fa63a3aaa21';
      };
    };
  },
  web?: {
    webPageDetails: {
      name: string; // "Facebook Messenger"
    };
  },
  commerce?: {
    productViews: {
      value: number;
    };
  },
  environment?: {
    browserDetails: {
      userAgent: string; // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36",
      acceptLanguage: string; // "en"
    };
  },
  productListItems: {
    SKU: string; // 'LLMJ12.1-S',
    priceTotal: number; // 45,
    quantity: number; // 1,
    name: string; // 'Proteus Fitness Jackshirt (Orange)',
    product: string; // 'https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/7bb37821cae9587a969c713a34f92490_1.jpg',
    productAddMethod: string; // 'Desktop';
  }[];
}

interface EventPayloadWrapper {
  [key: string]: EventPayload;
}

type FullProductViewXdmEntity = ProductViewXdmEntity & EventPayloadWrapper;

interface EventPayload {
  brand: {
    tms: 'Launch',
    brandName: string;
  },
  chatbot?: {
    channel: string; // "fb-messenger" | "web-chat" | "wechat",
    socialMediaFirstName: string; // userName
  },
  productData?: {
    productPageUrl: string; // "https://stackchat.aepdemo.net/p5.html",
    productUrl: string; // 'https://parsefiles.back4app.com/hgJBdVOS2eff03JCn6qXXOxT5jJFzialLAHJixD9/7bb37821cae9587a969c713a34f92490_1.jpg',
    productName: string; // 'Proteus Fitness Jackshirt (Orange)',
    productInteraction: 'productView';
  },
  identification: {
    emailId: string;
    stackchatId: string;
    ecid?: string;
  };
}

interface UserIdentifiedXdmEntity {
  _id: string;
  timestamp: string; // "2020-06-19T07:51:57Z",
}

type XdmEntity = ProductViewXdmEntity | UserIdentifiedXdmEntity;
