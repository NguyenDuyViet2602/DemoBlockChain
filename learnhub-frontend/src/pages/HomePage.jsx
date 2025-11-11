// src/pages/HomePage.jsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import CourseList from '../components/CourseList';
import Hero from '../components/site/Hero';
import InstructorCard from '../components/site/InstructorCard';
import CategoryFilters from '../components/site/CategoryFilters';
import Newsletter from '../components/site/Newsletter';
import CourseCard from '../components/site/CourseCard';

function HomePage() {
  const interestCourses = [
    {
      title: 'Adobe Illustrator Stretch Course',
      instructor: '@ Kitani Studio',
      image:
        'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1600&auto=format&fit=crop',
      description:
        'More than for Experience as Illustrator. Learn how to becoming professional Illustrator Now.',
      price: '$24.92',
      oldPrice: '$32.90',
      badges: ['Best Seller', '20% OFF'],
      rating: 4.9,
      reviewCount: 1200,
    },
    {
      title: 'Bootcamp Vue.js Web Framework',
      instructor: '@ Kitani Studio',
      image:
        'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop',
      description: 'Learn to make web application with Vue.js Framework.',
      price: '$24.92',
      oldPrice: '$32.90',
      badges: ['Best Seller', '20% OFF'],
      rating: 4.8,
    },
    {
      title: 'Design Fundamentals',
      instructor: '@ Kitani Studio',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
      description: 'The basics of becoming a great designer.',
      price: '$24.92',
      oldPrice: '$32.90',
      rating: 4.7,
    },
  ];

  const trending = [
    ...interestCourses,
    {
      title: 'Adobe Illustrator Stretch Course',
      instructor: '@ Kitani Studio',
      image:
        'https://images.unsplash.com/photo-1590608897129-79da98d159df?q=80&w=1600&auto=format&fit=crop',
      description: 'Illustrator from zero to hero.',
      price: '$24.92',
      oldPrice: '$32.90',
      badges: ['Best Seller', '20% OFF'],
      rating: 4.9,
      reviewCount: 1200,
    },
    {
      title: 'Bootcamp Vue.js Web Framework',
      instructor: '@ Kitani Studio',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
      description: 'Learn to make web application with Vue.js Framework.',
      price: '$24.92',
      oldPrice: '$32.90',
      badges: ['Best Seller', '20% OFF'],
      rating: 4.8,
    },
    {
      title: 'Design Fundamentals',
      instructor: '@ Kitani Studio',
      image:
        'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1600&auto=format&fit=crop',
      description: 'The basics of becoming a great designer.',
      price: '$24.92',
      oldPrice: '$32.90',
      rating: 4.7,
    },
  ];

  const instructors = [
    {
      name: 'Alexander Bastian',
      role: 'Expert Mobile Engineer',
      image:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Labie Carthaline',
      role: 'Marketing Specialist',
      image:
        'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1200&auto=format&fit=crop',
    },
    {
      name: 'Jonathan Doe',
      role: 'Financial Strategist',
      image:
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  const [trendingCourses, setTrendingCourses] = useState([]);
  const [backendInstructors, setBackendInstructors] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Thử gọi với tham số gợi ý sắp xếp phổ biến
        const res = await axios.get('http://localhost:8080/api/v1/courses', {
          params: { limit: 8, sort: 'popular', order: 'desc' },
        });
        const list = res.data?.data?.courses || [];
        const mapped = list.map((c) => ({
          courseid: c.courseid || c.id, // Thêm courseid để navigate
          title: c.coursename,
          instructor: c.teacherName || 'Instructor',
          image: c.imageurl || c.thumbnailUrl || '/placeholder.svg',
          description: c.description || '',
          price: c.price === 0 ? 'Miễn phí' : `${c.price.toLocaleString()} VND`,
          rating: typeof c.rating === 'number' ? c.rating : 4.8,
          badges: c.purchases && c.purchases > 1000 ? ['Best Seller'] : undefined,
          oldPrice: undefined,
        }));
        if (mapped.length) setTrendingCourses(mapped);
      } catch (e) {
        // Giữ nguyên dữ liệu tĩnh nếu backend chưa hỗ trợ
      }
    };
    fetchTrending();
  }, []);

  // Lấy trực tiếp 4 giảng viên từ bảng users (role=Teacher)
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const resUsers = await axios.get('http://localhost:8080/api/v1/users', {
          params: { role: 'Teacher', limit: 4 },
        });
        // Response format: { message, data: [users array], pagination }
        const users = resUsers.data?.data || [];
        const mapped = users.slice(0, 4).map((u) => ({
          name: u.fullname || u.name || u.username || 'Giảng viên',
          role: 'Giảng viên',
          image: u.profilepicture || u.avatarUrl || u.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
        }));
        if (mapped.length) setBackendInstructors(mapped);
      } catch (e) {
        // fallback: giữ tĩnh
        console.error('Error fetching instructors:', e);
      }
    };
    fetchInstructors();
  }, []);

  // Hiển thị 4 giảng viên tĩnh

  return (
    <main>
      <Hero />

      <CategoryFilters />

      <CarouselKitaniStudio items={trendingCourses.length ? trendingCourses : interestCourses} />

      <section className="container mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold mb-2">Khóa học đang thịnh hành</h2>
        <p className="text-sm text-muted-foreground mb-6">Chúng tôi biết những điều tốt nhất cho bạn. Lựa chọn hàng đầu cho bạn.</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(trendingCourses.length && trendingCourses.length >= 8 ? trendingCourses.slice(0, 8) : trending.slice(0, 8)).map((c, i) => (
            <CourseCard key={`trend-${c.title}-${i}`} course={c} />
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold mb-2">Giảng viên phổ biến</h2>
        <p className="text-sm text-muted-foreground mb-6">Chúng tôi biết những điều tốt nhất cho bạn. Lựa chọn hàng đầu cho bạn.</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(backendInstructors.length ? backendInstructors : instructors.slice(0, 4)).map((i) => (
            <InstructorCard key={i.name} instructor={i} />
          ))}
        </div>
      </section>

      <Newsletter />
    </main>
  );
}

