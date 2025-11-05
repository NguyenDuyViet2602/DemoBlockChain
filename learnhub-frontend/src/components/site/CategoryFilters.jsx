import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CategoryFilters() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState('Tất cả Gợi ý');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/categories');
        const list = res.data?.data?.categories || res.data?.data || [];
        setCategories(list);
      } catch (e) {
        // ignore, keep default
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    if (category === 'Tất cả Gợi ý' || !category) {
      navigate('/search');
    } else {
      const categoryId = typeof category === 'object' ? category.categoryid : null;
      const categoryName = typeof category === 'object' ? category.categoryname : category;
      
      if (categoryId) {
        navigate(`/search?categoryId=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`);
      } else {
        // Tìm category object từ tên
        const found = categories.find(c => c.categoryname === categoryName);
        if (found) {
          navigate(`/search?categoryId=${found.categoryid}&categoryName=${encodeURIComponent(found.categoryname)}`);
        }
      }
    }
  };

  return (
    <div className="container mx-auto px-6 mt-6">
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none]">
        <button
          onClick={() => handleCategoryClick('Tất cả Gợi ý')}
          className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors shadow-sm border ${
            active === 'Tất cả Gợi ý'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
          type="button"
        >
          Tất cả Gợi ý
        </button>
        {categories.map((category) => {
          const categoryName = category.categoryname || category.name || category;
          const isActive = categoryName === active;
          return (
            <button
              key={category.categoryid || categoryName}
              onClick={() => {
                setActive(categoryName);
                handleCategoryClick(category);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors shadow-sm border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
              type="button"
            >
              {categoryName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
