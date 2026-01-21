interface Media{
    id : number,
    file_path :   string,
    type :   'video' | 'image' | 'document' | 'archive',
    alt  : string | null
};

interface MediaPayload{
    file_path :   string,
    type :   'video' | 'image' | 'document' | 'archive',
    alt  : string | null
}



type Tool = 'remove-bg' | 'crop' | 'refine' | 'rotate' | 'adjust' | 'filters';

type AspectRatio = 'free' | '1:1' | '16:9' | '4:3' | '3:2';

interface Media {
  id: number;
  file_path: string;
  type: 'video' | 'image' | 'document' | 'archive';
  alt: string | null;
}

interface Transform {
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
}

interface Filters {
  blur: number;
  grayscale: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
}

interface CropState {
  x: number;
  y: number;
  width: number;
  height: number;
  realX: number;
  realY: number;
  realWidth: number;
  realHeight: number;
}

interface ImageState {
  url: string | null;
  loaded: boolean;
  originalWidth: number;
  originalHeight: number;
}

interface AppliedModifications {
  transform: Transform;
  filters: Filters;
  bgRemoved?: boolean;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

interface SaveMediaPayload {
  operations: {
    geometry: {
      rotation: number;
      flipH: boolean;
      flipV: boolean;
      crop: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };
    adjustments: {
      blur: number;
      grayscale: boolean;
    };
  };
}

interface MediaFilter {
  type?: 'image' | 'video' | 'document' | 'archive' | null
  page?: number
  limit?: number
}



export type {
  Media,
  MediaPayload,
  ResizeHandle,
  AppliedModifications,
  Tool,
  AspectRatio,
  ImageState,
  CropState,
  Filters,
  Transform,
  SaveMediaPayload,
  MediaFilter
};
