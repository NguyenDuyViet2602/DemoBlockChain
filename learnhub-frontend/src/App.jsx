// src/App.jsx
import React from 'react';
import Header from './components/Header'; // Import Header
import Footer from './components/Footer';
import HomePage from './pages/HomePage'; // Import HomePage
// Footer sẽ thêm sau

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow">
        {/* Sau này sẽ dùng Router để hiển thị các trang khác nhau */}
        <HomePage />
      </div>
      <Footer />
    </div>
  );
}

export default App;