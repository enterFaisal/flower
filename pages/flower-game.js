import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import { flowerGameData } from "../lib/content";
import Image from "next/image";
import logo from "../brand/logo.png";
import WateringAnimation from "../components/WateringAnimation";
import AnimatedIcon from "../components/AnimatedIcon";

let socket;

export default function FlowerGame() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("select"); // select, questions, result
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userId, setUserId] = useState("");
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showGrowthAnimation, setShowGrowthAnimation] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Preload all flower images on mount for faster loading
  useEffect(() => {
    const allImages = [
      "/flowers/بذور.png",
      "/flowers/water.png",
      "/flowers/watering.png",
      "/flowers/sun.png",
      "/flowers/love.png",
    ];

    // Add all flower images
    flowerGameData.forEach((plant) => {
      allImages.push(plant.seedImage);
      allImages.push(plant.flowerImageStage1);
      allImages.push(plant.flowerImage);
    });

    // Preload in background
    allImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Preload images for selected plant
  useEffect(() => {
    if (selectedPlant) {
      const imagesToPreload = [
        selectedPlant.seedImage,
        selectedPlant.flowerImageStage1,
        selectedPlant.flowerImage,
        "/flowers/water.png",
        "/flowers/watering.png",
        "/flowers/sun.png",
        "/flowers/love.png",
      ];

      Promise.all(
        imagesToPreload.map((src) => {
          return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = reject;
          });
        })
      )
        .then(() => {
          setImagesPreloaded(true);
        })
        .catch((err) => {
          console.error("Error preloading images:", err);
          setImagesPreloaded(true); // Continue anyway
        });
    }
  }, [selectedPlant]);

  useEffect(() => {
    // Get user data from localStorage
    const savedUserData = localStorage.getItem("userData");
    if (!savedUserData) {
      router.push("/register");
      return;
    }

    try {
      const userData = JSON.parse(savedUserData);
      setUserName(userData.name);
      setUserPhone(userData.phone);
      setUserId(userData.id || "");
    } catch (e) {
      console.error("Error parsing user data:", e);
      router.push("/register");
      return;
    }

    const savedProgress = localStorage.getItem("gameProgress");
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        if (progress.flowerGame) {
          alert("لقد أكملت هذا النشاط مسبقًا.");
          router.replace("/");
          return;
        }
      } catch (e) {
        console.error("Error parsing game progress:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Initialize socket connection
    const socketInitializer = async () => {
      await fetch("/api/socket");
      socket = io({
        path: "/api/socket",
      });

      socket.on("connect", () => {
        console.log("Connected to socket server");
      });
    };

    socketInitializer();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handlePlantSelect = (plant) => {
    setSelectedPlant(plant);
    setCurrentStep("questions");
  };

  const handleAnswerSelect = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < selectedPlant.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered - wait for images to preload before showing animation
      const imagesToPreload = [
        selectedPlant.seedImage,
        selectedPlant.flowerImageStage1,
        selectedPlant.flowerImage,
        "/flowers/water.png",
        "/flowers/watering.png",
        "/flowers/sun.png",
        "/flowers/love.png",
      ];

      console.log("🌱 Selected Plant:", selectedPlant.seedName);
      console.log("📁 Seed Image:", selectedPlant.seedImage);
      console.log("📁 Stage 1 Image:", selectedPlant.flowerImageStage1);
      console.log("📁 Final Image:", selectedPlant.flowerImage);
      console.log("📋 All images to preload:", imagesToPreload);

      // Show loading state
      setImagesPreloaded(false);
      setShowGrowthAnimation(true);

      // Preload all images first
      Promise.all(
        imagesToPreload.map((src) => {
          return new Promise((resolve) => {
            const img = new window.Image();
            img.src = src;
            img.onload = () => {
              console.log("✅ Loaded:", src);
              resolve();
            };
            img.onerror = (err) => {
              console.error("❌ Failed to load:", src, err);
              resolve(); // Continue even if one fails
            };
          });
        })
      ).then(() => {
        console.log("🎉 All images loaded, starting animation!");
        // Images are loaded, now start the animation
        setImagesPreloaded(true);

        // After animation, show result
        setTimeout(() => {
          setShowGrowthAnimation(false);
          setCurrentStep("result");

          // Emit to socket
          if (socket) {
            socket.emit("flower:new", {
              userId: userId,
              userName: userName,
              phone: userPhone,
              seedName: selectedPlant.seedName,
              flowerImage: selectedPlant.flowerImage,
              level: 1, // First completed activity counts as level 1
            });
          }

          // Update localStorage
          const savedProgress = localStorage.getItem("gameProgress");
          const progress = savedProgress ? JSON.parse(savedProgress) : {};
          progress.flowerGame = true;
          localStorage.setItem("gameProgress", JSON.stringify(progress));
        }, 6000); // 6 seconds for growth animation
      });
    }
  };

  const handleBackToPortal = () => {
    router.push("/");
  };

  const currentQuestion = selectedPlant?.questions[currentQuestionIndex];

  return (
    <>
      <Head>
        <title>لعبة الوَرْد - وزارة البيئة والمياه والزراعة</title>
      </Head>

      <div
        className="min-h-screen py-8 relative"
        style={{
          backgroundImage: "url(/fgbg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden mb-8 border-2 border-mewa-green-200">
            <div className="py-6 px-4 flex items-center justify-center gap-3">
              <Image
                src={logo}
                alt="شعار الوزارة"
                height={40}
                className="hidden md:block"
              />
              <h1 className="text-3xl md:text-4xl font-bold text-mewa-green-700">
                لعبة الوَرْد 🌸
              </h1>
            </div>
          </div>

          {/* Plant Selection Step */}
          {currentStep === "select" && (
            <div className="max-w-5xl mx-auto animate-fade-in">
              <div className="card bg-white/95 backdrop-blur-md shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-mewa-green-700 mb-4 text-center">
                  مرحباً {userName}! اختر نبتتك 🌱
                </h2>
                <p className="text-gray-700 text-center text-lg">
                  اختر إحدى النباتات السعودية الأصيلة لتبدأ رحلتك
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {flowerGameData.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => handlePlantSelect(plant)}
                    className="group relative bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-mewa-green-200 hover:border-mewa-green-400"
                  >
                    <div className="relative w-full h-32 md:h-48 mb-3 md:mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100">
                      <Image
                        src={plant.flowerImage}
                        alt={plant.seedName}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        style={{ objectFit: "contain" }}
                        className="group-hover:scale-110 transition-transform duration-300"
                        priority
                      />
                    </div>
                    <div className="text-lg md:text-2xl font-bold text-mewa-green-700 group-hover:text-mewa-green-600">
                      {plant.seedName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Questions Step */}
          {currentStep === "questions" &&
            currentQuestion &&
            !showGrowthAnimation && (
              <div className="max-w-3xl mx-auto animate-fade-in">
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-700 bg-white/90 px-3 py-1 rounded-full">
                      السؤال {currentQuestionIndex + 1} من{" "}
                      {selectedPlant.questions.length}
                    </span>
                    {currentQuestion.icon && (
                      <div className="relative w-12 h-12">
                        <Image
                          src={currentQuestion.icon}
                          alt={currentQuestion.type}
                          fill
                          sizes="48px"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) /
                            selectedPlant.questions.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="card bg-white/95 backdrop-blur-md shadow-lg mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {currentQuestion.icon && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={currentQuestion.icon}
                          alt={currentQuestion.type}
                          fill
                          sizes="64px"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-mewa-green-600">
                      {currentQuestion.type}
                    </h3>
                  </div>
                  <p className="text-xl text-gray-800 mb-6 leading-relaxed">
                    {currentQuestion.text}
                  </p>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className="btn-option hover:bg-mewa-green-50 hover:border-mewa-green-400 transition-all"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Growth Animation */}
          {showGrowthAnimation && selectedPlant && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100 overflow-hidden">
              {!imagesPreloaded ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-mewa-green-600 mx-auto mb-4"></div>
                  <p className="text-mewa-green-700 font-bold text-xl">
                    جاري تحضير نبتتك... 🌱
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <h2 className="text-3xl font-bold text-mewa-green-700 mb-8 animate-fade-in">
                    نبتتك تنمو الآن... 🌱
                  </h2>

                  <div className="relative w-full max-w-[600px] h-[400px] md:h-[600px] mx-auto">
                    {/* Soil/Ground */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 md:h-64 bg-gradient-to-t from-amber-900 via-amber-800 to-amber-700 rounded-t-[50%]"></div>

                    {/* Flower Growth Stages */}
                    <div className="absolute bottom-16 md:bottom-32 left-1/2 -translate-x-1/2 w-[180px] h-[180px] md:w-[260px] md:h-[260px] flex items-center justify-center">
                      {/* Phase 1: Seed */}
                      <div className="absolute inset-0 flex items-center justify-center animate-flower-phase-1">
                        <Image
                          src={selectedPlant.seedImage}
                          alt="بذور"
                          width={110}
                          height={110}
                          className="object-contain w-16 h-16 md:w-28 md:h-28"
                        />
                      </div>
                      {/* Phase 2: Sprout */}
                      <div className="absolute inset-0 flex items-center justify-center animate-flower-phase-2">
                        <Image
                          src={selectedPlant.flowerImageStage1}
                          alt={`${selectedPlant.seedName} - مرحلة النمو`}
                          width={180}
                          height={180}
                          className="object-contain w-32 h-32 md:w-44 md:h-44"
                        />
                      </div>
                      {/* Phase 3: Full Flower */}
                      <div className="absolute inset-0 flex items-center justify-center animate-flower-phase-3">
                        <Image
                          src={selectedPlant.flowerImage}
                          alt={`${selectedPlant.seedName} - مرحلة الإزهار الكامل`}
                          width={260}
                          height={260}
                          className="object-contain w-44 h-44 md:w-64 md:h-64"
                        />
                      </div>
                    </div>

                    {/* --- IMPROVED Animated Helper Icons --- */}

                    {/* 1. Watering Can & Water Animation */}
                    <div className="absolute top-[0%] left-[55%] md:left-[60%] w-24 h-24 md:w-32 md:h-32 animate-watering-container">
                      <Image
                        src="/flowers/watering.png"
                        alt="Watering can"
                        width={128}
                        height={128}
                        className="object-contain w-full h-full animate-watering-can"
                      />
                      <Image
                        src="/flowers/water.png"
                        alt="Water drops"
                        width={64}
                        height={64}
                        className="object-contain absolute top-[100%] right-[90%] w-10 h-10 md:w-16 md:h-16 animate-water-drops"
                      />
                    </div>

                    {/* 2. Sun Animation */}
                    <AnimatedIcon
                      src="/flowers/sun.png"
                      alt="sun"
                      size="w-20 h-20 md:w-28 md:h-28" // Responsive size
                      position="top-[20%] left-[10%] md:top-[25%] md:left-[15%]" // Responsive position
                      animationClass="animate-helper-sun"
                    />

                    {/* 3. Care/Love Animation */}
                    <AnimatedIcon
                      src="/flowers/love.png"
                      alt="care"
                      size="w-20 h-20 md:w-28 md:h-28" // Responsive size
                      position="bottom-[35%] left-[15%] md:bottom-[40%] md:left-[20%]" // Responsive position
                      animationClass="animate-helper-care"
                    />
                  </div>

                  <p className="text-2xl text-mewa-green-600 font-bold mt-4 animate-pulse">
                    {selectedPlant.seedName}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Result Step */}
          {currentStep === "result" && selectedPlant && (
            <div className="max-w-2xl mx-auto animate-pop-in">
              <div className="card bg-white/95 backdrop-blur-md shadow-lg text-center border-2 border-mewa-green-200">
                <div className="relative w-64 h-64 mx-auto mb-6">
                  <Image
                    src={selectedPlant.flowerImage}
                    alt={selectedPlant.seedName}
                    fill
                    sizes="256px"
                    style={{ objectFit: "contain" }}
                    className="animate-bounce-slow"
                    priority
                  />
                </div>
                <h2 className="text-3xl font-bold text-mewa-green-700 mb-2">
                  مبروك {userName}! 🎉
                </h2>
                <h3 className="text-2xl font-bold text-mewa-green-600 mb-4">
                  {selectedPlant.seedName}
                </h3>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">
                  {selectedPlant.resultQuote}
                </p>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 mb-6">
                  <p className="text-lg font-bold text-mewa-green-700">
                    تمت إضافة وردتك إلى حديقة الوزارة! 🌿
                  </p>
                </div>
                <button onClick={handleBackToPortal} className="btn-primary">
                  العودة إلى الصفحة الرئيسية
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
