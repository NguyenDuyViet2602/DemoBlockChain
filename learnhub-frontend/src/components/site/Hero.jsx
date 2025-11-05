import React, { useState } from 'react';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      leftBg: 'bg-emerald-500',
      rightBg: 'bg-red-500',
      title: 'Học điều mới mỗi ngày.',
      subtitle: 'Trở thành chuyên gia và sẵn sàng gia nhập thế giới.',
      buttonText: 'Khám phá Nhiếp ảnh',
      instructor: {
        name: 'Jessica Wong',
        role: 'Nhiếp ảnh gia',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        badge: 'Giải thưởng Ảnh 2017 Awwards',
        joined: 'Tham gia Klevr từ năm 2006',
      },
    },
  ];

  return (
    <section className="container mx-auto px-6 mt-6">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="grid md:grid-cols-2">
          <div className="bg-emerald-500 p-8 md:p-12 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{slides[0].title}</h1>
            <p className="text-base md:text-lg mb-6 opacity-90">{slides[0].subtitle}</p>
            <button className="rounded-xl bg-white px-6 py-3 text-emerald-600 font-semibold hover:bg-gray-50 transition-colors">
              {slides[0].buttonText}
            </button>
          </div>
          <div className="relative bg-red-500 p-8 md:p-12">
            <div className="absolute inset-0 opacity-20">
              <div className="h-full w-full bg-gradient-to-br from-black/20 to-transparent" />
            </div>
            <div className="relative z-10 text-white">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={slides[0].instructor.image}
                  alt={slides[0].instructor.name}
                  className="h-16 w-16 rounded-full border-2 border-white"
                />
                <div>
                  <div className="font-semibold">{slides[0].instructor.name}</div>
                  <div className="text-sm opacity-90">{slides[0].instructor.role}</div>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{slides[0].instructor.badge}</div>
                <div className="opacity-80">{slides[0].instructor.joined}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentSlide ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
        <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}


