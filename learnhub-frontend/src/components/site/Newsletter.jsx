import React from 'react';

export default function Newsletter() {
  return (
    <section className="container mx-auto px-6 mt-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-8 md:p-12 text-white">
        <div className="relative z-10 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold">Nhận thông tin khoá học mới</h3>
          <p className="mt-2 text-sm md:text-base text-white/90">Đăng ký nhận bản tin qua email</p>
          <form className="mx-auto mt-5 flex max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                aria-label="Nhập email của bạn"
                className="w-full rounded-full bg-white/95 px-5 py-3 text-sm text-gray-800 shadow placeholder:text-gray-400 focus:outline-none"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 text-xs text-gray-400 md:block">không spam</span>
            </div>
            <button type="submit" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow hover:bg-gray-100">
              Đăng ký
            </button>
          </form>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      </div>
    </section>
  );
}
