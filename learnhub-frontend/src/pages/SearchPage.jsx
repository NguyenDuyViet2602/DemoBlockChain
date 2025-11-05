// src/pages/SearchPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/site/CourseCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Lấy params từ URL
  const searchQuery = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const categoryName = searchParams.get('categoryName') || '';
  const sortBy = searchParams.get('sortBy') || 'createdat';
  const sortOrder = searchParams.get('sortOrder') || 'DESC';
  const page = parseInt(searchParams.get('page') || '1');
  
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Sync searchInput với URL params khi chúng thay đổi
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/categories');
        const list = res.data?.data?.categories || res.data?.data || [];
        setCategories(list);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 12,
          sortBy,
          sortOrder,
        };
        
        if (searchQuery) {
          params.search = searchQuery;
        }
        if (categoryId) {
          params.categoryId = categoryId;
        }

        const res = await axios.get('http://localhost:8080/api/v1/courses', { params });
        const data = res.data?.data || {};
        
        const mapped = (data.courses || []).map((c) => ({
          courseid: c.courseid || c.id,
          title: c.coursename,
          instructor: c.teacher?.fullname || c.teacherName || 'Giảng viên',
          image: c.thumbnailUrl || c.imageurl || '/placeholder.svg',
          description: c.description || '',
          price: c.price === 0 ? 'Miễn phí' : `${c.price.toLocaleString()} VND`,
          rating: typeof c.rating === 'number' ? c.rating : 4.8,
          badges: c.purchases && c.purchases > 1000 ? ['Best Seller'] : undefined,
          oldPrice: undefined,
        }));
        
        setCourses(mapped);
        setTotalItems(data.totalItems || 0);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchQuery, categoryId, sortBy, sortOrder, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (searchInput.trim()) {
      newParams.set('q', searchInput.trim());
    }
    if (categoryId) {
      newParams.set('categoryId', categoryId);
      if (categoryName) {
        newParams.set('categoryName', categoryName);
      }
    }
    setSearchParams(newParams);
  };

  const handleCategoryFilter = (catId, catName) => {
    const newParams = new URLSearchParams();
    if (searchInput.trim()) {
      newParams.set('q', searchInput.trim());
    }
    if (catId && catId !== 'all') {
      newParams.set('categoryId', catId);
      newParams.set('categoryName', catName);
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSortBy);
    newParams.set('sortOrder', newSortOrder);
    newParams.set('page', '1'); // Reset về trang 1 khi đổi sort
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-6 py-8">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5"
              >
                <circle cx="11" cy="11" r="7"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full rounded-full border-2 border-gray-200 bg-white pl-12 pr-4 py-4 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-6 py-2 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Active filters */}
          {(searchQuery || categoryId) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 max-w-3xl mx-auto">
              {searchQuery && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                  Từ khóa: {searchQuery}
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('q');
                      setSearchParams(newParams);
                      setSearchInput('');
                    }}
                    className="hover:text-emerald-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {categoryId && categoryName && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                  Danh mục: {categoryName}
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('categoryId');
                      newParams.delete('categoryName');
                      setSearchParams(newParams);
                    }}
                    className="hover:text-emerald-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            {/* Category Filter */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-lg mb-4">Danh mục</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryFilter('all', '')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    !categoryId
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.categoryid}
                    onClick={() => handleCategoryFilter(cat.categoryid, cat.categoryname)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      categoryId === String(cat.categoryid)
                        ? 'bg-emerald-100 text-emerald-700 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {cat.categoryname}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-lg mb-4">Sắp xếp</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSortChange('createdat', 'DESC')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    sortBy === 'createdat' && sortOrder === 'DESC'
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => handleSortChange('createdat', 'ASC')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    sortBy === 'createdat' && sortOrder === 'ASC'
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Cũ nhất
                </button>
                <button
                  onClick={() => handleSortChange('coursename', 'ASC')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    sortBy === 'coursename' && sortOrder === 'ASC'
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Tên A-Z
                </button>
                <button
                  onClick={() => handleSortChange('coursename', 'DESC')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    sortBy === 'coursename' && sortOrder === 'DESC'
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Tên Z-A
                </button>
                <button
                  onClick={() => handleSortChange('price', 'ASC')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    sortBy === 'price' && sortOrder === 'ASC'
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Giá thấp → cao
                </button>
                <button
                  onClick={() => handleSortChange('price', 'DESC')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    sortBy === 'price' && sortOrder === 'DESC'
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Giá cao → thấp
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {searchQuery || categoryName ? 'Kết quả tìm kiếm' : 'Tất cả khóa học'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tìm thấy {totalItems} khóa học
                </p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <p className="mt-2 text-gray-600">Đang tải...</p>
              </div>
            )}

            {/* Results */}
            {!loading && (
              <>
                {courses.length > 0 ? (
                  <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {courses.map((course) => (
                        <CourseCard key={course.courseid || course.title} course={course} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page === 1}
                          className="px-4 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Trước
                        </button>
                        {[...Array(totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          // Chỉ hiển thị các trang gần trang hiện tại
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= page - 1 && pageNum <= page + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-4 py-2 rounded-md border transition-colors ${
                                  pageNum === page
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (pageNum === page - 2 || pageNum === page + 2) {
                            return <span key={pageNum} className="px-2">...</span>;
                          }
                          return null;
                        })}
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page === totalPages}
                          className="px-4 py-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Sau
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="mt-4 text-gray-600">Không tìm thấy khóa học nào</p>
                    <p className="mt-2 text-sm text-gray-500">
                      Thử thay đổi từ khóa hoặc bộ lọc của bạn
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

