interface Media{
    id : number,
    file_path :   string,
    type :   'video' | 'image',
    alt  : string | null
};

interface MediaPayload{
    file_path :   string,
    type :   'video' | 'image',
    alt  : string | null
}



type Tool = 'remove-bg' | 'crop' | 'refine' | 'rotate' | 'adjust' | 'filters';

type AspectRatio = 'free' | '1:1' | '16:9' | '4:3' | '3:2';

interface Media {
  id: number;
  file_path: string;
  type: 'video' | 'image';
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
  bgRemoved: boolean;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';


interface SaveMediaPayload {
  mediaId: number;
  operations: {
    geometry: {
      rotation: number; // angle total final
      flipH: boolean;
      flipV: boolean;
      crop: {
        x: number;     // realX
        y: number;     // realY
        width: number; // realWidth
        height: number;// realHeight
      };
    };
    adjustments: {
      brightness: number;
      contrast: number;
      saturation: number;
      blur: number;
      grayscale: boolean;
    };
    bgRemoved: boolean;
  };
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
  SaveMediaPayload
};
