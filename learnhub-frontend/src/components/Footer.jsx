import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-gray-900 text-white">
      <div className="container px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-gray-900 font-extrabold">m</span>
              <span className="font-semibold">LearnHub</span>
            </div>
            <p className="text-white/80">Nâng tầm kỹ năng với các khóa học chất lượng từ giảng viên hàng đầu.</p>
          </div>
          <FooterCol title="Lập trình Web" items={["Lập trình di động","Java cơ bản","PHP cơ bản","Viết nội dung"]} />
          <FooterCol title="Thiết kế" items={["Adobe Illustrator","Adobe Photoshop","Thiết kế logo","Thiết kế UI"]} />
          <FooterCol title="Sáng tạo" items={["Nhiếp ảnh","Làm video","Nghệ thuật & Minh hoạ","Âm nhạc"]} />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container px-6 flex flex-col md:flex-row items-center justify-between gap-4 py-6 text-sm">
          <p className="opacity-80">Bản quyền © LearnHub {new Date().getFullYear()}. Mọi quyền được bảo lưu</p>
          <div className="flex items-center gap-4 opacity-90">
            <a href="#" aria-label="Twitter" className="hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M22 5.8c-.7.3-1.3.5-2 .6.7-.4 1.2-1 1.5-1.8-.7.4-1.5.7-2.3.9A3.4 3.4 0 0012 8.4c0 .3 0 .6.1.9-2.8-.1-5.4-1.5-7.1-3.8-.3.6-.4 1.2-.4 1.9 0 1.3.7 2.5 1.7 3.2-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.3 3.4 3.1 3.8-.3.1-.7.2-1 .2-.2 0-.5 0-.7-.1.5 1.6 2 2.8 3.7 2.8A6.9 6.9 0 014 18.6 9.7 9.7 0 009.3 20c6 0 9.4-5 9.4-9.4v-.4c.7-.5 1.2-1.1 1.6-1.8z"/></svg>
            </a>
            <a href="#" aria-label="Facebook" className="hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M13 22v-9h3l1-4h-4V7c0-1.1.3-2 2-2h2V1h-3c-3 0-5 2-5 5v3H6v4h3v9h4z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <h4 className="mb-3 font-semibold">{title}</h4>
      <ul className="space-y-2 text-white/80">
        {items.map((text) => (
          <li key={text} className="hover:opacity-100 transition-opacity">{text}</li>
        ))}
      </ul>
    </div>
  );
}


