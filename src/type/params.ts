
// Definition des Sources
enum ValueSource {
  STATIC = 'static',
  IMAGE = 'image',
  CONTENUS = 'contenus'
}

// Partie Taxonomy
interface ITaxonomyFilter {
  taxonomyId: number;
  termIds: number[];
  operator: 'AND' | 'OR';
}


// Partie Source : Static
interface IStaticField {
  source: ValueSource.STATIC;
  value: string | number;
}



// Partie Source : Variable
interface IImageField {
  source: ValueSource.IMAGE;
  imageId?: number;
}

// Partie Source : Contenus
interface IContenusSingle {
    mode: 'single';
    entryId: number;
    mappingField?: string;
}

interface IContenusQuery {
    mode: 'query';
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
    taxonomyFilters?: ITaxonomyFilter[];
}

interface IContenusField {
  source: ValueSource.CONTENUS;
  contentTypeId: number;
  config:
    | IContenusSingle
    | IContenusQuery;

}







// Definition Interface BlockField
type IPropsSchemaField =
    | IStaticField
    | IImageField
    | IContenusField;


// Definition des PropsSchemaField
interface IComponentParams {
  name: string;
  label: string;
  type: IPropsSchemaField;
  required: boolean;
  config?: Record<string, unknown>;

}


export {
    ValueSource,
    type ITaxonomyFilter,
    type IStaticField,
    type IImageField,
    type IContenusField,
    type IPropsSchemaField,
    type IComponentParams
}
