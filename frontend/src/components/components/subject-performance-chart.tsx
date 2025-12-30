
'use client';

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { SubjectGrade } from '@/lib/types';
import { subjects } from '@/lib/data';

type SubjectPerformanceChartProps = {
  grades: SubjectGrade[];
};

const subjectColorMap = subjects.reduce((acc, subject) => {
  acc[subject.id] = subject.color;
  return acc;
}, {} as Record<string, string>);

const colorClassToFill = (colorClass: string) => {
  const mapping: { [key: string]: string } = {
    'bg-red-400': '#f87171',
    'bg-blue-400': '#60a5fa',
    'bg-yellow-400': '#facc15',
    'bg-green-400': '#4ade80',
    'bg-orange-400': '#fb923c',
    'bg-purple-400': '#c084fc',
    'bg-amber-600': '#d97706',
  };
  return mapping[colorClass] || 'hsl(var(--primary))';
};

export function SubjectPerformanceChart({ grades }: SubjectPerformanceChartProps) {
  const chartData = grades.map(g => {
    let subjectName = g.subjectName;
    if (subjectName === 'Edukasyon sa Pagpapakatao (ESP)') {
      subjectName = 'ESP';
    } else if (subjectName === 'Araling Panlipunan (AP)') {
      subjectName = 'AP';
    } else if (subjectName === 'Mathematics') {
        subjectName = 'Math';
    } else if (subjectName.length > 10) {
        subjectName = subjectName.split(' ').map(word => word[0]).join('');
    }

    const colorClass = subjectColorMap[g.subjectId];

    return {
      subject: subjectName,
      grade: g.finalGrade,
      fill: colorClassToFill(colorClass),
    };
  });

  const yAxisTicks = [75, 80, 85, 90, 95, 100];

  return (
    <div className="w-full h-[320px]">
      <ChartContainer
        config={{
          grade: {
            label: 'Grade',
          },
        }}
        className="h-full w-full"
      >
        <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 20, bottom: 0, left: -20 }}
            accessibilityLayer
        >
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <XAxis 
            dataKey="subject" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={8}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            domain={[75, 100]} 
            ticks={yAxisTicks}
            tickLine={false} 
            axisLine={false} 
            tickMargin={8} 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
          />
          <Bar
            dataKey="grade"
            radius={4}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
