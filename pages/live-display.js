import { useState, useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import pattern2 from "../brand/Pattern(2).png";
import { preloadRouteImages } from "../lib/imagePreloader";

// Flower name to color mapping
const flowerColors = {
  الورف: "#F5DEB3", // White lily - wheat/cream (for visibility on white background)
  الورد_الطائفي: "#E91E63", // Pink rose - pink/magenta
  الدفلى: "#FF69B4", // Pink flower - hot pink
  الخزامى: "#9370DB", // Lavender - purple
  الاقحوان_البري: "#FFD700", // Daisy - yellow/gold
};

// Seeded random number generator for consistent positions
function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Collision detection helper
function checkCollision(rect1, rect2, padding = 10) {
  return !(
    rect1.right + padding < rect2.left ||
    rect1.left - padding > rect2.right ||
    rect1.bottom + padding < rect2.top ||
    rect1.top - padding > rect2.bottom
  );
}

// Helper function to recalculate rect from percentages
function recalculateRect(
  xPercent,
  yPercent,
  size,
  containerWidth,
  containerHeight
) {
  const halfSize = size / 2;
  const xPx = (xPercent / 100) * containerWidth;
  const bottomEdgeFromBottom = (yPercent / 100) * containerHeight;
  const centerYFromTop = containerHeight - bottomEdgeFromBottom - halfSize;

  return {
    left: xPx - halfSize,
    right: xPx + halfSize,
    top: centerYFromTop - halfSize,
    bottom: centerYFromTop + halfSize,
  };
}

// Calculate position for a flower with collision detection using seeded random
function calculateFlowerPosition(
  seed,
  existingPositions,
  containerWidth,
  containerHeight,
  flowerSize
) {
  const MAX_ATTEMPTS = 100; // Try up to 100 random positions before allowing overlap
  const MIN_X_PERCENT = 5; // 5% from left edge
  const MAX_X_PERCENT = 75; // 75% from left (leave space for QR code)
  const MIN_Y_PERCENT = 0; // Bottom of container
  const MAX_Y_PERCENT = 75; // 75% from bottom

  // Convert percentage to pixels for collision detection
  const sizeInPx = flowerSize;
  const halfSize = sizeInPx / 2;
  const random = seededRandom(seed);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Generate consistent position based on seed + attempt
    const attemptSeed = seed + attempt * 1000;
    const attemptRandom = seededRandom(attemptSeed);
    const xPercent =
      MIN_X_PERCENT + attemptRandom() * (MAX_X_PERCENT - MIN_X_PERCENT);
    const yPercent =
      MIN_Y_PERCENT + attemptRandom() * (MAX_Y_PERCENT - MIN_Y_PERCENT);

    // Convert percentage to pixels for collision detection
    // xPercent is the center position from left (0-100%)
    const xPx = (xPercent / 100) * containerWidth;

    // yPercent is the bottom edge position from bottom (0-100%)
    // So the center is at: bottomEdge + halfSize from bottom
    // Or: containerHeight - (yPercent/100 * containerHeight + halfSize) from top
    const bottomEdgeFromBottom = (yPercent / 100) * containerHeight;
    const centerYFromTop = containerHeight - bottomEdgeFromBottom - halfSize;

    // Create bounding box for this flower (in top-left coordinate system)
    const newRect = {
      left: xPx - halfSize,
      right: xPx + halfSize,
      top: centerYFromTop - halfSize,
      bottom: centerYFromTop + halfSize,
    };

    // Check collision with all existing flowers
    let hasCollision = false;
    for (const existing of existingPositions) {
      // Ensure existing is a valid rect object
      if (existing && typeof existing.left === "number") {
        if (checkCollision(newRect, existing)) {
          hasCollision = true;
          break;
        }
      }
    }

    // If no collision found, use this position
    if (!hasCollision) {
      return {
        x: xPercent,
        y: yPercent,
        rect: newRect,
      };
    }
  }

  // If no empty spot found after MAX_ATTEMPTS, allow overlap
  // Place it with a consistent position based on seed
  const finalRandom = seededRandom(seed * 9999);
  const xPercent =
    MIN_X_PERCENT + finalRandom() * (MAX_X_PERCENT - MIN_X_PERCENT);
  const yPercent =
    MIN_Y_PERCENT + finalRandom() * (MAX_Y_PERCENT - MIN_Y_PERCENT);

  const xPx = (xPercent / 100) * containerWidth;
  const bottomEdgeFromBottom = (yPercent / 100) * containerHeight;
  const centerYFromTop = containerHeight - bottomEdgeFromBottom - halfSize;

  return {
    x: xPercent,
    y: yPercent,
    rect: {
      left: xPx - halfSize,
      right: xPx + halfSize,
      top: centerYFromTop - halfSize,
      bottom: centerYFromTop + halfSize,
    },
    overlapping: true, // Mark as overlapping
  };
}

