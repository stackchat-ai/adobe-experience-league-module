import * as dc from "@stackchat/dynamic-content-toolkit";
import { API_URL, BASE_PRODUCT_URL, BRAND_ID } from "./_constants";
import { carouselWithCards, getChannelIdentifier, messageCard, soloMessage } from "./util";

interface Product {
  name: string;
  finalPrice: number;
  image1: ProductImage;
  image2: ProductImage;
  description: string;
  category: string;
  isFeatured: boolean;
  productNumber: string;
  brandId: string;
  productUrl: string;
  SKU: string;
}

interface ProductImage {
  __type: string;
  name: string;
  url: string;
}

///////////////////////////////////////////
// Product Fetch and Display
///////////////////////////////////////////

export async function getProducts(
  userData: Record<string, any>
): Promise<dc.DynamicFlowElement[]> {
  const cid = getChannelIdentifier(userData);

  const products = await fetchProducts();
  if (products.length > 0) {
    const cards = products.slice(0, 10).map((result: Product) => {
      const linkButton = new dc.LinkButton();
      linkButton.text = "View Details";
      linkButton.uri = BASE_PRODUCT_URL + result.productUrl + `?cid=${ cid }`;

      const postbackButton = new dc.PostbackButton();
      postbackButton.text = "♥️";
      postbackButton.payload = {
        handler: "notifyAEPOfProductView",
        data: {
          name: result.name,
          imageUrl: result.image1.url,
          price: result.finalPrice,
          sku: result.SKU,
          pageUrl: BASE_PRODUCT_URL + result.productUrl
        }
      };

      let imageUrl = "https://via.placeholder.com/863x723?text=Missing+Image";

      if (result.image1 || result.image2) {
        imageUrl = result.image2 ? result.image2.url : result.image1.url;
      }

      return messageCard(result.name,
        imageUrl,
        result.description,
        [linkButton, postbackButton]);
    });
    return carouselWithCards(cards, {});
  } else {
    return soloMessage("Error fetching products");
  }
}

async function fetchProducts(): Promise<Product[]> {
  const bodyJsonString = JSON.stringify({
    "environment": "Experience Platform International",
    "action": "getProducts",
    "brandId": `${ BRAND_ID }`
  });
  const requestOptions = {
    method: 'POST',
    body: bodyJsonString,
  };
  const response = await fetch(API_URL, requestOptions);
  if (response.ok) {
    const products = await response.json();
    console.info(`Successfully received products for brandId ${ BRAND_ID } \n\n ${ JSON.stringify(products) }`);
    return products;
  } else {
    console.error(`Error fetching products: ${ response.statusText }`);
    return [];
  }
}
