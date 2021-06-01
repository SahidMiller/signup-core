import { IPFS_GATEWAY_HOST, SIGNUP_WALLET_ENTRY_HOST } from '../config'

const RESOLVE_IPNS_API_URL = "/api/v0/name/resolve"

export default async function resolveLatestIpns(address, nocache) {
  if (process.env.NODE_ENV === "development") {
    return SIGNUP_WALLET_ENTRY_HOST
  }

  const response = await fetch(IPFS_GATEWAY_HOST + RESOLVE_IPNS_API_URL + `?arg=${address}${!!nocache ? '&nocache=true' : ''}`)
  const { Path } = await response.json()
  
  return path && IPFS_GATEWAY_HOST + Path
}