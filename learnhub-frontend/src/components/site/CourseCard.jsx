import React from 'react';
import RatingStars from './RatingStars';

export default function CourseCard({ course }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-transform duration-200 hover:scale-[1.02]">
      <div className="relative">
        <img src={course.image} alt={course.title} className="h-40 w-full object-cover" />
        <div className="absolute left-3 top-3 flex gap-2">
          {course.badges?.map((b) => (
            <span key={b} className="rounded-full bg-emerald-500/90 px-2 py-1 text-xs font-semibold text-white shadow">{b}</span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold">{course.title}</h3>
        <p className="mt-1 text-xs text-gray-500">{course.instructor}</p>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{course.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-end gap-2">
            <span className="text-base font-bold text-emerald-600">{course.price}</span>
            {course.oldPrice && (
              <span className="text-xs text-gray-500 line-through">{course.oldPrice}</span>
            )}
          </div>
          <RatingStars value={course.rating ?? 4.8} />
        </div>
      </div>
    </div>
  );
}


