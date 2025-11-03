// src/components/CourseList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseCard from './site/CourseCard';

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/v1/courses?limit=6'); // Lấy 6 khóa học
        setCourses(response.data.data.courses);
        setLoading(false);
      } catch (err) {
        setError('Lỗi khi tải khóa học: ' + err.message);
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="text-center py-10">Đang tải khóa học...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <CourseCard
          key={c.courseid}
          course={{
            title: c.coursename,
            instructor: c.teacherName || 'Instructor',
            image: c.thumbnailUrl || '/placeholder.svg',
            description: c.description || '',
            price: c.price === 0 ? 'Miễn phí' : `${c.price.toLocaleString()} VND`,
          }}
        />
      ))}
    </div>
  );
}

export default CourseList;