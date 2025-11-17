import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../brand/logo.png";
import pattern1 from "../brand/Pattern(1).png";

export default function Custom404() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>404 - الصفحة غير موجودة | وزارة البيئة والمياه والزراعة</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen wave-pattern flex flex-col">
        {/* Header - Smaller on mobile */}
        <header className="bg-mewa-green-600 text-white py-3 sm:py-4 md:py-6 shadow-lg relative overflow-hidden">
          {/* Pattern decoration */}
          <div className="absolute -bottom-4 left-0 right-0 opacity-30 pointer-events-none select-none">
            <div className="relative h-12 sm:h-16 md:h-20 lg:h-24">
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
            <div className="flex items-center justify-center">
              <div className="relative w-20 h-10 sm:w-24 sm:h-12 md:w-32 md:h-16 lg:w-40 lg:h-20">
                <Image
                  src={logo}
                  alt="شعار الوزارة"
                  fill
                  sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 128px, 160px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Better mobile spacing */}
        <main className="flex-1 flex items-center justify-center container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-24">
          <div className="max-w-2xl mx-auto text-center animate-fade-in w-full">
            {/* 404 Number - Smaller on mobile */}
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-bold text-mewa-green-600 leading-none opacity-20">
                404
              </h1>
            </div>

            {/* Error Message Card - Better mobile padding */}
            <div className="card bg-white/95 backdrop-blur-md shadow-2xl border-2 border-mewa-green-200 mb-4 sm:mb-6 md:mb-8 p-4 sm:p-5 md:p-6">
              <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-3 sm:mb-4 md:mb-6">
                🌿
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-mewa-green-700 mb-2 sm:mb-3 md:mb-4 leading-tight">
                الصفحة غير موجودة
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 md:mb-8 leading-relaxed px-2 sm:px-4">
                عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
                <br className="hidden sm:block" />
                يمكنك العودة إلى الصفحة الرئيسية والمتابعة من هناك.
              </p>

              {/* Action Buttons - Full width on mobile, better touch targets */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-stretch sm:items-center">
                <button
                  onClick={handleGoHome}
                  className="btn-primary w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] py-3 sm:py-3 text-sm sm:text-base"
                >
                  العودة إلى الصفحة الرئيسية
                </button>
                <button
                  onClick={() => router.back()}
                  className="btn-secondary w-full sm:w-auto sm:min-w-[180px] md:min-w-[200px] py-3 sm:py-3 text-sm sm:text-base"
                >
                  العودة للخلف
                </button>
              </div>
            </div>

            {/* Helpful Links - Better mobile layout */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 md:mb-4 font-semibold">
                قد تكون تبحث عن:
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-2 md:gap-3">
                <a
                  href="/"
                  className="text-mewa-green-600 hover:text-mewa-green-700 active:text-mewa-green-800 font-semibold text-xs sm:text-sm md:text-base px-3 py-2.5 sm:py-2 rounded-lg hover:bg-mewa-green-50 active:bg-mewa-green-100 transition-colors touch-manipulation min-h-[44px] flex items-center justify-center"
                >
                  الصفحة الرئيسية
                </a>
                <a
                  href="/flower-game"
                  className="text-mewa-green-600 hover:text-mewa-green-700 active:text-mewa-green-800 font-semibold text-xs sm:text-sm md:text-base px-3 py-2.5 sm:py-2 rounded-lg hover:bg-mewa-green-50 active:bg-mewa-green-100 transition-colors touch-manipulation min-h-[44px] flex items-center justify-center"
                >
                  بكم نزهر 🌸
                </a>
                <a
                  href="/personality-quiz"
                  className="text-mewa-green-600 hover:text-mewa-green-700 active:text-mewa-green-800 font-semibold text-xs sm:text-sm md:text-base px-3 py-2.5 sm:py-2 rounded-lg hover:bg-mewa-green-50 active:bg-mewa-green-100 transition-colors touch-manipulation min-h-[44px] flex items-center justify-center"
                >
                  تحليل الشخصية 🎭
                </a>
                <a
                  href="/commitment-quiz"
                  className="text-mewa-green-600 hover:text-mewa-green-700 active:text-mewa-green-800 font-semibold text-xs sm:text-sm md:text-base px-3 py-2.5 sm:py-2 rounded-lg hover:bg-mewa-green-50 active:bg-mewa-green-100 transition-colors touch-manipulation min-h-[44px] flex items-center justify-center"
                >
                  نسبة الالتزام 🌧️
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

