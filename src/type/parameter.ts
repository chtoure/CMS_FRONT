interface Parameter {
  id: number;
  entity_name: string;
  title: string;
  logo: string;
  description?: string | null;

}

interface UpdateParameterPayload {
  entity_name: string;
  title: string;
  logo: string;
  description?: string;
}

export type {
  Parameter,
  UpdateParameterPayload
}
