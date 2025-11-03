import React from 'react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Nâng tầm kỹ năng của bạn với LearnHub</h1>
        <p className="text-lg md:text-xl mb-8">Khóa học trực tuyến chất lượng cao, học mọi lúc mọi nơi.</p>
        <button className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-100">
          Bắt đầu học ngay
        </button>
      </div>
    </section>
  );
}


