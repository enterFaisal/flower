import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { commitmentQuizData } from "../lib/content";
import Image from "next/image";
import logo from "../brand/logo.png";
import pattern1 from "../brand/Pattern (1).png";

export default function CommitmentQuiz() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [userIdentifiers, setUserIdentifiers] = useState({ id: "", phone: "" });

  // Check if user has completed previous games
  useEffect(() => {
    const savedProgress = localStorage.getItem("gameProgress");
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        if (!progress.flowerGame || !progress.personalityQuiz) {
          alert("يجب إكمال النشاطين السابقين أولاً!");
          router.replace("/");
          return;
        }
        if (progress.commitmentQuiz) {
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

  const currentQuestion = commitmentQuizData.questions[currentQuestionIndex];
  const maxScore = commitmentQuizData.questions.length * 3;

  const handleAnswerClick = (answer) => {
    const newScore = totalScore + answer.points;
    setTotalScore(newScore);

    // Move to next question or show result
    if (currentQuestionIndex < commitmentQuizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Find the appropriate result
      const finalResult = commitmentQuizData.results.find(
        (r) => newScore >= r.minScore && newScore <= r.maxScore
      );
      setResult(finalResult);
      setShowResult(true);

      // Update localStorage
      const savedProgress = localStorage.getItem("gameProgress");
      const progress = savedProgress ? JSON.parse(savedProgress) : {};
      progress.commitmentQuiz = true;
      localStorage.setItem("gameProgress", JSON.stringify(progress));

      persistLevel(3);
    }
  };

  const handleBackToPortal = () => {
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>نسبة الالتزام بالقيم - وزارة البيئة والمياه والزراعة</title>
      </Head>

      <div className="min-h-screen wave-pattern py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="relative bg-white rounded-2xl shadow-md overflow-hidden mb-8">
            <div className="absolute -top-6 left-0 right-0 opacity-30 pointer-events-none select-none">
              <div className="relative h-20">
                <Image
                  src={pattern1}
                  alt="wave pattern"
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="relative z-10 py-6 px-4 flex items-center justify-center gap-3">
              <Image
                src={logo}
                alt="شعار الوزارة"
                height={40}
                className="hidden md:block"
              />
              <h1 className="text-3xl md:text-4xl font-bold text-mewa-green-700">
                نسبة الالتزام بالقيم 📊
              </h1>
            </div>
          </div>

          {/* Quiz Questions */}
          {!showResult && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    السؤال {currentQuestionIndex + 1} من{" "}
                    {commitmentQuizData.questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentQuestion.emoji}</span>
                    <span className="text-sm font-bold text-mewa-green-700">
                      {currentQuestion.category}
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) /
                          commitmentQuizData.questions.length) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Current Score Display */}
              <div className="card mb-4 bg-gradient-to-l from-blue-50 to-green-50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-700">
                    النقاط الحالية:
                  </span>
                  <span className="text-3xl font-bold text-mewa-green-700">
                    {totalScore} / {maxScore}
                  </span>
                </div>
              </div>

              <div className="card">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{currentQuestion.emoji}</span>
                    <div>
                      <span className="inline-block bg-mewa-green-100 text-mewa-green-700 px-4 py-2 rounded-full text-sm font-bold">
                        {currentQuestion.category}
                      </span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 leading-relaxed">
                    {currentQuestion.text}
                  </h2>
                </div>

                <div className="space-y-3">
                  {currentQuestion.answers.map((answer, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerClick(answer)}
                      className="btn-option group relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="flex-1">{answer.text}</span>
                        {/* <span className="bg-mewa-green-100 text-mewa-green-700 px-3 py-1 rounded-full text-sm font-bold group-hover:bg-mewa-green-200">
                          {answer.points} نقاط
                        </span> */}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          {showResult && result && (
            <div className="max-w-2xl mx-auto animate-pop-in">
              <div className="card text-center">
                {/* Result Emoji */}
                <div className="text-8xl mb-6">{result.emoji}</div>

                {/* Score Display */}
                <div className="mb-6">
                  <div className="inline-block bg-gradient-to-l from-mewa-green-600 to-mewa-green-700 text-white px-8 py-4 rounded-2xl shadow-lg">
                    <div className="text-sm mb-1 opacity-90">نتيجتك</div>
                    <div className="text-5xl font-bold">
                      {result.percentage}
                    </div>
                    <div className="text-sm mt-1 opacity-90">
                      ({totalScore} من {maxScore} نقطة)
                    </div>
                  </div>
                </div>

                {/* Message */}
                <h2
                  className={`text-2xl font-bold mb-6 leading-relaxed ${result.color}`}
                >
                  {result.message}
                </h2>

                {/* Values Breakdown */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">
                    القيم الخمس للوزارة:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {commitmentQuizData.questions.map((q) => (
                      <div key={q.id} className="text-center">
                        <div className="text-3xl mb-2">{q.emoji}</div>
                        <div className="text-sm font-bold text-gray-700">
                          {q.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-4">
                    مستوى التزامك
                  </h3>
                  <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-mewa-green-500 to-mewa-green-600 transition-all duration-1000 flex items-center justify-end px-3"
                      style={{
                        width: `${(totalScore / maxScore) * 100}%`,
                      }}
                    >
                      <span className="text-white font-bold text-sm">
                        {Math.round((totalScore / maxScore) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Encouragement Message */}
                <div className="bg-gradient-to-l from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <p className="text-mewa-green-700 leading-relaxed">
                    {totalScore >= 13
                      ? "🌟 أنت قدوة ممتازة! استمر في تطبيق هذه القيم وشاركها مع زملائك."
                      : totalScore >= 10
                      ? "✨ أداء جيد جداً! ركّز على تعزيز القيم في ممارساتك اليومية."
                      : "💪 لديك أساس قوي! اعمل على تطوير التزامك بالقيم المؤسسية."}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center flex-wrap">
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