function CarouselKitaniStudio({ items }) {
  const trackRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const autoScrollRef = useRef(null);

  const scrollNext = (step = 320) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const target = el.scrollLeft + step;
    if (target > max - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  const scrollPrev = (step = 320) => {
    const el = trackRef.current;
    if (!el) return;
    const target = el.scrollLeft - step;
    if (target < 4) {
      const max = el.scrollWidth - el.clientWidth;
      el.scrollTo({ left: max, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    autoScrollRef.current = setInterval(() => {
      if (!isDownRef.current) scrollNext(320);
    }, 4000);
    return () => clearInterval(autoScrollRef.current);
  }, []);

  const onMouseDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    e.preventDefault();
    isDownRef.current = true;
    const rect = el.getBoundingClientRect();
    startXRef.current = e.pageX - rect.left;
    scrollLeftRef.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e) => {
      if (isDownRef.current && trackRef.current) {
        e.preventDefault();
        const el = trackRef.current;
        const rect = el.getBoundingClientRect();
        const x = e.pageX - rect.left;
        const walk = (x - startXRef.current) * 2;
        el.scrollLeft = scrollLeftRef.current - walk;
      }
    };
    const handleMouseUpGlobal = () => {
      if (isDownRef.current) {
        isDownRef.current = false;
        const el = trackRef.current;
        if (el) {
          el.style.cursor = 'grab';
          el.style.userSelect = '';
        }
      }
    };
    document.addEventListener('mousemove', handleMouseMoveGlobal);
    document.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, []);

  const onTouchStart = (e) => {
    const el = trackRef.current;
    if (!el) return;
    isDownRef.current = true;
    const rect = el.getBoundingClientRect();
    startXRef.current = e.touches[0].pageX - rect.left;
    scrollLeftRef.current = el.scrollLeft;
  };
  const onTouchEnd = () => {
    isDownRef.current = false;
  };
  const onTouchMove = (e) => {
    if (!isDownRef.current || !trackRef.current) return;
    e.preventDefault();
    const el = trackRef.current;
    const rect = el.getBoundingClientRect();
    const x = e.touches[0].pageX - rect.left;
    const walk = (x - startXRef.current) * 2;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  return (
    <section className="container mx-auto px-6 mt-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Thêm từ Kitani Studio</h2>
          <p className="text-sm text-muted-foreground">Chúng tôi biết những điều tốt nhất cho bạn. Lựa chọn hàng đầu cho bạn.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scrollPrev(320)} className="rounded-full border p-2 hover:bg-gray-50 cursor-pointer" aria-label="Trước">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button onClick={() => scrollNext(320)} className="rounded-full border p-2 hover:bg-gray-50 cursor-pointer" aria-label="Sau">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="mt-4 flex gap-5 overflow-x-auto scroll-smooth cursor-grab select-none [scrollbar-width:none] [-ms-overflow-style:none] active:cursor-grabbing"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((c, idx) => (
          <div key={`kitani-${c.title}-${idx}`} className="min-w-[300px] max-w-[300px]">
            <CourseCard course={c} />
          </div>
        ))}
      </div>
    </section>
  );
}

