import type { UserProfile } from "./user"


export interface Role {
  id: number,
  name : string,
  description : string | null
  users: UserProfile[]
}

