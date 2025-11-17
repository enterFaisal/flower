import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import GameCard from "../components/GameCard";
import Image from "next/image";
import pattern1 from "../brand/Pattern(1).png";
import { preloadRouteImages } from "../lib/imagePreloader";

export default function Home() {
  const router = useRouter();
  const [gameProgress, setGameProgress] = useState({
    flowerGame: false,
    personalityQuiz: false,
    commitmentQuiz: false,
  });
  const [userData, setUserData] = useState(null);
  const [commitmentDroplet, setCommitmentDroplet] = useState(null);

  useEffect(() => {
    // Preload images for potential next routes
    preloadRouteImages("/flower-game");
    preloadRouteImages("/personality-quiz");
    preloadRouteImages("/commitment-quiz");

    // Check if user is registered
    const savedUserData = localStorage.getItem("userData");
    if (!savedUserData) {
      // Redirect to registration page
      router.push("/register");
      return;
    }

    let userData;
    try {
      userData = JSON.parse(savedUserData);
    } catch (e) {
      console.error("Error parsing user data:", e);
      router.push("/register");
      return;
    }

    // Validate that user actually completed registration
    // Check for required fields that are only set after successful registration
    if (!userData.id || !userData.name || !userData.phone || !userData.employeeId) {
      // Missing required fields - not a valid registration
      console.warn("User data missing required fields, redirecting to register");
      localStorage.removeItem("userData");
      localStorage.removeItem("userId");
      localStorage.removeItem("gameProgress");
      localStorage.removeItem("commitmentDroplet");
      router.push("/register");
      return;
    }

    // Check if user has registeredAt (proves they completed registration)
    // If not present, they might have old/invalid data
    if (!userData.registeredAt) {
      // No registration timestamp - might be old/invalid data
      // But allow if they have a valid UUID format ID (proves they registered)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const timestampIdRegex = /^\d{13,}-\d+$/; // Format: timestamp-random
      
      if (!uuidRegex.test(userData.id) && !timestampIdRegex.test(userData.id)) {
        // ID is not a valid UUID or timestamp format - likely invalid data
        console.warn("User ID is not in valid format, redirecting to register");
        localStorage.removeItem("userData");
        localStorage.removeItem("userId");
        localStorage.removeItem("gameProgress");
        localStorage.removeItem("commitmentDroplet");
        router.push("/register");
        return;
      }
    }

    // User data is valid, set it
    setUserData(userData);

    // Check if user ID exists in users.json and load progress
    const checkUserExistsAndLoadProgress = async () => {
      const userId = userData.id || localStorage.getItem("userId");
      
      // First, load existing progress
      const savedProgress = localStorage.getItem("gameProgress");
      if (savedProgress) {
        try {
          setGameProgress(JSON.parse(savedProgress));
        } catch (e) {
          console.error("Error parsing game progress:", e);
        }
      }

      const savedDroplet = localStorage.getItem("commitmentDroplet");
      if (savedDroplet) {
        try {
          setCommitmentDroplet(JSON.parse(savedDroplet));
        } catch (e) {
          console.error("Error parsing commitment droplet:", e);
          setCommitmentDroplet(null);
        }
      } else {
        setCommitmentDroplet(null);
      }

      // Then check if user exists in users.json (non-blocking validation)
      if (!userId) {
        // No user ID, allow them to continue (new user)
        return;
      }

      // Check user existence in users.json (non-blocking, only for validation)
      // Don't clear localStorage on network errors - only if we're certain user doesn't exist
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch("/api/users/check-id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Only proceed if response is OK and we got valid JSON
        if (!response.ok) {
          console.warn("User check API returned non-OK status:", response.status);
          // Continue anyway - don't block user on API errors
          return;
        }

        const data = await response.json();
        
        // Only act if we got a valid response with success: true
        // If user doesn't exist in users.json, log a warning but don't block them
        // This prevents issues on mobile where network might be unreliable
        // or where the user just registered and the check happens too quickly
        if (data.success === true && data.exists === false) {
          console.warn("User ID not found in users.json, but user has localStorage data. Allowing access.");
          // Don't clear localStorage - allow user to continue
          // The user might have just registered and the check happened too quickly
          // Or there might be a sync issue between registration and the check
          return;
        }
        
        // If user exists, continue normally
        if (data.success === true && data.exists === true) {
          // User exists, everything is fine
          return;
        }
      } catch (error) {
        // Network error, timeout, or other fetch errors
        if (error.name === 'AbortError') {
          console.warn("User check timed out - continuing anyway");
        } else {
          console.error("Error checking user ID:", error);
        }
        // On any error, continue - don't block user on network issues
        // This is especially important on mobile where network can be unreliable
      }
    };

    checkUserExistsAndLoadProgress();
  }, [router]);

  const allGamesCompleted =
    gameProgress.flowerGame &&
    gameProgress.personalityQuiz &&
    gameProgress.commitmentQuiz;

  return (
    <>
      <Head>
        <title>وزارة البيئة والمياه والزراعة - الثقافة المؤسسية</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen wave-pattern">
        {/* Header */}
        <header className="bg-mewa-green-600 text-white py-4 sm:py-6 md:py-8 shadow-lg relative overflow-hidden">
          {/* Pattern decoration */}
          <div className="absolute -bottom-4 left-0 right-0 opacity-30 pointer-events-none select-none">
            <div className="relative h-16 sm:h-20 md:h-24">
              <Image
                src={pattern1}
                alt="wave pattern"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
          </div>

          <div className="container mx-auto px-3 sm:px-4 relative z-10">
            <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4">
              <div className="relative w-32 sm:w-40 md:w-48 lg:w-64 h-16 sm:h-20 md:h-24 lg:h-32">
                <Image
                  src="https://www.mewa.gov.sa/_layouts/15/MewaPortal/mewa-branding/svg/mewa-logo-footer.svg"
                  alt="شعار الوزارة"
                  fill
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, 256px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
              <div className="text-center px-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 leading-tight">
                  منصة الثقافة المؤسسية التفاعلية
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          {/* Welcome Section */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-mewa-green-700 mb-3 sm:mb-4 px-2">
              مرحباً {userData?.name || ""}!
            </h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed px-3 sm:px-4 mb-4">
              أكمل الأنشطة الثلاثة بالترتيب لاكتشاف ثقافتك التنظيمة والدخول في
              السحب على جوائز قيمة
            </p>
            <div className="mt-3 sm:mt-4 mx-2 sm:mx-auto inline-block bg-mewa-yellow-50 border-2 border-mewa-yellow-500 rounded-lg px-4 sm:px-6 py-2 sm:py-3 max-w-full">
              <p className="text-sm sm:text-base text-mewa-yellow-700 font-bold leading-relaxed">
                ⚠️ يجب إكمال الأنشطة بالترتيب: اللعبة الأولى ← الثانية ← الثالثة
              </p>
            </div>
          </div>

          {/* Congratulations Message */}
          {allGamesCompleted && (
            <div className="max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12 animate-pop-in px-2">
              <div className="bg-gradient-to-l from-mewa-accent-50 to-mewa-yellow-50 border-4 border-mewa-yellow-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4">
                    🎉
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-mewa-green-700 mb-2 sm:mb-3 px-2">
                    مبروك! أكملت جميع الأنشطة
                  </h3>
                  <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed px-2">
                    تم إدخالك تلقائياً في السحب على قسائم شرائية من رسال
                  </p>
                  <div className="mt-4 sm:mt-6 text-4xl sm:text-5xl md:text-6xl">
                    🎁
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
            <GameCard
              title="بكم نزهر"
              description="ازرع وردتك واكتشف كيف تساهم قيمك في نمو الوزارة"
              href="/flower-game"
              isCompleted={gameProgress.flowerGame}
              icon="🌸"
              isLocked={false}
              stepNumber={1}
            />

            <GameCard
              title="تحليل الشخصية"
              description="اكتشف الشخصية الأقرب لك من خلال إجاباتك على الأسئلة"
              href="/personality-quiz"
              isCompleted={gameProgress.personalityQuiz}
              icon="🎭"
              isLocked={!gameProgress.flowerGame}
              stepNumber={2}
            />

            <GameCard
              title="نسبة الالتزام"
              description="قيّم التزامك بالقيم الخمس واكتشف مجالات التطوير"
              href="/commitment-quiz"
              isCompleted={gameProgress.commitmentQuiz}
              icon="🌧️"
              isLocked={!gameProgress.personalityQuiz}
              stepNumber={3}
            />
          </div>

          {gameProgress.commitmentQuiz && commitmentDroplet && (
            <div className="max-w-2xl mx-auto mt-6 sm:mt-8 md:mt-12 px-2 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                  <Image
                    src={commitmentDroplet.image}
                    alt={commitmentDroplet.alt || "قطرة الالتزام"}
                    fill
                    sizes="112px"
                    className="object-contain drop-shadow-lg"
                  />
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-sm font-bold text-mewa-green-600 mb-1">
                    لون قطرة التزامك
                  </p>
                  <h3
                    className="text-xl sm:text-2xl font-bold mb-2"
                    style={{ color: commitmentDroplet.colorHex }}
                  >
                    {commitmentDroplet.colorName}
                  </h3>
                  <p className="text-gray-700 text-sm sm:text-base">
                    نسبة الالتزام التي حققتها:{" "}
                    <span className="font-bold text-mewa-green-700">
                      {commitmentDroplet.percentage}%
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="max-w-2xl mx-auto mt-6 sm:mt-8 md:mt-12 px-2">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-mewa-green-700 mb-3 sm:mb-4 text-center">
                تقدمك في الأنشطة
              </h3>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      (((gameProgress.flowerGame ? 1 : 0) +
                        (gameProgress.personalityQuiz ? 1 : 0) +
                        (gameProgress.commitmentQuiz ? 1 : 0)) /
                        3) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-center text-sm sm:text-base text-gray-600 mt-3">
                {(gameProgress.flowerGame ? 1 : 0) +
                  (gameProgress.personalityQuiz ? 1 : 0) +
                  (gameProgress.commitmentQuiz ? 1 : 0)}{" "}
                من 3 أنشطة مكتملة
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