function CarouselInterest() {
  const trackRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const autoScrollRef = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/v1/courses?limit=8');
        const list = res.data?.data?.courses || [];
        setItems(list.map((c) => ({
          courseid: c.courseid || c.id, // Thêm courseid để navigate
          title: c.coursename,
          instructor: c.teacherName || 'Instructor',
          image: c.imageurl || c.thumbnailUrl || '/placeholder.svg',
          description: c.description || '',
          price: c.price === 0 ? 'Miễn phí' : `${c.price.toLocaleString()} VND`,
        })));
      } catch (e) {
        setItems([]);
      }
    };
    fetchCourses();
  }, []);

  const scrollNext = (step = 320) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const target = el.scrollLeft + step;
    if (target > max - 4) {
      // quay lại đầu
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  const scrollPrev = (step = 320) => {
    const el = trackRef.current;
    if (!el) return;
    const target = el.scrollLeft - step;
    if (target < 4) {
      // nhảy về cuối
      const max = el.scrollWidth - el.clientWidth;
      el.scrollTo({ left: max, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  // Auto scroll - tạm dừng khi đang drag
  useEffect(() => {
    autoScrollRef.current = setInterval(() => {
      if (!isDownRef.current) scrollNext(320);
    }, 4000);
    return () => clearInterval(autoScrollRef.current);
  }, []);

  // Drag to scroll (mouse) - dùng global listeners để kéo mượt hơn
  const onMouseDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    e.preventDefault();
    isDownRef.current = true;
    const rect = el.getBoundingClientRect();
    startXRef.current = e.pageX - rect.left;
    scrollLeftRef.current = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  };


  // Setup global mouse listeners khi bắt đầu drag
  useEffect(() => {
    const handleMouseMoveGlobal = (e) => {
      if (isDownRef.current && trackRef.current) {
        e.preventDefault();
        const el = trackRef.current;
        const rect = el.getBoundingClientRect();
        const x = e.pageX - rect.left;
        const walk = (x - startXRef.current) * 2;
        el.scrollLeft = scrollLeftRef.current - walk;
      }
    };
    const handleMouseUpGlobal = () => {
      if (isDownRef.current) {
        isDownRef.current = false;
        const el = trackRef.current;
        if (el) {
          el.style.cursor = 'grab';
          el.style.userSelect = '';
        }
      }
    };
    document.addEventListener('mousemove', handleMouseMoveGlobal);
    document.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, []);

  // Touch drag - cải thiện cho mobile
  const onTouchStart = (e) => {
    const el = trackRef.current;
    if (!el) return;
    isDownRef.current = true;
    const rect = el.getBoundingClientRect();
    startXRef.current = e.touches[0].pageX - rect.left;
    scrollLeftRef.current = el.scrollLeft;
  };
  const onTouchEnd = () => {
    isDownRef.current = false;
  };
  const onTouchMove = (e) => {
    if (!isDownRef.current || !trackRef.current) return;
    e.preventDefault(); // ngăn scroll tự nhiên
    const el = trackRef.current;
    const rect = el.getBoundingClientRect();
    const x = e.touches[0].pageX - rect.left;
    const walk = (x - startXRef.current) * 2;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  return (
    <section className="container mx-auto px-6 mt-10">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Dựa trên sở thích của bạn</h2>
          <p className="text-sm text-muted-foreground">Chúng tôi biết những điều tốt nhất cho bạn. Lựa chọn hàng đầu cho bạn.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scrollPrev(320)} className="rounded-full border p-2 hover:bg-gray-50 cursor-pointer" aria-label="Trước">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button onClick={() => scrollNext(320)} className="rounded-full border p-2 hover:bg-gray-50 cursor-pointer" aria-label="Sau">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="mt-4 flex gap-5 overflow-x-auto scroll-smooth cursor-grab select-none [scrollbar-width:none] [-ms-overflow-style:none] active:cursor-grabbing"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((c) => (
          <div key={c.title} className="min-w-[300px] max-w-[300px]">
            <CourseCard course={c} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomePage;