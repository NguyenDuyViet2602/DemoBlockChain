import React from 'react';

export default function InstructorCard({ instructor }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <img
        className="h-40 w-full object-cover"
        src={instructor.image}
        alt={instructor.name}
      />
      <div className="p-4">
        <h3 className="font-semibold">{instructor.name}</h3>
        <p className="text-sm text-gray-500">{instructor.role}</p>
      </div>
    </div>
  );
}


