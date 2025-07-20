'use client';

import { useState } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { SchedulingPeriod } from '@/types';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface SchedulingPeriodConfigProps {
  schedulingPeriod?: SchedulingPeriod;
  onSchedulingPeriodChange: (period: SchedulingPeriod) => void;
}

export default function SchedulingPeriodConfig({ 
  schedulingPeriod, 
  onSchedulingPeriodChange 
}: SchedulingPeriodConfigProps) {
  const [newHoliday, setNewHoliday] = useState('');

  const updatePeriod = (updates: Partial<SchedulingPeriod>) => {
    const updated = {
      ...schedulingPeriod,
      ...updates,
    } as SchedulingPeriod;
    onSchedulingPeriodChange(updated);
  };

  const setQuickPeriod = (type: 'week' | 'month') => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    if (type === 'week') {
      startDate = startOfWeek(today, { weekStartsOn: 1 });
      endDate = endOfWeek(today, { weekStartsOn: 1 });
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    updatePeriod({
      startDate,
      endDate,
      daysOff: schedulingPeriod?.daysOff || [],
      holidays: schedulingPeriod?.holidays || [],
      minRestTimeBetweenShifts: schedulingPeriod?.minRestTimeBetweenShifts || 12,
      weekendRules: schedulingPeriod?.weekendRules || {
        rotateWeekends: true,
        avoidBackToBack: true,
        maxWeekendsPerMonth: 2,
      },
    });
  };

  const addHoliday = () => {
    if (!newHoliday) return;
    const holidayDate = new Date(newHoliday);
    const currentHolidays = schedulingPeriod?.holidays || [];
    
    updatePeriod({
      holidays: [...currentHolidays, holidayDate],
    });
    setNewHoliday('');
  };

  const removeHoliday = (index: number) => {
    const currentHolidays = schedulingPeriod?.holidays || [];
    updatePeriod({
      holidays: currentHolidays.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Scheduling Period</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setQuickPeriod('week')}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            This Week
          </button>
          <button
            onClick={() => setQuickPeriod('month')}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            This Month
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={schedulingPeriod?.startDate ? format(schedulingPeriod.startDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => updatePeriod({ startDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={schedulingPeriod?.endDate ? format(schedulingPeriod.endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => updatePeriod({ endDate: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Rest Time Between Shifts (hours)
          </label>
          <input
            type="number"
            min="1"
            max="24"
            value={schedulingPeriod?.minRestTimeBetweenShifts || 12}
            onChange={(e) => updatePeriod({ minRestTimeBetweenShifts: parseInt(e.target.value) })}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Holidays & Days Off
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addHoliday}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-2">
            {schedulingPeriod?.holidays?.map((holiday, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span className="text-sm">{format(holiday, 'MMM dd, yyyy')}</span>
                <button
                  onClick={() => removeHoliday(index)}
                  className="text-red-600 hover:text-red-900"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekend Rules</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={schedulingPeriod?.weekendRules?.rotateWeekends || false}
                onChange={(e) => updatePeriod({
                  weekendRules: {
                    ...schedulingPeriod?.weekendRules,
                    rotateWeekends: e.target.checked,
                  } as SchedulingPeriod['weekendRules']
                })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Rotate weekends fairly</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={schedulingPeriod?.weekendRules?.avoidBackToBack || false}
                onChange={(e) => updatePeriod({
                  weekendRules: {
                    ...schedulingPeriod?.weekendRules,
                    avoidBackToBack: e.target.checked,
                  } as SchedulingPeriod['weekendRules']
                })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Avoid back-to-back weekends</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max weekends per employee per month
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={schedulingPeriod?.weekendRules?.maxWeekendsPerMonth || 2}
                onChange={(e) => updatePeriod({
                  weekendRules: {
                    ...schedulingPeriod?.weekendRules,
                    maxWeekendsPerMonth: parseInt(e.target.value),
                  } as SchedulingPeriod['weekendRules']
                })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 