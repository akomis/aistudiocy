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
    let loadedCount = 0;
    const totalAssets = assets.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalAssets) {
        setLoaded(true);
        onLoadComplete?.();
      }
    };

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

      checkComplete();
    };

    if (assets.length > 0) {
      assets.forEach((asset) => preloadAsset(asset));
    } else {
      setLoaded(true);
    }
  }, [assets, onLoadComplete]);

  if (!loaded) {
    return (
      loadingComponent || (
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900" />
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default AssetPreloader;
