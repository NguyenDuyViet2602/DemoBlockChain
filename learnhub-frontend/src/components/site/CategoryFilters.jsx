import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CategoryFilters() {
  const [categories, setCategories] = useState(['Tất cả']); // Mặc định có "Tất cả"

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/categories');
        const list = res.data?.data?.categories || res.data?.data || [];
        const names = list.map((c) => c.categoryname || c.name || c.title || '');
        setCategories(['Tất cả', ...names.filter(Boolean)]);
      } catch (e) {
        // Giữ mặc định nếu lỗi
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-6 mt-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((f) => (
          <button
            key={f}
            className="rounded-full border px-4 py-2 text-sm hover:bg-gray-50"
            type="button"
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
