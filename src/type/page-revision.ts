import type { Section } from "./section.ts";
import type { User } from "./user.ts";

interface PageRevision {
    id: number;
    pageId: number;
    status: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    sections?: Section[];
    user?: User
}

interface RegisterPageRevision {
    pageId: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    version?: number;
}

interface UpdatePageRevision {
    pageId?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    version?: number;
}

interface PageRevisionFilter{
    page?: number
    limit?: number
    search?: string
}

export type { 
    PageRevision, 
    RegisterPageRevision,   
    UpdatePageRevision,
    PageRevisionFilter
};