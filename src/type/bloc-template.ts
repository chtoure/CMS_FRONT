import type { AnyComponent, BaseStyles, ComponentProps } from "./component";

interface BlocTemplate <T = BaseStyles> {
  id: number;
  name: string;        
  componentId: number;
  order: number;
  parentId?: number | undefined;
  sectionId?: number;
  is_custom: boolean;
  props: ComponentProps<T>;
  createdAt: Date;
  updatedAt: Date;
  component?: AnyComponent;
  archive: boolean;
  archivedAt: Date | null;
  modelId?: number | null;
  model?: BlocTemplate;
  customBlocTemplates?: BlocTemplate[]
}



interface RegisterBlocTemplate <T = BaseStyles> {
  componentId: number;
  order: number;
  parentId?: number | null;
  sectionId?: number;
  is_custom: boolean;
  props?: ComponentProps<T>;
  modelId?: number | null;
}


interface UpdateBlocTemplate <T = BaseStyles>{
  name?: string;        
  order?: number;
  parentId?: number | null;
  sectionId?: number;
  is_custom: boolean;
  props?: ComponentProps<T>;
}



export type {
  BlocTemplate,
  RegisterBlocTemplate,
  UpdateBlocTemplate
}