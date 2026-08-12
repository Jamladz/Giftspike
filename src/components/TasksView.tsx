import React, { useState } from 'react';
import { DynamicNumber } from './DynamicNumber';
import { CheckCircle2, Circle, Flame, Sparkles, Users, Send, ExternalLink, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  title: string;
  reward: number;
  category: 'daily' | 'social' | 'quest';
  icon: any;
  completed: boolean;
  progress?: { current: number; total: number };
  actionText: string;
}

export function TasksView() {
  const [userGram, setUserGram] = useState(1240.5);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Daily Check-in',
      reward: 15,
      category: 'daily',
      icon: Flame,
      completed: false,
      actionText: 'Claim',
    },
    {
      id: 'task-2',
      title: 'Join GRAM Official Channel',
      reward: 50,
      category: 'social',
      icon: Send,
      completed: false,
      actionText: 'Join Channel',
    },
    {
      id: 'task-3',
      title: 'Invite 3 Friends to Telegram Mini App',
      reward: 150,
      category: 'quest',
      icon: Users,
      completed: false,
      progress: { current: 1, total: 3 },
      actionText: 'Invite',
    },
    {
      id: 'task-4',
      title: 'Connect TON Wallet',
      reward: 30,
      category: 'social',
      icon: Sparkles,
      completed: true,
      actionText: 'Completed',
    },
  ]);

  const handleTaskAction = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && !t.completed) {
          setUserGram((g) => g + t.reward);
          return { ...t, completed: true, actionText: 'Completed' };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1C1C1E] via-[#252529] to-[#1C1C1E] rounded-3xl p-5 border border-[#3A3A3C]/70 relative overflow-hidden shadow-lg">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#0088CC]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0088CC] bg-[#0088CC]/10 px-2.5 py-0.5 rounded-full border border-[#0088CC]/20">
                Earn GRAM
              </span>
              <span className="text-xs text-[#8E8E93] font-medium">Daily Rewards</span>
            </div>
            <h2 className="text-xl font-black text-[#F5F5F7] tracking-tight">Tasks & Quests</h2>
            <p className="text-xs text-[#8E8E93] mt-0.5">Complete simple tasks to earn free GRAM tokens</p>
          </div>
          <div className="bg-[#141417] px-3.5 py-2 rounded-2xl border border-[#2C2C2E] text-center">
            <p className="text-[9px] uppercase font-bold text-[#8E8E93] mb-0.5">Streak</p>
            <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
              <Flame className="w-4 h-4 fill-amber-400/20" />
              <DynamicNumber value={3} imageClassName="h-3" />
              <span className="text-[10px] mt-0.5">Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93] px-1">Available Tasks</h3>
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <div
              key={task.id}
              className={cn(
                'bg-[#1C1C1E] rounded-2xl p-4 border border-[#2C2C2E] flex items-center justify-between gap-3 transition-all',
                task.completed && 'opacity-70 bg-[#161618]'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
                    task.completed
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-[#0088CC]/10 border-[#0088CC]/20 text-[#0088CC]'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#F5F5F7] truncate">{task.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                      +<DynamicNumber value={task.reward} imageClassName="h-3" />
                      <img src="https://i.suar.me/zXrj0/l" alt="GRAM" className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                    </span>
                    {task.progress && (
                      <div className="flex items-center text-[#8E8E93] bg-[#2C2C2E] px-1.5 py-0.5 rounded gap-[1px]">
                        <DynamicNumber value={`${task.progress.current}/${task.progress.total}`} imageClassName="h-2.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTaskAction(task.id)}
                disabled={task.completed}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5',
                  task.completed
                    ? 'bg-[#2C2C2E] text-green-400 cursor-default'
                    : 'bg-[#0088CC] hover:bg-[#0099EE] text-white shadow-md active:scale-95'
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
