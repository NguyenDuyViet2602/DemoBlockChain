import React from 'react';
import { useNavigate } from 'react-router-dom';
import RatingStars from './RatingStars';

export default function CourseCard({ course }) {
  const navigate = useNavigate();
  const courseId = course.courseid || course.id;
  const hasLink = !!courseId;

  const handleClick = () => {
    if (hasLink) {
      navigate(`/course/${courseId}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md ${hasLink ? 'cursor-pointer' : ''}`}
    >
      <div className="relative">
        <div className="aspect-[16/9] w-full overflow-hidden">
          <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
        </div>
        <div className="absolute left-3 top-3">
          {course.badges?.includes('Best Seller') && (
            <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white shadow">Best Seller</span>
          )}
        </div>
        <div className="absolute right-3 top-3">
          {course.badges?.includes('20% OFF') || course.badges?.includes('-20%') ? (
            <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white shadow">20% OFF</span>
          ) : course.badges?.filter(b => b !== 'Best Seller').map((b) => (
            <span key={b} className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-semibold text-white shadow">{b}</span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug">{course.title}</h3>
        <p className="mt-1 text-[12px] text-gray-500">{course.instructor}</p>
        <p className="mt-2 line-clamp-2 text-[13px] text-gray-600">{course.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-end gap-2">
            <span className="text-[15px] font-bold text-emerald-600">{course.price}</span>
            {course.oldPrice && (
              <span className="text-[11px] text-gray-500 line-through">{course.oldPrice}</span>
            )}
          </div>
          <RatingStars value={course.rating ?? 4.8} reviewCount={course.reviewCount ?? 1200} />
        </div>
      </div>
    </div>
  );
}


