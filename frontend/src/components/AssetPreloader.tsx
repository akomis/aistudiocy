"use client";
import { useEffect, useState } from "react";

export type Asset = {
  type: "image" | "video" | "font" | "other";
  url: string;
};

type LoaderProps = {
  children: React.ReactNode;
  assets: Asset[];
  loadingComponent?: React.ReactNode;
  onLoadComplete?: () => void;
};

const AssetPreloader = ({
  children,
  assets,
  loadingComponent,
  onLoadComplete,
}: LoaderProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const preloadAsset = async (asset: Asset) => {
      try {
        switch (asset.type) {
          case "image":
            await new Promise((resolve, reject) => {
              const img = new Image();
              img.src = asset.url;
              img.onload = resolve;
              img.onerror = reject;
            });
            break;

          case "video":
            await new Promise((resolve, reject) => {
              const video = document.createElement("video");
              video.src = asset.url;
              video.oncanplaythrough = resolve;
              video.onerror = reject;
              video.load();
            });
            break;

          case "font":
            await document.fonts.load(`1em ${asset.url}`);
            break;

          default:
            await fetch(asset.url);
        }
      } catch (error) {
        console.error(`Failed to load asset: ${asset.url}`, error);
      }
    };

    if (assets.length > 0) {
      assets.forEach((asset) => preloadAsset(asset));
    } else {
      setLoaded(true);
    }
  }, [assets, onLoadComplete]);

  if (!loaded) {
    return loadingComponent;
  }

  return <>{children}</>;
};

export default AssetPreloader;
