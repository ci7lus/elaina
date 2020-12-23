import type { AxiosInstance } from "axios"
import axios from "redaxios"
import { chinachuUrl, chinachuAuthUser, chinachuAuthPass } from "../config"
import type { Channel } from "../types/struct"

const client = axios.create({
  baseURL: chinachuUrl,
  headers: {
    ...(chinachuAuthUser && chinachuAuthPass
      ? {
          Authorization: `Basic ${btoa(
            `${chinachuAuthUser}:${chinachuAuthPass}`
          )}`,
        }
      : {}),
  },
}) as AxiosInstance

export const ChinachuAPI = {
  getSchedule: async () => {
    const body = await client.get<Channel[]>("/api/schedule.json")
    return body.data
  },
}
