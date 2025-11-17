import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { commitmentQuizData } from "../lib/content";
import Image from "next/image";
import logo from "../brand/logo.png";
import pattern1 from "../brand/Pattern(1).png";
import { preloadRouteImages } from "../lib/imagePreloader";
import { io } from "socket.io-client";

const CategoryIcon = ({ icon, alt, size = 48 }) => {
  if (icon) {
    return (
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Image
          src={icon}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-contain"
        />
      </div>
    );
  }

  return null;
};

const dropletMilestones = [
  {
    min: 10,
    max: 20,
    instruction: "علّق القطرة الصفراء في الغيمة",
    image: "/water/yallow.png",
    alt: "القطرة الصفراء",
    colorName: "القطرة الصفراء",
    colorHex: "#F2D64B",
  },
  {
    min: 30,
    max: 40,
    instruction: "علّق القطرة الخضراء الغامقة في الغيمة",
    image: "/water/darkgreen.png",
    alt: "القطرة الخضراء الغامقة",
    colorName: "القطرة الخضراء الغامقة",
    colorHex: "#1E8144",
  },
  {
    min: 50,
    max: 60,
    instruction: "علّق القطرة الخضراء الفاتحة في الغيمة",
    image: "/water/green.png",
    alt: "القطرة الخضراء الفاتحة",
    colorName: "القطرة الخضراء الفاتحة",
    colorHex: "#69B868",
  },
  {
    min: 70,
    max: 80,
    instruction: "علّق القطرة الزرقاء الغامقة في الغيمة",
    image: "/water/darkblue.png",
    alt: "القطرة الزرقاء الغامقة",
    colorName: "القطرة الزرقاء الغامقة",
    colorHex: "#1A4B8B",
  },
  {
    min: 90,
    max: 100,
    instruction: "علّق القطرة السماوية في الغيمة",
    image: "/water/blue.png",
    alt: "القطرة السماوية",
    colorName: "القطرة السماوية",
    colorHex: "#5BC0F8",
  },
];

let socket;

