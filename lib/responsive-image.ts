import inventory from "../content/image-assets.json";
import { siteUrl } from "./site-url";

type ImageAsset = { src: string; width: number; height: number; variants: { src: string; width: number }[] };

/** Keep canonical catalogue IDs while delivering a photo sized for its actual display. */
export function responsiveImage(path: string, sizes: string) {
  const asset = (inventory as Record<string, ImageAsset>)[path];
  if (!asset) return { src: siteUrl(path), decoding: "async" as const };
  return {
    src: siteUrl(asset.src),
    srcSet: asset.variants.map((variant) => siteUrl(variant.src) + " " + variant.width + "w").join(", "),
    sizes,
    width: asset.width,
    height: asset.height,
    decoding: "async" as const,
  };
}
