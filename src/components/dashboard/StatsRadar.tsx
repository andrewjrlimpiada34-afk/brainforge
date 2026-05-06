"use client"

import { useAppState } from '@/components/providers/StateProvider';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function StatsRadar() {
  const { user } = useAppState();

  const data = [
    { subject: 'Memory', A: user.stats.memory, fullMark: 100 },
    { subject: 'Logic', A: user.stats.logic, fullMark: 100 },
    { subject: 'Speed', A: user.stats.speed, fullMark: 100 },
    { subject: 'Accuracy', A: user.stats.accuracy, fullMark: 100 },
  ];

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase text-primary tracking-widest">Cognitive Blueprint</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center items-center h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Stats"
              dataKey="A"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
