
export interface Taxonomy {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    archive: boolean;
    archivedAt: Date | null;
    terms?: TaxonomyTerm[];
}

export interface TaxonomyTerm {
    id: number;
    name: string;
    slug: string;
    taxonomyId: number;
}


export interface RegisterTaxonomyTerm {
    name: string;
    slug: string;
    taxonomyId: number;
}

export interface UpdateTaxonomyTerm {
    name?: string;
    slug?: string;
}

export interface RegisterTaxonomy {
    name: string;
    slug: string;
    description?: string;
    terms?: string[];
}

export interface UpdateTaxonomy {
    id?: number;
    name?: string;
    slug?: string;
    description?: string;
    terms?: string[];
}

export interface taxonomyFilter {
  archive?: string;
  page?: number;
  limit?: number;
  search?: string;
}