export default function CommitmentQuiz() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [finalPercentage, setFinalPercentage] = useState(0);
  const [userIdentifiers, setUserIdentifiers] = useState({ id: "", phone: "" });

  // Check completion status when page becomes visible (prevents back button replay)
  useEffect(() => {
    const checkCompletionOnVisibility = async () => {
      const savedUserData = localStorage.getItem("userData");
      if (!savedUserData) return;

      try {
        const userData = JSON.parse(savedUserData);
        const userId = userData.id || localStorage.getItem("userId");
        const userPhone = userData.phone || "";

        if (!userId && !userPhone) return;

        const response = await fetch("/api/users/get-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...(userId ? { userId } : {}),
            ...(userPhone ? { phone: userPhone } : {}),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            const serverLevel = data.user.flower?.level || 0;
            if (serverLevel >= 3 && !showResult) {
              // User already completed, redirect if not on result page
              alert("لقد أكملت هذا النشاط مسبقًا.");
              // send the user to mewa-event.uselines.com/
              window.location.href = "https://mewa-event.uselines.com/";
            }
          }
        } else {
          // send the user to mewa-event.uselines.com/
          window.location.href = "https://mewa-event.uselines.com/";
          return;
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
      }
    };

    // Check on visibility change (when user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkCompletionOnVisibility();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Also check on focus (when user switches back to tab)
    window.addEventListener("focus", checkCompletionOnVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", checkCompletionOnVisibility);
    };
  }, [showResult, router]);

  // Preload images on mount
  useEffect(() => {
    preloadRouteImages("/commitment-quiz");
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const socketInitializer = async () => {
      try {
        const response = await fetch("/api/socket");
        if (!response.ok) {
          console.warn(
            "Socket initialization returned non-OK status:",
            response.status
          );
          // Continue anyway, socket might already be initialized
        }
        socket = io({
          path: "/api/socket",
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5,
        });

        socket.on("connect", () => {
          console.log("[Commitment Quiz] Connected to socket server");
        });

        socket.on("connect_error", (error) => {
          console.warn("[Commitment Quiz] Socket connection error:", error);
        });
      } catch (error) {
        console.warn("[Commitment Quiz] Failed to initialize socket:", error);
        // Continue without socket - will fallback to HTTP API
      }
    };

    socketInitializer();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Retry any pending level updates on mount
  useEffect(() => {
    const retryPendingUpdate = async () => {
      try {
        const pendingUpdate = localStorage.getItem("pendingLevelUpdate");
        if (pendingUpdate) {
          const backupData = JSON.parse(pendingUpdate);
          console.log(
            "[Retry Pending] Found pending level update, retrying...",
            backupData
          );

          // Get user identifiers from localStorage
          const savedUserData = localStorage.getItem("userData");
          let userId = "";
          let phone = "";

          if (savedUserData) {
            try {
              const userData = JSON.parse(savedUserData);
              userId = userData.id || backupData.userId || "";
              phone = userData.phone || backupData.phone || "";
            } catch (e) {
              userId = backupData.userId || "";
              phone = backupData.phone || "";
            }
          } else {
            userId = backupData.userId || "";
            phone = backupData.phone || "";
          }

          if (!userId && !phone) {
            console.warn(
              "[Retry Pending] No user identifiers found, cannot retry"
            );
            return;
          }

          // Call persistLevel with the stored data
          const success = await persistLevel(
            backupData.level,
            backupData.commitmentPercentage
          );

          if (success) {
            localStorage.removeItem("pendingLevelUpdate");
            console.log(
              "[Retry Pending] Successfully retried pending level update"
            );
          }
        }
      } catch (error) {
        console.error("[Retry Pending] Error retrying pending update:", error);
      }
    };

    retryPendingUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if user has completed previous games
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
                console.warn(
                  "User check API returned non-OK status:",
                  response.status
                );
                // Continue anyway - don't block user on API errors
                return;
              }

              const data = await response.json();

              // Only act if we got a valid response with success: true
              // If user doesn't exist in users.json, log a warning but don't block them
              // This prevents issues on mobile where network might be unreliable
              if (data.success === true && data.exists === false) {
                console.warn(
                  "User ID not found in users.json, but user has localStorage data. Allowing access."
                );
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
              if (error.name === "AbortError") {
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

      // Check server-side level to prevent replay (more secure than localStorage)
      const userId = userData?.id || localStorage.getItem("userId");
      const userPhone = userData?.phone || "";

      if (userId || userPhone) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch("/api/users/get-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...(userId ? { userId } : {}),
              ...(userPhone ? { phone: userPhone } : {}),
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              const serverLevel = data.user.flower?.level || 0;
              // Must complete previous games (level >= 2) before commitment quiz
              if (serverLevel < 2) {
                alert("يجب إكمال النشاطين السابقين أولاً!");
                window.location.href = "https://mewa-event.uselines.com/";
                return;
              }
              // If user has level >= 3, they already completed commitment quiz
              if (serverLevel >= 3) {
                alert("لقد أكملت هذا النشاط مسبقًا.");
                // send the user to mewa-event.uselines.com/
                window.location.href = "https://mewa-event.uselines.com/";
              }
            }
          }
        } catch (error) {
          if (error.name === "AbortError") {
            console.warn(
              "User check timed out - checking localStorage as fallback"
            );
          } else {
            console.error("Error checking server-side level:", error);
          }
        }
      }

      // Fallback to localStorage check if server check fails or no user ID
      const savedProgress = localStorage.getItem("gameProgress");
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          if (!progress.flowerGame || !progress.personalityQuiz) {
            alert("يجب إكمال النشاطين السابقين أولاً!");
            window.location.href = "https://mewa-event.uselines.com/";
            return;
          }
          if (progress.commitmentQuiz) {
            alert("لقد أكملت هذا النشاط مسبقًا.");
            // send the user to mewa-event.uselines.com/
            window.location.href = "https://mewa-event.uselines.com/";
          }
        } catch (e) {
          console.error("Error parsing game progress:", e);
        }
      } else {
        window.location.href = "https://mewa-event.uselines.com/";
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

  const persistLevel = async (
    level,
    commitmentPercentageValue,
    retryCount = 0
  ) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    const SOCKET_TIMEOUT = 5000; // 5 seconds

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
      return false;
    }

    const payload = {
      ...(userId ? { userId } : {}),
      ...(phone ? { phone } : {}),
      level,
      ...(typeof commitmentPercentageValue === "number"
        ? { commitmentPercentage: commitmentPercentageValue }
        : {}),
    };

    console.log(
      `[Persist Level] Attempt ${retryCount + 1}/${
        MAX_RETRIES + 1
      }: Persisting level ${level} for user:`,
      { userId, phone }
    );

    // Try WebSocket first, fallback to HTTP API
    if (socket && socket.connected) {
      try {
        console.log("[Persist Level] Using WebSocket to update level");

        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Socket timeout"));
          }, SOCKET_TIMEOUT);

          const successHandler = (data) => {
            clearTimeout(timeout);
            socket.off("level:update:success", successHandler);
            socket.off("level:update:error", errorHandler);
            resolve(data);
          };

          const errorHandler = (error) => {
            clearTimeout(timeout);
            socket.off("level:update:success", successHandler);
            socket.off("level:update:error", errorHandler);
            reject(new Error(error.error || "Socket update failed"));
          };

          socket.once("level:update:success", successHandler);
          socket.once("level:update:error", errorHandler);
          socket.emit("level:update", payload);
        });

        // Verify that the level was actually updated
        if (result.success && result.finalLevel !== undefined) {
          if (result.finalLevel >= level) {
            console.log(
              `[Persist Level] WebSocket Success! Level persisted: ${result.finalLevel} (requested: ${level})`
            );
            return true;
          } else {
            console.warn(
              `[Persist Level] Level mismatch: got ${result.finalLevel}, expected ${level}. Retrying...`
            );
            throw new Error("Level mismatch in response");
          }
        } else {
          throw new Error("Invalid response format");
        }
      } catch (socketError) {
        console.warn(
          `[Persist Level] WebSocket failed: ${socketError.message}, falling back to HTTP API`
        );
        // Fall through to HTTP API fallback
      }
    }

    // Fallback to HTTP API if WebSocket is not available or failed
    try {
      console.log("[Persist Level] Using HTTP API to update level");

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
          `API returned ${response.status}: ${
            errorData.error || "Unknown error"
          }`
        );
      }

      const result = await response.json();

      // Verify that the level was actually updated
      if (result.success && result.finalLevel !== undefined) {
        if (result.finalLevel >= level) {
          console.log(
            `[Persist Level] HTTP API Success! Level persisted: ${result.finalLevel} (requested: ${level})`
          );
          return true;
        } else {
          console.warn(
            `[Persist Level] Level mismatch: got ${result.finalLevel}, expected ${level}. Retrying...`
          );
          throw new Error("Level mismatch in response");
        }
      } else {
        console.warn(
          "[Persist Level] Response missing verification data. Retrying..."
        );
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error(
        `[Persist Level] Attempt ${retryCount + 1} failed:`,
        error.message
      );

      // Retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(
          `[Persist Level] Retrying in ${RETRY_DELAY}ms... (${
            retryCount + 1
          }/${MAX_RETRIES})`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return persistLevel(level, commitmentPercentageValue, retryCount + 1);
      } else {
        console.error(
          "[Persist Level] All retry attempts failed. Level may not be persisted.",
          error
        );
        // Store in localStorage as backup so we can retry later
        try {
          const backupData = {
            level,
            commitmentPercentage: commitmentPercentageValue,
            userId,
            phone,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem(
            "pendingLevelUpdate",
            JSON.stringify(backupData)
          );
          console.log(
            "[Persist Level] Stored backup in localStorage for later retry"
          );
        } catch (e) {
          console.error("[Persist Level] Failed to store backup:", e);
        }
        return false;
      }
    }
  };

  const currentQuestion = commitmentQuizData.questions[currentQuestionIndex];
  const maxScore = commitmentQuizData.questions.length * 3;
  const commitmentPercentage = Math.round((totalScore / maxScore) * 100);

  // Calculate droplet instruction for result display
  const dropletInstruction =
    showResult && finalPercentage > 0
      ? dropletMilestones.find(
          (milestone) =>
            finalPercentage >= milestone.min && finalPercentage <= milestone.max
        )
      : null;

  const handleAnswerClick = async (answer) => {
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
      const calculatedFinalPercentage = Math.round((newScore / maxScore) * 100);
      setFinalPercentage(calculatedFinalPercentage);
      setResult(finalResult);
      setTotalScore(newScore);
      setShowResult(true);

      const finalDropletInstruction = dropletMilestones.find(
        (milestone) =>
          calculatedFinalPercentage >= milestone.min &&
          calculatedFinalPercentage <= milestone.max
      );

      if (finalDropletInstruction) {
        localStorage.setItem(
          "commitmentDroplet",
          JSON.stringify({
            colorName: finalDropletInstruction.colorName,
            colorHex: finalDropletInstruction.colorHex,
            image: finalDropletInstruction.image,
            alt: finalDropletInstruction.alt,
            percentage: calculatedFinalPercentage,
          })
        );
      } else {
        localStorage.removeItem("commitmentDroplet");
      }

      // Update localStorage
      const savedProgress = localStorage.getItem("gameProgress");
      const progress = savedProgress ? JSON.parse(savedProgress) : {};
      progress.commitmentQuiz = true;
      localStorage.setItem("gameProgress", JSON.stringify(progress));

      // Persist level and wait for it to complete (with retries)
      const success = await persistLevel(3, calculatedFinalPercentage);
      if (!success) {
        console.warn(
          "[Commitment Quiz] Level update failed, but user can continue. Update will be retried."
        );
      }
    }
  };

  const handleBackToPortal = () => {
    window.location.href = "https://mewa-event.uselines.com/";
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
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              </div>
            </div>
            <div className="relative z-10 py-6 px-4 flex items-center justify-center gap-3">
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
                نسبة الالتزام بالقيم
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
                    <CategoryIcon
                      icon={currentQuestion.icon}
                      alt={`أيقونة ${currentQuestion.category}`}
                      size={40}
                    />
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
                    <CategoryIcon
                      icon={currentQuestion.icon}
                      alt={`أيقونة ${currentQuestion.category}`}
                      size={72}
                    />
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
                {/* Result Droplet */}
                <div className="flex justify-center mb-6">
                  {dropletInstruction ? (
                    <div className="relative w-40 h-40">
                      <Image
                        src={dropletInstruction.image}
                        alt={dropletInstruction.alt}
                        fill
                        sizes="160px"
                        className="object-contain drop-shadow-lg"
                      />
                    </div>
                  ) : result?.drop ? (
                    <div className="relative w-40 h-40">
                      <Image
                        src={result.drop.image}
                        alt={result.drop.name}
                        fill
                        sizes="160px"
                        className="object-contain drop-shadow-lg"
                      />
                    </div>
                  ) : null}
                </div>

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
                        <div className="flex justify-center mb-2">
                          <CategoryIcon
                            icon={q.icon}
                            alt={`أيقونة ${q.category}`}
                            size={56}
                          />
                        </div>
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
                        width: `${finalPercentage}%`,
                      }}
                    >
                      <span className="text-white font-bold text-sm">
                        {finalPercentage}%
                      </span>
                    </div>
                  </div>
                </div>

                {(dropletInstruction || result?.drop) && (
                  <div className="bg-white border-2 border-mewa-green-100 rounded-2xl p-6 mb-6 text-center flex flex-col items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-mewa-green-700 mb-1">
                        توجّه إلى الغيمة وعلّق قطرتك
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {dropletInstruction?.instruction ||
                          result?.drop?.instruction}
                      </p>
                    </div>
                    <div className="relative w-36 h-36">
                      <Image
                        src={dropletInstruction?.image || result?.drop?.image}
                        alt={dropletInstruction?.alt || result?.drop?.name}
                        fill
                        sizes="144px"
                        className="object-contain drop-shadow-lg"
                      />
                    </div>
                    <div className="text-sm font-bold text-mewa-green-800">
                      لون قطرتك:{" "}
                      {dropletInstruction?.colorName || result?.drop?.name}
                    </div>
                    <p className="text-sm text-gray-500">
                      نسبة الالتزام الحالية: {finalPercentage}%
                    </p>
                  </div>
                )}

                {/* Encouragement Message */}
                <div className="bg-gradient-to-l from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <p className="text-mewa-green-700 leading-relaxed">
                    {totalScore >= 13
                      ? "أنت قدوة ممتازة! استمر في تطبيق هذه القيم وشاركها مع زملائك."
                      : totalScore >= 10
                      ? "أداء جيد جداً! ركّز على تعزيز القيم في ممارساتك اليومية."
                      : "لديك أساس قوي! اعمل على تطوير التزامك بالقيم المؤسسية."}
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
