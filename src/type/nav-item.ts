export interface NavItem {
  id: number;
  label: string;
  value: string; // slug de la page (ex: /contact)
  pageId?: number;
  parentId?: number | null;
  order?: number;
  children?: NavItem[];
}
