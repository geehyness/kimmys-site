// types/sanity.ts
export interface SanityImageSource {
    _type: 'image';
    asset: {
      _ref: string;
      _type: 'reference';
    };
    crop?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
  }
  
  export interface SanityAssetSource {
    _id: string;
    url: string;
    path: string;
    assetId: string;
    extension: string;
  }