import type { Role } from "./role";


export interface Permission {
  id: number,
  name : string,
  description : string | null,
  roles : Role []
  archive: boolean;
}

export interface permsFilter {
  archive: string,
  page?: number,
  limit?: number,
  search?: string
}
