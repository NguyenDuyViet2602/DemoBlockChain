import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RatingStars from './RatingStars';
import { useToast } from '../../contexts/ToastContext';

export default function CourseCard({ course, onFavoriteToggle }) {
  const navigate = useNavigate();
  const toast = useToast();
  const courseId = course.courseid || course.id;
  const hasLink = !!courseId;
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const loggedIn = !!localStorage.getItem('token');
    setIsLoggedIn(loggedIn);
    if (loggedIn && courseId) {
      checkFavoriteStatus();
    } else {
      setIsFavorite(false);
    }
  }, [courseId]);

  const checkFavoriteStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token || !courseId) return;
    
    try {
      const favoritesRes = await axios.get('http://localhost:8080/api/v1/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: { data: [] } }));
      
      const favorites = favoritesRes.data?.data || [];
      const favorited = favorites.some(f => f.courseid === parseInt(courseId));
      setIsFavorite(favorited);
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const handleClick = () => {
    if (hasLink) {
      navigate(`/course/${courseId}`);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    if (!isLoggedIn) {
      toast.warning('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    if (!courseId) return;

    try {
      const token = localStorage.getItem('token');
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`http://localhost:8080/api/v1/favorites/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
        // Call callback to refresh parent list if provided
        if (onFavoriteToggle) {
          onFavoriteToggle();
        }
      } else {
        // Add to favorites
        await axios.post(
          `http://localhost:8080/api/v1/favorites`,
          { courseId: parseInt(courseId) },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật yêu thích');
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
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {isLoggedIn && (
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
              }`}
              title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
            >
              <svg
                className="w-4 h-4"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
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


