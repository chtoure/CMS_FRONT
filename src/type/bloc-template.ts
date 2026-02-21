import type { AnyComponent, BaseStyles, ComponentProps } from "./component";

interface BlocTemplate <T = BaseStyles> {
  id: number;
  name: string;        
  componentId: number;
  order: number;
  parentId?: number | undefined;
  sectionId?: number;

  props: ComponentProps<T>;
  createdAt: Date;
  updatedAt: Date;
  component?: AnyComponent;
  archive: boolean;
  archivedAt: Date | null;
 
}



interface RegisterBlocTemplate <T = BaseStyles> {
  componentId: number;
  order: number;
  parentId?: number | undefined;
  sectionId?: number;
  props?: ComponentProps<T>;
}


interface UpdateBlocTemplate <T = BaseStyles>{
  name?: string;        
  // componentId?: number;
  order?: number;
  parentId?: number;
  sectionId?: number;
  props?: ComponentProps<T>;
}



export type {
  BlocTemplate,
  RegisterBlocTemplate,
  UpdateBlocTemplate
}