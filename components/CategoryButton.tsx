import React from 'react';
import { Category } from '../types';

interface CategoryButtonProps {
  category: Category;
  isActive: boolean;
  onClick: (cat: Category) => void;
  icon: React.ReactNode;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ category, isActive, onClick, icon }) => {
  return (
    <button
      onClick={() => onClick(category)}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-[2rem] transition-all duration-300 transform
        ${isActive 
          ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105' 
          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-gray-700/30'
        }
      `}
    >
      <div className={`text-2xl mb-2 ${isActive ? 'text-black' : 'text-amber-500'}`}>
        {icon}
      </div>
      <span className="font-semibold text-sm tracking-wide">{category}</span>
    </button>
  );
};

export default CategoryButton;