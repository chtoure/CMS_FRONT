import type { PageRevision } from "./page-revision.ts";
import type { User } from "./user.ts";


interface Page {
    id: number;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    pageRevisions?: PageRevision[];
    userId?: number;
    user?: User
}


interface RegisterPage {
    name: string;
    slug: string;
}

interface UpdatePage {
    name?: string;
    slug?: string;
}


interface PageFilter {
  page?: number
  limit?: number
  search?: string
}


export type {
    Page,
    RegisterPage,
    UpdatePage,
    PageFilter
}
