import type { Role } from "./role";


export interface Permission {
  id: number,
  name : string,
  description : string | null,
  roles : Role []
}