// Main component for the page
export default function LiveDisplay() {
  const [users, setUsers] = useState([]);
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1200,
    height: 800,
  });
  const [flowerPositionsMap, setFlowerPositionsMap] = useState(new Map());
  // Generate a random session seed on mount - this will change positions on refresh
  const sessionSeedRef = useRef(Math.floor(Math.random() * 1000000));
  const containerRef = useRef(null);
  const qrcodeUrl = "http://mewa-event.uselines.com/qr";

  // Update container dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    // Preload images for live display
    preloadRouteImages("/live-display");
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRegistrationUrl(qrcodeUrl);
    }

    const fetchData = async () => {
      try {
        const res = await fetch("/api/live-data");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch live data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const flowers = users.filter((user) => user.flower);

  // Calculate and store positions for flowers - only for new users
  useEffect(() => {
    if (flowers.length === 0 || containerDimensions.width === 0) {
      return;
    }

    setFlowerPositionsMap((prevMap) => {
      const newMap = new Map(prevMap);
      const existingPositions = [];

      // First, collect all existing positions from the map and recalculate rects
      flowers.forEach((user) => {
        const userId = user.id?.toString() || "";
        if (newMap.has(userId)) {
          const existing = newMap.get(userId);
          // Recalculate rect with current container dimensions
          const rect = recalculateRect(
            existing.x,
            existing.y,
            existing.size,
            containerDimensions.width,
            containerDimensions.height
          );
          existingPositions.push({
            rect,
            userId,
          });
          // Update the stored rect
          newMap.set(userId, { ...existing, rect });
        }
      });

      // Then, calculate positions for new users only
      flowers.forEach((user, index) => {
        const userId = user.id?.toString() || `index-${index}`;

        // Skip if position already exists
        if (newMap.has(userId)) {
          return;
        }

        // Generate seed based on user ID + session seed for consistent positioning during session
        // but different positions on refresh
        const userSeed = user.id
          ? parseInt(user.id.toString().slice(-8), 16) || user.id
          : index * 1000;
        // Combine user seed with session seed to get different positions on refresh
        const seed = userSeed + sessionSeedRef.current;
        const size = 80 + (userSeed % 50); // 80px to 130px (use userSeed for consistent size)

        const position = calculateFlowerPosition(
          seed,
          existingPositions.map((p) => p.rect),
          containerDimensions.width,
          containerDimensions.height,
          size
        );

        newMap.set(userId, {
          user,
          ...position,
          size,
          zIndex: position.overlapping
            ? 1000 + index // Overlapping flowers get higher z-index
            : Math.floor((position.y / 75) * 10), // Non-overlapping based on height (y is 0-75%)
        });

        existingPositions.push({
          rect: position.rect,
          userId,
        });
      });

      // Remove positions for users that no longer exist
      const currentUserIds = new Set(
        flowers.map((user) => user.id?.toString() || "")
      );
      for (const [userId] of newMap) {
        if (!currentUserIds.has(userId) && !userId.startsWith("index-")) {
          newMap.delete(userId);
        }
      }

      return newMap;
    });
  }, [flowers, containerDimensions]);

  // Convert map to array for rendering
  const flowerPositions = useMemo(() => {
    return Array.from(flowerPositionsMap.values()).map((positionData) => ({
      ...positionData,
      user:
        flowers.find(
          (u) => u.id?.toString() === positionData.user.id?.toString()
        ) || positionData.user,
    }));
  }, [flowerPositionsMap, flowers]);

  return (
    <>
      <Head>
        <title>حديقة الوزارة المباشرة - وزارة البيئة والمياه والزراعة</title>
      </Head>

      <div className="h-screen overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex flex-col">
        {/* Header */}
        <header className="bg-mewa-green-600 text-white py-4 shadow-2xl relative overflow-hidden flex-shrink-0">
          <div className="absolute -bottom-6 left-0 right-0 opacity-30 pointer-events-none select-none">
            <div className="relative h-24">
              <Image
                src={pattern2}
                alt="wave pattern"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="relative w-48 md:w-56 h-24 md:h-28">
                <Image
                  src="https://www.mewa.gov.sa/_layouts/15/MewaPortal/mewa-branding/svg/mewa-logo-footer.svg"
                  alt="شعار الوزارة"
                  fill
                  sizes="(max-width: 768px) 192px, 224px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold">
                  بكم تزهر ثقافتنا
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* This is the main relative container for the entire garden */}
          <div
            ref={containerRef}
            className="relative h-full container mx-auto px-4 py-4"
          >
            {/* Flowers Section */}
            {flowers.length === 0 && (
              <div className="w-full h-full flex items-center justify-center animate-fade-in">
                <div className="text-center">
                  <div className="text-7xl mb-4">🌱</div>
                  <h2 className="text-2xl font-bold text-mewa-green-700 mb-2">
                    الحديقة جاهزة للنمو
                  </h2>
                  <p className="text-lg text-gray-600">
                    في انتظار الورود الجديدة...
                  </p>
                </div>
              </div>
            )}

            {flowers.length > 0 && (
              <>
                {/* Positioned the title at the top of the garden */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-20 bg-white/50 backdrop-blur-sm p-2 rounded-lg">
                  <h2 className="text-2xl font-bold text-mewa-green-700 mb-1">
                    حديقة المشاركين 🌸
                  </h2>
                  <p className="text-base text-gray-600">
                    {flowers.length} مشاركين اكملوا النشاط الاول
                  </p>
                </div>
                {/* The flowers are mapped with calculated positions */}
                {flowerPositions.map((positionData, index) => (
                  <FlowerItem
                    key={positionData.user.id || index}
                    user={positionData.user}
                    x={positionData.x}
                    y={positionData.y}
                    size={positionData.size}
                    zIndex={positionData.zIndex}
                    overlapping={positionData.overlapping}
                  />
                ))}
              </>
            )}

            {/* The QR Code is now absolutely positioned at the bottom-left */}
          
          </div>
        </main>
          <div className="absolute bottom-4 right-4 bg-white rounded-2xl shadow-2xl p-6 w-80 z-10">
              <h3 className="text-xl font-bold text-mewa-green-700 mb-3 text-center">
                ابدأ التسجيل
              </h3>
              <div className="bg-white p-3 rounded-lg border-4 border-mewa-accent-500 mb-3 w-64 h-64 flex items-center justify-center mx-auto">
                {registrationUrl && (
                  <QRCodeSVG
                    value={registrationUrl}
                    size={200}
                    level="H"
                    includeMargin={false}
                    className="mx-auto"
                  />
                )}
              </div>
              <p className="text-center text-gray-700 font-bold text-base mb-2">
                امسح الرمز للمشاركة
              </p>
            </div>
      </div>

      <style jsx>{`
        @keyframes popIn {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </>
  );
}

// ===================================================================
// FlowerItem Component - Receives calculated position from parent
// ===================================================================
function FlowerItem({ user, x, y, size, zIndex, overlapping }) {
  // Generate consistent animation delays and durations based on user ID
  const seed = user.id ? parseInt(user.id.toString().slice(-4), 16) : 0;
  const delay = (seed % 200) / 100; // 0 to 2 seconds
  const duration = 5 + (seed % 50) / 10; // 5 to 10 seconds

  const positionStyle = {
    left: `${x}%`,
    bottom: `${y}%`,
    transform: "translateX(-50%)",
  };

  const cardStyle = {
    width: `${size}px`,
    height: `${size}px`,
    zIndex: zIndex,
    animation: `popIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}s, float ${duration}s ease-in-out ${delay}s infinite`,
    // Add subtle opacity variation for overlapping flowers to create depth
    opacity: overlapping ? 0.95 : 1,
  };

  return (
    <div className="absolute" style={positionStyle}>
      <div
        className="flower-item bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg w-full h-full flex flex-col justify-center"
        style={cardStyle}
      >
        <div className="relative w-full h-3/4 mx-auto">
          <Image
            src={user.flower.flowerImage || "/flowers/الاقحوان_البري2.png"}
            alt={user.flower.seedName}
            fill
            sizes="(max-width: 130px) 100px, 130px"
            style={{ objectFit: "contain" }}
            loading="lazy"
          />
        </div>
        <div className="text-center mt-1">
          <div className="font-bold text-xs text-mewa-green-700 truncate">
            {user.name}
          </div>
          <div
            className="text-[10px] font-semibold truncate"
            style={{
              color: flowerColors[user.flower.seedName] || "#6B7280",
            }}
          >
            {user.flower.seedName}
          </div>
        </div>
      </div>
    </div>
  );
}
