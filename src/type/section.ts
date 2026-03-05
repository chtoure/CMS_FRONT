import type { BlocTemplate } from "./bloc-template";
import type { AnyComponentInstance, ResponsiveProp } from "./component";


export interface sectionStyle {
  padding?: ResponsiveProp<number | string>;
  bg?: ResponsiveProp<string>;
  opacity?: ResponsiveProp<number>;
  display?: ResponsiveProp<'hidden' | 'block' | 'flex' | 'grid'>;
  columns?: ResponsiveProp<number>;
  gap?: ResponsiveProp<number>;
  direction?: ResponsiveProp<'horizontal' | 'vertical'>;
  justify?: ResponsiveProp<'start' | 'center' | 'end' | 'between'>;
  align?: ResponsiveProp<'start' | 'center' | 'end' | 'between'>;
  borderWidth?: ResponsiveProp<number | string>;
  borderColor?: ResponsiveProp<string>;
  borderStyle?: ResponsiveProp<'solid' | 'dashed' | 'dotted' | 'double' | 'hidden'>;

}


interface SectionProps {
  styles?: sectionStyle;
}


interface Section {
  id: number;          
  pageRevisionId: number; 
  order: number;
  blocTemplates?: BlocTemplate[];
  block_json: SectionProps;
  createdAt: Date;
  updatedAt: Date;
}



interface RegisterSection {
  pageRevisionId: number;
  order: number;
  block_json?: SectionProps;
}


interface UpdateSection {
  pageRevisionId?: number;
  order?: number;
  block_json?: SectionProps;
}


interface AnySectionInstance {
  id: string;
  name?: string;
  sectionId?: number;
  order: number;
  family: 'section';
  styles: sectionStyle;
  children: AnyComponentInstance[];
}

export type {
    Section,
    RegisterSection,
    UpdateSection,
    AnySectionInstance
}
