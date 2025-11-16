import Link from "next/link";

export default function GameCard({
  title,
  description,
  href,
  isCompleted,
  icon,
  isLocked = false,
  stepNumber,
}) {
  const isInteractive = !isLocked && !isCompleted;

  const CardContent = () => (
    <div
      className={`card card-hover relative overflow-hidden ${
        isLocked
          ? "opacity-60 cursor-not-allowed"
          : isInteractive
          ? "cursor-pointer"
          : "cursor-default"
      }`}
    >
      {/* Step Number Badge */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-mewa-green-600 text-white rounded-full flex items-center justify-center font-bold text-base sm:text-lg">
        {stepNumber}
      </div>

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 checkmark flex items-center justify-center">
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Lock Icon */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <div className="text-center px-4">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-2">🔒</div>
            <p className="text-sm sm:text-base md:text-lg font-bold text-gray-700">
              أكمل النشاط السابق أولاً
            </p>
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 text-center">{icon}</div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-mewa-green-700 mb-2 sm:mb-3 text-center px-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm sm:text-base text-gray-600 text-center leading-relaxed mb-3 sm:mb-4 px-2">
        {description}
      </p>

      {/* Action Button */}
      {!isLocked && (
        <div className="text-center">
          <span
            className={`inline-block px-5 sm:px-6 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base min-h-[44px] flex items-center justify-center ${
              isCompleted
                ? "bg-gray-300 text-gray-600 cursor-default"
                : "bg-mewa-green-600 text-white hover:bg-mewa-green-700 active:bg-mewa-green-800 transition-colors"
            }`}
          >
            {isCompleted ? "مكتمل ✓" : "ابدأ الآن"}
          </span>
        </div>
      )}

      {/* Wave decoration */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 ${
          isLocked
            ? "bg-gray-400"
            : "bg-gradient-to-l from-mewa-green-400 to-mewa-green-600"
        }`}
      ></div>
    </div>
  );

  if (isInteractive) {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
    );
  }

  return (
    <div>
      <CardContent />
    </div>
  );
}
