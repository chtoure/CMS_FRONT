import type { Permission } from "./permission"
import type { UserProfile } from "./user"


export interface Role {
  id: number,
  name : string,
  description : string | null,
  users: UserProfile[],
  permissions: Permission [],
  archive: boolean;
}



export interface RoleUpdate{
  name? : string,
  description? : string,
  permissionIds? : number[]
}


export interface AddRole{
  name : string,
  description? : string,
  permissionIds? : number[]
}

export interface roleFilter {
  archive: string,
  page?: number,
  limit?: number
}
