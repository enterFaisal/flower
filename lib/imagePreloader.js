// lib/imagePreloader.js - Comprehensive image preloading utility

import { flowerGameData, personalityQuizData } from "./content";

/**
 * Preloads all images used across the application
 * This ensures images are cached and ready when needed
 */
export function preloadAllImages() {
  if (typeof window === "undefined") return;

  const imagesToPreload = [];

  // Note: Brand images (logo, patterns) are imported as modules in components
  // so they're already bundled and don't need URL-based preloading
  // They will be automatically optimized by Next.js

  // Background images
  imagesToPreload.push("/pgbg.jpg", "/fgbg.png");

  // Flower game icons
  imagesToPreload.push(
    "/flowers/بذور.png",
    "/flowers/water.png",
    "/flowers/watering.png",
    "/flowers/sun.png",
    "/flowers/love.png"
  );

  // All flower images from flowerGameData
  flowerGameData.forEach((plant) => {
    imagesToPreload.push(
      plant.seedImage,
      plant.flowerImageStage1,
      plant.flowerImage
    );

    // Preload question icons
    plant.questions.forEach((question) => {
      if (question.icon && !imagesToPreload.includes(question.icon)) {
        imagesToPreload.push(question.icon);
      }
    });
  });

  // Personality images
  Object.values(personalityQuizData.personalities).forEach((personality) => {
    if (personality.image && !imagesToPreload.includes(personality.image)) {
      imagesToPreload.push(personality.image);
    }
  });

  // External logo - skip preloading due to CORS restrictions
  // It will be loaded when needed by the Image component

  // Preload all images with Promise-based loading for better control
  const preloadPromises = imagesToPreload.map((src) => {
    return new Promise((resolve, reject) => {
      // Skip if already cached
      if (src.startsWith("http")) {
        // For external images, use fetch to preload
        fetch(src, { method: "HEAD", mode: "no-cors" })
          .then(() => resolve())
          .catch(() => {
            // Even if fetch fails, try image preload
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // Continue even if one fails
            img.src = src;
          });
      } else {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // Continue even if one fails
        img.src = src;
      }
    });
  });

  // Return promise that resolves when all images are loaded
  return Promise.all(preloadPromises);
}

/**
 * Preloads images with priority using link preload
 * This is more efficient for critical images
 */
export function preloadCriticalImages() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const criticalImages = [
    // Brand logo is imported as module, skip
    // "/brand/logo.png",
    "/pgbg.jpg",
    "/fgbg.png",
    // External SVG has CORS restrictions, skip
    // "https://www.mewa.gov.sa/_layouts/15/MewaPortal/mewa-branding/svg/mewa-logo-footer.svg",
  ];

  criticalImages.forEach((src) => {
    // Skip external images due to CORS
    if (src.startsWith("http")) {
      return;
    }
    
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
}

/**
 * Preloads images for a specific route/page
 */
export function preloadRouteImages(route) {
  if (typeof window === "undefined") return;

  const routeImageMap = {
    "/": [
      // Brand images are imported as modules, skip URL preloading
      // "/brand/logo.png",
      // "/brand/pattern(1).png",
      // External logo has CORS issues, skip
      // "https://www.mewa.gov.sa/_layouts/15/MewaPortal/mewa-branding/svg/mewa-logo-footer.svg",
    ],
    "/flower-game": [
      "/fgbg.png",
      // Brand logo is imported as module
      // "/brand/logo.png",
      "/flowers/بذور.png",
      "/flowers/water.png",
      "/flowers/watering.png",
      "/flowers/sun.png",
      "/flowers/love.png",
      ...flowerGameData.flatMap((plant) => [
        plant.seedImage,
        plant.flowerImageStage1,
        plant.flowerImage,
      ]),
    ],
    "/personality-quiz": [
      "/pgbg.jpg",
      // Brand logo is imported as module
      // "/brand/logo.png"
      ...Object.values(personalityQuizData.personalities)
        .map((personality) => personality.image)
        .filter(Boolean),
    ],
    "/commitment-quiz": [
      // Brand images are imported as modules
      // "/brand/logo.png",
      // "/brand/pattern(1).png"
    ],
    "/live-display": [
      // Brand pattern is imported as module
      // "/brand/pattern(2).png",
      // External logo has CORS issues
      // "https://www.mewa.gov.sa/_layouts/15/MewaPortal/mewa-branding/svg/mewa-logo-footer.svg",
      ...flowerGameData.map((plant) => plant.flowerImage),
    ],
  };

  const images = routeImageMap[route] || [];
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}
