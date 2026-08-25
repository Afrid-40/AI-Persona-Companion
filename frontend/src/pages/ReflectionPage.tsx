import React from 'react';
import { BookOpen, PenTool } from 'lucide-react';

const ReflectionPage = () => {
  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between pb-6 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Daily Reflection
          </h1>
          <p className="text-sm text-text-secondary mt-1">Guided journaling and mood tracking</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-text-secondary mt-10">
        <PenTool className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">No reflections yet</h2>
        <p className="max-w-md text-center">Take a moment each day to reflect. Your AI companion will provide insights based on your entries over time.</p>
      </div>
    </div>
  );
};

export default ReflectionPage;
