import Image from "next/image";

/**
 * A responsive icon component that uses Tailwind CSS classes for positioning and sizing.
 */
const AnimatedIcon = ({ src, alt, size, position, animationClass }) => {
  return (
    // The `position` and `animationClass` props are applied directly here.
    <div className={`absolute ${position} ${animationClass}`}>
      <Image
        src={src}
        alt={alt}
        width={0} // Required for responsive fill with `sizes` prop
        height={0}
        sizes="100vw"
        // The `size` prop (e.g., "w-20 h-20") is applied to the image.
        className={`object-contain ${size}`}
      />
    </div>
  );
};

export default AnimatedIcon;
