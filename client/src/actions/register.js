import {dataFetch} from "@/lib/utils"

export const register=async(values)=> {
  const res = await dataFetch("/auth/register", values)
console.log(res)
}

