/* eslint-disable @typescript-eslint/no-explicit-any */
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



interface HydratedBlock {
    id: number;
    name: string;
    order: number;
    tag: string;
    family: string;
    styles: Record<string, any>;
    data: Record<string, any>;
    children: HydratedBlock[];
}


interface PageRenderResponse {
    slug: string;
    title?: string;
    layout: HydratedBlock[];
}

export type {
    Page,
    RegisterPage,
    UpdatePage,
    PageFilter,
    PageRenderResponse,
    HydratedBlock
}
