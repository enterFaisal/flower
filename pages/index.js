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

    try {
      setUserData(JSON.parse(savedUserData));
    } catch (e) {
      console.error("Error parsing user data:", e);
      router.push("/register");
      return;
    }

    // Load progress from localStorage
    const savedProgress = localStorage.getItem("gameProgress");
    if (savedProgress) {
      try {
        setGameProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Error parsing game progress:", e);
      }
    }
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
              أكمل الأنشطة الثلاثة بالترتيب لاكتشاف قيمك المؤسسية والدخول في
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
