import { initialiseMessenger } from "./messenger";
import { requestBrand } from "./luma-api/fetch-brand";

const store = require("store") as StoreJsAPI
const brandId = store.get("brandId") || "2"

requestBrand(brandId).then(
  (brand) => {
    console.log(`Stackchat has successfully loaded brand config for ${brand.brandName}`)
    initialiseMessenger(brand)
  },
  (e) => {
    console.error(`Stackchat failed to load brand ${e.toString()}`)
    initialiseMessenger(null)
  })
