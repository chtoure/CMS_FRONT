import type { IFieldDefinition } from "./field";

interface ContentType {
    id: number,
    name: string,
    slug: string,
    description: string | null,
    fields_schema: IFieldDefinition[],
    createdAt: Date;
    updatedAt: Date;
    archive: boolean;
    archivedAt: Date | null;
}


export type {
  ContentType
}
