import React from 'react';

export default function InstructorCard({ instructor }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl">
      <div className="aspect-[4/5] relative">
        <img
          className="h-full w-full object-cover"
          src={instructor.image}
          alt={instructor.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-base">{instructor.name}</h3>
          <p className="text-sm text-white/90 mt-1">{instructor.role}</p>
        </div>
      </div>
    </div>
  );
}


