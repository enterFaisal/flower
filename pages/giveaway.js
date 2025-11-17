import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import pattern1 from "../brand/Pattern(1).png";
import { preloadRouteImages } from "../lib/imagePreloader";

export default function Giveaway() {
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const usersListRef = useRef(null);
  const winnerDisplayRef = useRef(null);

  useEffect(() => {
    preloadRouteImages("/giveaway");
    fetchEligibleUsers();
  }, []);

  const fetchEligibleUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();

      if (data.success) {
        // Filter users who have completed level 3
        const completedUsers = data.users.filter(
          (user) => user.flower && user.flower.level === 3
        );
        setEligibleUsers(completedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectWinner = () => {
    if (eligibleUsers.length === 0) return;

    setIsSelecting(true);
    setWinner(null);

    // Scroll to users list with smooth behavior
    setTimeout(() => {
      if (usersListRef.current) {
        usersListRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

    // Animate selection with multiple random picks
    let iterations = 0;
    const maxIterations = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleUsers.length);
      setWinner(eligibleUsers[randomIndex]);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        // Final random selection
        const finalIndex = Math.floor(Math.random() * eligibleUsers.length);
        setWinner(eligibleUsers[finalIndex]);
        setIsSelecting(false);

        // Scroll to winner display section after selection completes
        setTimeout(() => {
          if (winnerDisplayRef.current) {
            winnerDisplayRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 300);
      }
    }, 100);
  };

  return (
    <>
      <Head>
        <title>السحب على الجوائز - وزارة البيئة والمياه والزراعة</title>
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
                  السحب على الجوائز
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-mewa-green-100">
                  للمشاركين الذين أكملوا جميع المستويات الثلاثة
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          {/* Stats Section */}
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8 md:mb-12">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
              <div className="text-center mb-4">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3">🎁</div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-mewa-green-700 mb-2">
                  عدد المؤهلين للجائزة
                </h2>
                {isLoading ? (
                  <div className="text-lg text-gray-500">جاري التحميل...</div>
                ) : (
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-mewa-accent-500">
                    {eligibleUsers.length}
                  </div>
                )}
                <p className="text-sm sm:text-base text-gray-600 mt-2">
                  مشارك أكمل جميع المستويات الثلاثة
                </p>
              </div>
            </div>
          </div>

          {/* Winner Selection Button */}
          {!isLoading && eligibleUsers.length > 0 && (
            <div className="max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12 text-center">
              <button
                onClick={selectWinner}
                disabled={isSelecting}
                className={`btn-primary text-lg sm:text-xl py-4 sm:py-5 px-8 sm:px-12 ${
                  isSelecting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSelecting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">🎰</span>
                    جاري السحب...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    🎲 ابدأ السحب
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Winner Display */}
          {winner && !isSelecting && (
            <div
              ref={winnerDisplayRef}
              className="max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12 animate-pop-in"
            >
              <div className="bg-gradient-to-l from-mewa-yellow-50 to-mewa-accent-50 border-4 border-mewa-yellow-500 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-2xl">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl md:text-8xl mb-4 animate-bounce-slow">
                    🎉
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-mewa-green-700 mb-4">
                    مبروك! الفائز بالجائزة
                  </h3>
                  <div className="bg-white rounded-xl p-6 sm:p-8 mb-4 shadow-lg">
                    {winner.flower && (
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4">
                        <Image
                          src={winner.flower.flowerImage}
                          alt={winner.flower.seedName}
                          fill
                          sizes="(max-width: 640px) 128px, 160px"
                          style={{ objectFit: "contain" }}
                          className="drop-shadow-lg"
                        />
                      </div>
                    )}
                    <h4 className="text-2xl sm:text-3xl font-bold text-mewa-green-700 mb-2">
                      {winner.name}
                    </h4>
                    {winner.employeeId && (
                      <p className="text-base sm:text-lg text-gray-600 mb-1">
                        رقم الموظف: {winner.employeeId}
                      </p>
                    )}
                    {winner.phone && (
                      <p className="text-sm sm:text-base text-gray-500">
                        {winner.phone}
                      </p>
                    )}
                    {winner.flower && (
                      <p className="text-base sm:text-lg text-mewa-accent-600 font-semibold mt-2">
                        {winner.flower.seedName}
                      </p>
                    )}
                  </div>
                  <div className="text-4xl sm:text-5xl">🎁</div>
                </div>
              </div>
            </div>
          )}

          {/* Eligible Users List */}
          {!isLoading && eligibleUsers.length > 0 && (
            <div ref={usersListRef} className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-mewa-green-700 mb-4 sm:mb-6 text-center">
                  قائمة المؤهلين
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {eligibleUsers.map((user, index) => (
                    <div
                      key={user.id || index}
                      className={`bg-gradient-to-br from-mewa-green-50 to-mewa-accent-50 rounded-lg p-4 sm:p-5 border-2 transition-all duration-300 ${
                        winner && winner.id === user.id
                          ? "border-mewa-yellow-500 shadow-xl scale-105"
                          : "border-mewa-green-200 hover:border-mewa-green-400 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        {user.flower && (
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                            <Image
                              src={user.flower.flowerImage}
                              alt={user.flower.seedName}
                              fill
                              sizes="(max-width: 640px) 64px, 80px"
                              style={{ objectFit: "contain" }}
                              className="drop-shadow-md"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-mewa-green-700 text-base sm:text-lg mb-1 truncate">
                            {user.name}
                          </h4>
                          {user.employeeId && (
                            <p className="text-sm text-gray-600 truncate">
                              {user.employeeId}
                            </p>
                          )}
                          {user.flower && (
                            <p className="text-xs sm:text-sm text-mewa-accent-600 font-semibold mt-1">
                              {user.flower.seedName}
                            </p>
                          )}
                        </div>
                        {winner && winner.id === user.id && (
                          <div className="text-3xl sm:text-4xl animate-bounce-slow">
                            👑
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && eligibleUsers.length === 0 && (
            <div className="max-w-2xl mx-auto text-center animate-fade-in">
              <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12">
                <div className="text-6xl sm:text-7xl mb-4">🌱</div>
                <h3 className="text-xl sm:text-2xl font-bold text-mewa-green-700 mb-3">
                  لا يوجد مؤهلين حالياً
                </h3>
                <p className="text-base sm:text-lg text-gray-600">
                  لم يكمل أي مشارك جميع المستويات الثلاثة بعد
                </p>
              </div>
            </div>
          )}

          {/* Refresh Button */}
          {!isLoading && (
            <div className="max-w-2xl mx-auto mt-6 sm:mt-8 text-center">
              <button onClick={fetchEligibleUsers} className="btn-secondary">
                🔄 تحديث القائمة
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
