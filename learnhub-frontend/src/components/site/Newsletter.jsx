import React from 'react';

export default function Newsletter() {
  return (
    <section className="container mx-auto px-6 mt-16">
      <div className="relative overflow-hidden rounded-3xl bg-blue-600 p-8 md:p-12 text-white">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Tham gia và nhận giảm giá tuyệt vời</h3>
            <p className="text-base md:text-lg text-white/90">Với các theme đáp ứng và ứng dụng di động và máy tính để bàn của chúng tôi.</p>
          </div>
          <form className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                aria-label="Email Address"
                className="w-64 rounded-full bg-white px-5 py-3 text-sm text-gray-800 shadow placeholder:text-gray-400 focus:outline-none"
              />
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none">
                <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <button type="submit" className="rounded-full bg-yellow-400 px-6 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-yellow-500 transition-colors">
              Đăng ký
            </button>
          </form>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
      </div>
    </section>
  );
}
