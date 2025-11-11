// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CourseDetail from './pages/CourseDetail';
import SearchPage from './pages/SearchPage';
import Profile from './pages/Profile';
import Teacher from './pages/Teacher';
import Admin from './pages/Admin';
import MyCourses from './pages/MyCourses';
import LearnCourse from './pages/LearnCourse';
import Notifications from './pages/Notifications';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentResult from './pages/PaymentResult';
import BecomeInstructor from './pages/BecomeInstructor';
import InstructorApplication from './pages/InstructorApplication';
import PendingApplication from './pages/PendingApplication';
import withAuthorization from './hoc/withAuthorization';

const ProtectedProfile = withAuthorization(['Student', 'Teacher', 'Admin'])(Profile);
const ProtectedTeacher = withAuthorization(['Teacher'])(Teacher);
const ProtectedAdmin = withAuthorization(['Admin'])(Admin);
const ProtectedMyCourses = withAuthorization(['Student', 'Teacher', 'Admin'])(MyCourses);
const ProtectedLearnCourse = withAuthorization(['Student', 'Teacher', 'Admin'])(LearnCourse);
const ProtectedNotifications = withAuthorization(['Student', 'Teacher', 'Admin'])(Notifications);
const ProtectedCart = withAuthorization(['Student', 'Teacher', 'Admin'])(Cart);
const ProtectedCheckout = withAuthorization(['Student', 'Teacher', 'Admin'])(Checkout);

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProtectedProfile />} />
            <Route path="/teacher" element={<ProtectedTeacher />} />
            <Route path="/admin" element={<ProtectedAdmin />} />
            <Route path="/my-courses" element={<ProtectedMyCourses />} />
            <Route path="/wishlist" element={<Navigate to="/my-courses?tab=wishlist" replace />} />
            <Route path="/notifications" element={<ProtectedNotifications />} />
            <Route path="/learn/:courseId" element={<ProtectedLearnCourse />} />
            <Route path="/cart" element={<ProtectedCart />} />
            <Route path="/checkout" element={<ProtectedCheckout />} />
            <Route path="/payment/result" element={<PaymentResult />} />
            <Route path="/become-instructor" element={<BecomeInstructor />} />
            <Route path="/teacher-requests" element={<BecomeInstructor />} />
            <Route path="/apply" element={<InstructorApplication />} />
            <Route path="/pending-application" element={<PendingApplication />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;