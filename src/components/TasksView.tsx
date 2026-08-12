import React, { useState } from 'react';
import { DynamicNumber } from './DynamicNumber';
import { CheckCircle2, Flame, Sparkles, Users, Send, ArrowRight, Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  title: string;
  reward: number;
  category: 'daily' | 'social' | 'quest';
  icon?: any;
  iconUrl?: string;
  completed: boolean;
  progress?: { current: number; total: number };
  actionText: string;
}

interface TasksViewProps {
  userStars: number;
  onEarnStars: (amount: number) => void;
}

export function TasksView({ userStars, onEarnStars }: TasksViewProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'daily' | 'social' | 'quest'>('ALL');
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedCompleted = JSON.parse(localStorage.getItem('tg_completed_tasks') || '[]');
    const initialTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Daily Check-in',
        reward: 25,
        category: 'daily',
        iconUrl: 'https://i.suar.me/Npge9/l',
        completed: savedCompleted.includes('task-1'),
        actionText: 'Claim Stars',
      },
      {
        id: 'task-2',
        title: 'Join GRAM Official Channel',
        reward: 50,
        category: 'social',
        iconUrl: 'https://i.suar.me/qvlQn/l',
        completed: savedCompleted.includes('task-2'),
        actionText: 'Join Channel',
      },
      {
        id: 'task-3',
        title: 'Invite 3 Friends to Mini App',
        reward: 150,
        category: 'quest',
        iconUrl: 'https://i.suar.me/e9BA9/l',
        completed: savedCompleted.includes('task-3'),
        progress: { current: 1, total: 3 },
        actionText: 'Invite',
      },
      {
        id: 'task-4',
        title: 'Connect TON Wallet',
        reward: 100,
        category: 'social',
        iconUrl: 'https://i.suar.me/a9X4q/l',
        completed: savedCompleted.includes('task-4'),
        actionText: 'Connect',
      },
    ];
    return initialTasks;
  });

  const handleTaskAction = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;

    // Award stars
    onEarnStars(task.reward);

    // Save completed
    const savedCompleted = JSON.parse(localStorage.getItem('tg_completed_tasks') || '[]');
    if (!savedCompleted.includes(taskId)) {
      savedCompleted.push(taskId);
      localStorage.setItem('tg_completed_tasks', JSON.stringify(savedCompleted));
    }

    // Update state
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: true, actionText: 'Completed' } : t))
    );

    // Toast notification
    setToastMessage(`+${task.reward} Stars Earned!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const filteredTasks = tasks.filter((task) => activeCategory === 'ALL' || task.category === activeCategory);

  return (
    <div className="space-y-4 animate-fadeIn relative">
      {/* Celebration Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1E] border border-amber-500/50 text-amber-400 font-black px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <img src="https://i.suar.me/pM1Qy/l" alt="Star" className="w-5 h-5 object-contain" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - Compact & Professional */}
      <div className="bg-gradient-to-r from-[#1C1C1E] via-[#26262A] to-[#141417] rounded-2xl p-3.5 border border-[#3A3A3C] shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10 gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1 shrink-0">
                <img src="https://i.suar.me/pM1Qy/l" alt="Stars" className="w-3 h-3 object-contain" />
                Earn App Stars
              </span>
            </div>
            <h2 className="text-base font-black text-[#F5F5F7] tracking-tight">Tasks & Quests</h2>
            <p className="text-[11px] text-[#8E8E93] mt-0.5 truncate">
              Complete tasks to earn App Stars for rewards!
            </p>
          </div>

          {/* Stars Balance Counter Card */}
          <div className="bg-[#141417]/90 px-3 py-1.5 rounded-xl border border-[#2C2C2E] text-center shrink-0 flex flex-col items-center justify-center shadow-inner">
            <p className="text-[8px] uppercase font-bold text-[#8E8E93]">Your Stars</p>
            <div className="flex items-center gap-1 font-black text-amber-400 text-xs sm:text-sm">
              <img src="https://i.suar.me/pM1Qy/l" alt="Stars" className="w-3.5 h-3.5 object-contain shrink-0" />
              <DynamicNumber value={userStars} imageClassName="h-3" />
            </div>
          </div>
        </div>

        {/* Notice Line */}
        <div className="mt-2.5 pt-2 border-t border-[#3A3A3C]/50 flex items-center gap-1.5 text-[10px] text-amber-300/90">
          <Star className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">Stars store launching soon! Gifts are currently bought with GRAM.</span>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
        {[
          { id: 'ALL', label: 'All Tasks' },
          { id: 'daily', label: '⚡ Daily' },
          { id: 'social', label: '🌐 Social' },
          { id: 'quest', label: '🎯 Quests' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0',
              activeCategory === cat.id
                ? 'bg-[#0088CC] text-white border-[#0088CC] shadow-sm'
                : 'bg-[#18181A] text-[#8E8E93] border-[#2C2C2E] hover:border-[#3A3A3C] hover:text-[#F5F5F7]'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => {
          const Icon = task.icon;
          return (
            <div
              key={task.id}
              className={cn(
                'bg-[#18181A] rounded-2xl p-3.5 border border-[#2C2C2E] flex items-center justify-between gap-3 transition-all hover:border-[#3A3A3C] shadow-sm',
                task.completed && 'opacity-60 bg-[#141416] border-[#222225]'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border overflow-hidden transition-all shadow-sm',
                    task.completed
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-[#222225] border-[#3A3A3C]',
                    task.iconUrl ? 'p-0' : 'p-2.5'
                  )}
                >
                  {task.iconUrl ? (
                    <img 
                      src={task.iconUrl} 
                      alt={task.title} 
                      className="w-full h-full object-cover rounded-2xl transition-transform hover:scale-105" 
                    />
                  ) : Icon ? (
                    <Icon className="w-5 h-5 text-[#0088CC]" />
                  ) : null}
                </div>

                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#F5F5F7] truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-amber-400 font-black flex items-center gap-1">
                      +<DynamicNumber value={task.reward} imageClassName="h-3" />
                      <img src="https://i.suar.me/pM1Qy/l" alt="Stars" className="w-3.5 h-3.5 object-contain shrink-0" />
                    </span>
                    {task.progress && (
                      <span className="text-[10px] text-[#8E8E93] bg-[#222225] border border-[#2C2C2E] px-2 py-0.5 rounded-lg font-bold">
                        {task.progress.current}/{task.progress.total}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTaskAction(task.id)}
                disabled={task.completed}
                className={cn(
                  'px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5',
                  task.completed
                    ? 'bg-[#222225] text-green-400 border border-green-500/30 cursor-default'
                    : 'bg-[#0088CC] hover:bg-[#0077B5] text-white font-black shadow-md active:scale-95'
                )}
              >
                {task.completed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <span>{task.actionText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

