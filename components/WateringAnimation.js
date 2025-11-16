import Image from "next/image";

/**
 * A self-contained, responsive watering can animation.
 * The water drops are a child of the main container, so they move with the can.
 *
 * @param {string} position - Responsive Tailwind CSS classes for positioning (e.g., "top-[5%] left-[55%]").
 * @param {string} size - Responsive Tailwind CSS classes for the container size (e.g., "w-24 h-24 md:w-32 md:h-32").
 */
const WateringAnimation = ({ position, size }) => {
  return (
    // 1. The main container. This is what moves across the screen.
    // It uses the responsive `position` and `size` classes you pass in.
    <div className={`absolute ${position} ${size} animate-watering-container`}>
      {/* 2. The watering can image. It tilts within the container. */}
      <Image
        src="/flowers/watering.png"
        alt="Watering can"
        width={128}
        height={128}
        className="object-contain w-full h-full animate-watering-can"
      />
      {/* 3. The water drops image. It is positioned relative to the container and animates falling. */}
      <Image
        src="/flowers/water.png"
        alt="Water drops"
        width={64}
        height={64}
        className="object-contain absolute top-[60%] left-[0%] w-1/2 h-1/2 animate-water-drops"
      />
    </div>
  );
};

export default WateringAnimation;
