import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNameError("");

    // Validate that name has exactly 3 parts
    const nameParts = userName
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0);
    if (nameParts.length !== 3) {
      setNameError(
        "يجب إدخال الاسم الكامل مكون من 3 أسماء (الاسم الأول، الاسم الأوسط، اسم العائلة)"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Send user data to server
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userName.trim(),
          phone: phoneNumber.trim(),
          employeeId: employeeId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Also save user data to localStorage for offline access
      const userData = {
        id: data.user.id || data.user.phone,
        name: userName.trim(),
        phone: phoneNumber.trim(),
        employeeId: employeeId.trim(),
        registeredAt: data.user.registeredAt,
      };
      localStorage.setItem("userData", JSON.stringify(userData));

      // Reset game progress for new user
      const gameProgress = {
        flowerGame: false,
        personalityQuiz: false,
        commitmentQuiz: false,
      };
      localStorage.setItem("gameProgress", JSON.stringify(gameProgress));

      // Redirect to main portal
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Registration error:", error);
      alert("حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>التسجيل - وزارة البيئة والمياه والزراعة</title>
      </Head>

      <div className="min-h-screen wave-pattern flex items-center justify-center py-8 px-4">
        <div className="max-w-lg w-full animate-fade-in">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">🌿</div>
            <h1 className="text-4xl md:text-5xl font-bold text-mewa-green-700 mb-2">
              مرحباً بك
            </h1>
            <p className="text-xl text-gray-600">
              وزارة البيئة والمياه والزراعة
            </p>
          </div>

          {/* Registration Card */}
          <div className="card">
            <h2 className="text-2xl font-bold text-mewa-green-700 mb-6 text-center">
              التسجيل في الأنشطة
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  الاسم الكامل (3 أسماء) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`input-field ${nameError ? "border-red-500" : ""}`}
                  placeholder="الاسم الأول الاسم الأوسط اسم العائلة"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setNameError("");
                  }}
                  required
                  autoFocus
                />
                {nameError && (
                  <p className="text-sm text-red-500 mt-2">{nameError}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  يرجى إدخال الاسم الكامل مكون من 3 أسماء مفصولة بمسافات
                </p>
              </div>

              {/* Employee ID Input */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  الرقم الوظيفي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="أدخل الرقم الوظيفي"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  dir="ltr"
                  style={{ textAlign: "left" }}
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  رقم الجوال <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="05xxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  pattern="[0-9]{10}"
                  dir="ltr"
                  style={{ textAlign: "left" }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  يرجى إدخال رقم الجوال مكون من 10 أرقام
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 leading-relaxed">
                  📝 سيتم استخدام بياناتك للدخول في السحب على الجوائز بعد إكمال
                  جميع الأنشطة
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "جاري التسجيل..." : "ابدأ الأنشطة"}
              </button>
            </form>
          </div>

          {/* Privacy Note */}
          <div className="text-center mt-6 text-sm text-gray-600">
            <p>
              🔒 بياناتك محفوظة بسرية تامة ولن تُستخدم إلا لأغراض هذا النشاط
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
