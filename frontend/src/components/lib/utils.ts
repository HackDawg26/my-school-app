import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSubjectColors(colorClass: string): {
  bgColor: string;
  borderColor: string;
  textColor: string;
  ringColor: string;
} {
  const colorMap: { [key: string]: { bgColor: string; borderColor: string; textColor: string; ringColor: string; } } = {
    'bg-red-400': { bgColor: 'bg-red-400', borderColor: 'border-red-400', textColor: 'text-red-400', ringColor: 'ring-red-400' },
    'bg-blue-400': { bgColor: 'bg-blue-400', borderColor: 'border-blue-400', textColor: 'text-blue-400', ringColor: 'ring-blue-400' },
    'bg-yellow-400': { bgColor: 'bg-yellow-400', borderColor: 'border-yellow-400', textColor: 'text-yellow-400', ringColor: 'ring-yellow-400' },
    'bg-green-400': { bgColor: 'bg-green-400', borderColor: 'border-green-400', textColor: 'text-green-400', ringColor: 'ring-green-400' },
    'bg-orange-400': { bgColor: 'bg-orange-400', borderColor: 'border-orange-400', textColor: 'text-orange-400', ringColor: 'ring-orange-400' },
    'bg-purple-400': { bgColor: 'bg-purple-400', borderColor: 'border-purple-400', textColor: 'text-purple-400', ringColor: 'ring-purple-400' },
    'bg-amber-600': { bgColor: 'bg-amber-600', borderColor: 'border-amber-600', textColor: 'text-amber-600', ringColor: 'ring-amber-600' },
  };

  return colorMap[colorClass] || { bgColor: 'bg-primary', borderColor: 'border-border', textColor: 'text-primary', ringColor: 'ring-primary' };
}
