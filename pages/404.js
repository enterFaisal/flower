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

      <div className="min-h-screen wave-pattern flex items-center justify-center">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 bg-mewa-green-600 text-white py-4 sm:py-6 shadow-lg relative overflow-hidden">
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
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="relative w-24 sm:w-32 md:w-40 h-12 sm:h-16 md:h-20">
                <Image
                  src={logo}
                  alt="شعار الوزارة"
                  fill
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-3 sm:px-4 py-20 sm:py-24 md:py-32">
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            {/* 404 Number */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-8xl sm:text-9xl md:text-[12rem] font-bold text-mewa-green-600 leading-none opacity-20">
                404
              </h1>
            </div>

            {/* Error Message Card */}
            <div className="card bg-white/95 backdrop-blur-md shadow-2xl border-2 border-mewa-green-200 mb-6 sm:mb-8">
              <div className="text-6xl sm:text-7xl md:text-8xl mb-4 sm:mb-6">
                🌿
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-mewa-green-700 mb-3 sm:mb-4">
                الصفحة غير موجودة
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6 sm:mb-8 leading-relaxed px-4">
                عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر.
                <br className="hidden sm:block" />
                يمكنك العودة إلى الصفحة الرئيسية والمتابعة من هناك.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button
                  onClick={handleGoHome}
                  className="btn-primary w-full sm:w-auto min-w-[200px]"
                >
                  العودة إلى الصفحة الرئيسية
                </button>
                <button
                  onClick={() => router.back()}
                  className="btn-secondary w-full sm:w-auto min-w-[200px]"
                >
                  العودة للخلف
                </button>
              </div>
            </div>

            {/* Helpful Links */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                قد تكون تبحث عن:
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <a
                  href="/"
                  className="text-mewa-green-600 hover:text-mewa-green-700 font-semibold text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-mewa-green-50 transition-colors"
                >
                  الصفحة الرئيسية
                </a>
                <a
                  href="/flower-game"
                  className="text-mewa-green-600 hover:text-mewa-green-700 font-semibold text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-mewa-green-50 transition-colors"
                >
                  بكم نزهر 🌸
                </a>
                <a
                  href="/personality-quiz"
                  className="text-mewa-green-600 hover:text-mewa-green-700 font-semibold text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-mewa-green-50 transition-colors"
                >
                  تحليل الشخصية 🎭
                </a>
                <a
                  href="/commitment-quiz"
                  className="text-mewa-green-600 hover:text-mewa-green-700 font-semibold text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-mewa-green-50 transition-colors"
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

