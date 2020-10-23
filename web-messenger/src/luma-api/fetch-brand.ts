const API_URL = "https://563xc890w6.execute-api.us-west-2.amazonaws.com/prod"

export async function requestBrand(brandId: string): Promise<BrandConfig | null> {
  const bodyJsonString = JSON.stringify({
    action: "getBrand",
    brandId: `${brandId}`,
  });
  const requestOptions = {
    method: "POST",
    body: bodyJsonString,
  };
  const response = await fetch(API_URL, requestOptions);
  if (response.ok) {
    const configs = await response.json();
    console.info(
      `Successfully received config for brandId ${brandId}}`
    );
    return configs[0];
  } else {
    console.error(`Error fetching products: ${response.statusText}`);
    return null;
  }
}

export interface BrandImage {
  __type: string;
  name: string;
  url: string;
}

export interface BrandConfig {
  brandName: string;
  createdAt: Date;
  updatedAt: Date;
  brandLogo: BrandImage;
  brandHeroImage: BrandImage;
  brandId: string;
  ldap: string;
  active: string;
  canbeedited: string;
  usePlatform: boolean;
  useAAM: boolean;
  useAA: boolean;
  useAT: boolean;
  useACS: boolean;
  useMKT: boolean;
  usePersonalShopper: string;
  useCustomProfileAttributes: string;
  currency: string;
  useCallCenter: string;
  industry: string;
  brandColor: string;
  heroImageCTAUrl: string;
  alexaBrandName: string;
  demoType: string;
  heroImageCTA: string;
  brandFavIcon: BrandImage;
  numberProducts: number;
  numberProductCategories: number;
  numberCustomPages: number;
  useCTA: boolean;
  ctaBoxPosition: string;
  textColor: string;
  usePega: boolean;
  usePOS: string;
  useInStoreDisplay: string;
  useLaunch: boolean;
  useGoogle: boolean;
  objectId: string;
}
