import axios, { AxiosAdapter } from "axios";
import { ThirdPartyAPIEntryProps } from "../../common/hooks/useThirdPartyAPIEndpoints";
import { getLogger } from "./../../utils/logger";
import { cacheAdapterEnhancer } from "axios-extensions";

const { trace } = getLogger("service:addressresolver");

export const resolveAddressNameByEndpoint = async (url: string) => {
  // Default TTL is 5 Mins to change timeout check https://github.com/kuitos/axios-extensions#cacheadapterenhancer
  const client = axios.create({
    headers: { "Cache-Control": "no-cache" },
    adapter: cacheAdapterEnhancer(axios.defaults.adapter as AxiosAdapter), // Typecast suggested by author to force non-null typing: https://github.com/kuitos/axios-extensions/issues/8
  });
  try {
    const response = await client.get(url);
    return response.data?.identity?.name;
  } catch (e) {
    trace(`Resolve Address Status: ${e}`);
    return undefined;
  }
};

export const getIdentityName = async (addresses: ThirdPartyAPIEntryProps[], address: string) => {
  const identityName = await addresses.reduce(async (accumulator, currentValue) => {
    if (await accumulator) return accumulator;
    const result = await resolveAddressNameByEndpoint(currentValue.endpoint + address);
    return result;
  }, Promise.resolve(undefined));

  return identityName;
};
