import type { Media } from "./media";

interface Parameter {
  id: number;
  entity_name: string;
  title: string;
  media: Media | null;
  description?: string | null;

}

interface UpdateParameterPayload {
  entity_name: string;
  title: string;
  mediaId: number;
  description?: string;
}

export type {
  Parameter,
  UpdateParameterPayload
}
