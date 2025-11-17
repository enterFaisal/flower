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
    const savedProgress = localStorage.getItem("gameProgress");
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        if (!progress.flowerGame) {
          alert("يجب إكمال لعبة الوَرْد أولاً!");
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
    if (!userIdentifiers.id && !userIdentifiers.phone) {
      return;
    }

    try {
      const payload = {
        ...(userIdentifiers.id ? { userId: userIdentifiers.id } : {}),
        ...(userIdentifiers.phone ? { phone: userIdentifiers.phone } : {}),
        level,
      };

      await fetch("/api/users/update-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Failed to persist level:", error);
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
