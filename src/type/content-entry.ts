import type { ContentType } from './content-type';
import type { UserProfile } from './user';

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

interface IContentData {
  [key: string]: JsonValue;
}

enum EntryStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

interface ITaxonomy {
  id: number;
  name: string;
  slug: string;
  taxonomy_slug: string;
}


interface IContentEntry {
  id: number;
  contentTypeId: number;
  contentType?: ContentType;

  data_json: IContentData;

  status: EntryStatus;
  parentId: number | null;
  userId: number;
  user?: UserProfile;
  archive: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;

  taxonomies?: ITaxonomy[];
}


interface RegisterContentEntry {
    contentTypeId: number,
    status: EntryStatus,
    data_json: IContentData,
}


interface UpdateContentEntry {
    contentTypeId?: number,
    status?: EntryStatus,
    data_json?: IContentData;
}

interface ContentEntryFilter {
  status?: EntryStatus | null
  page?: number
  limit?: number
  search?: string
  sort?: string
  user_id?: number
  startDate?: string
  endDate?: string
}


interface contenusQueryFilters {
    mode?: 'query' | 'single';
    limit?: number | undefined;
    sortBy?: string | undefined;
    order?: 'asc' | 'desc' | undefined;
    taxonomyFilters?: {
      taxonomyId?: number | undefined;
      termIds?: number[] | undefined;
      operator?: 'AND' | 'OR' | undefined;
    } | undefined;
}


export {
  type JsonValue,
  type IContentData,
  EntryStatus,
  type ITaxonomy,
  type ContentType,
  type IContentEntry,
  type RegisterContentEntry,
  type UpdateContentEntry,
  type ContentEntryFilter,
  type contenusQueryFilters
}

