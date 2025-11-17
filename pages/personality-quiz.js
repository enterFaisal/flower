import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { personalityQuizData } from "../lib/content";
import Image from "next/image";
import logo from "../brand/logo.png";
import { preloadRouteImages } from "../lib/imagePreloader";

export default function PersonalityQuiz() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({
    sakhr: 0,
    falah: 0,
    nada: 0,
    abeer: 0,
    waad: 0,
  });
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [userIdentifiers, setUserIdentifiers] = useState({ id: "", phone: "" });

  // Preload images on mount
  useEffect(() => {
    preloadRouteImages("/personality-quiz");
  }, []);

  // Check if user has completed previous game
  useEffect(() => {
    const checkUserAndProgress = async () => {
      // First check if user ID exists in users.json
      const savedUserData = localStorage.getItem("userData");
      if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData);
          const userId = userData.id || localStorage.getItem("userId");
          
          if (userId) {
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
              if (data.success === true && data.exists === false) {
                console.warn("User ID not found in users.json, but user has localStorage data. Allowing access.");
                // Don't clear localStorage - allow user to continue
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
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }

      // If user exists in users.json, check progress normally
      const savedProgress = localStorage.getItem("gameProgress");
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          if (!progress.flowerGame) {
            alert("يجب إكمال بكم نزهر أولاً!");
            router.replace("/");
            return;
          }
          if (progress.personalityQuiz) {
            alert("لقد أكملت هذا النشاط مسبقًا.");
            router.replace("/");
            return;
          }
        } catch (e) {
          console.error("Error parsing game progress:", e);
        }
      } else {
        router.replace("/");
        return;
      }
    };

    checkUserAndProgress();
  }, []);

  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");
    if (!savedUserData) {
      router.replace("/register");
      return;
    }

    try {
      const parsed = JSON.parse(savedUserData);
      setUserIdentifiers({
        id: parsed.id || "",
        phone: parsed.phone || "",
      });
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.replace("/register");
    }
  }, [router]);

  const persistLevel = async (level) => {
    // Get user data directly from localStorage as fallback
    // This ensures we have the data even if state hasn't updated
    let userId = userIdentifiers.id;
    let phone = userIdentifiers.phone;

    if (!userId && !phone) {
      try {
        const savedUserData = localStorage.getItem("userData");
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          userId = userData.id || "";
          phone = userData.phone || "";
        }
      } catch (e) {
        console.error("Error getting user data from localStorage:", e);
      }
    }

    if (!userId && !phone) {
      console.warn("Cannot persist level: no user ID or phone found");
      return;
    }

    try {
      const payload = {
        ...(userId ? { userId } : {}),
        ...(phone ? { phone } : {}),
        level,
      };

      console.log("Persisting level:", level, "for user:", { userId, phone });

      const response = await fetch("/api/users/update-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API returned ${response.status}: ${errorData.error || "Unknown error"}`
        );
      }

      const result = await response.json();
      console.log("Level persisted successfully:", result);
    } catch (error) {
      console.error("Failed to persist level:", error);
      // Don't throw - allow user to continue even if API call fails
    }
  };

  const currentQuestion = personalityQuizData.questions[currentQuestionIndex];

  const handleAnswerClick = (answer) => {
    // Update scores
    const newScores = { ...scores };
    newScores[answer.personality] = newScores[answer.personality] + 1;
    setScores(newScores);

    // Move to next question or show result
    if (currentQuestionIndex < personalityQuizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate result
      const winner = Object.keys(newScores).reduce((a, b) =>
        newScores[a] > newScores[b] ? a : b
      );

      const personalityResult = personalityQuizData.personalities[winner];
      setResult(personalityResult);
      setShowResult(true);

      // Update localStorage
      const savedProgress = localStorage.getItem("gameProgress");
      const progress = savedProgress ? JSON.parse(savedProgress) : {};
      progress.personalityQuiz = true;
      localStorage.setItem("gameProgress", JSON.stringify(progress));

      persistLevel(2);
    }
  };

  const handleBackToPortal = () => {
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>تحليل الشخصية - وزارة البيئة والمياه والزراعة</title>
      </Head>

      <div className="min-h-screen py-8 relative">
        {/* Optimized background image */}
        <div className="fixed inset-0 -z-10">
          <Image
            src="/pgbg.jpg"
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
            quality={75}
            className="object-cover"
          />
        </div>
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm"></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden mb-8 border-2 border-mewa-green-200">
            <div className="py-6 px-4 flex items-center justify-center gap-3">
              <Image
                src={logo}
                alt="شعار الوزارة"
                width={120}
                height={40}
                sizes="120px"
                className="hidden md:block"
                priority
              />
              <h1 className="text-3xl md:text-4xl font-bold text-mewa-green-700">
                تحليل الشخصية 🎭
              </h1>
            </div>
          </div>

          {/* Quiz Questions */}
          {!showResult && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-gray-700 bg-white/90 px-3 py-1 rounded-full">
                    السؤال {currentQuestionIndex + 1} من{" "}
                    {personalityQuizData.questions.length}
                  </span>
                  <span className="text-2xl">🤔</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) /
                          personalityQuizData.questions.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="card bg-white/95 backdrop-blur-md shadow-lg">
                <div className="mb-6">
                  <span className="inline-block bg-mewa-green-100 text-mewa-green-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
                    سؤال {currentQuestion.id}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-800 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </div>

                <div className="space-y-3">
                  {currentQuestion.answers.map((answer, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerClick(answer)}
                      className="btn-option hover:bg-mewa-green-50 hover:border-mewa-green-400 transition-all"
                    >
                      <span className="text-mewa-green-600 font-bold ml-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {answer.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          {showResult && result && (
            <div className="max-w-2xl mx-auto animate-pop-in">
              <div className="card bg-white/95 backdrop-blur-md shadow-lg text-center border-2 border-mewa-green-200">
                {result.image && (
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <Image
                      src={result.image}
                      alt={result.name}
                      fill
                      sizes="192px"
                      style={{ objectFit: "contain" }}
                      priority
                      quality={90}
                    />
                  </div>
                )}
                <h2 className="text-4xl font-bold text-mewa-green-700 mb-4">
                  شخصيتك: {result.name}
                </h2>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  {result.description}
                </p>

                {/* Traits */}
                <div className="bg-gradient-to-l from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-mewa-green-700 mb-4">
                    صفاتك المميزة:
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {result.traits.map((trait, index) => (
                      <span
                        key={index}
                        className="bg-white px-4 py-2 rounded-full shadow-md text-mewa-green-700 font-bold"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">
                    توزيع النقاط:
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(scores)
                      .sort(([, a], [, b]) => b - a)
                      .map(([personality, score]) => (
                        <div
                          key={personality}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {personalityQuizData.personalities[personality]
                              ?.image ? (
                              <div className="relative w-12 h-12 flex-shrink-0">
                                <Image
                                  src={
                                    personalityQuizData.personalities[
                                      personality
                                    ]?.image
                                  }
                                  alt={
                                    personalityQuizData.personalities[
                                      personality
                                    ]?.name || personality
                                  }
                                  fill
                                  sizes="48px"
                                  style={{ objectFit: "contain" }}
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <span className="text-2xl">
                                {personalityQuizData.personalities[personality]
                                  ?.emoji || "❓"}
                              </span>
                            )}
                            <span className="font-bold text-gray-700">
                              {personalityQuizData.personalities[personality]
                                ?.name || personality}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-mewa-green-500"
                                style={{
                                  width: `${
                                    (score /
                                      personalityQuizData.questions.length) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-600 w-8 text-left">
                              {score}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button onClick={handleBackToPortal} className="btn-primary">
                    العودة إلى الصفحة الرئيسية
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
