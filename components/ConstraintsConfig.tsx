'use client';

import { Settings, Users, Clock, Shield } from 'lucide-react';
import { Constraints } from '@/types';

interface ConstraintsConfigProps {
  constraints: Constraints;
  onConstraintsChange: (constraints: Constraints) => void;
}

export default function ConstraintsConfig({ constraints, onConstraintsChange }: ConstraintsConfigProps) {
  const updateConstraint = (key: keyof Constraints, value: Constraints[keyof Constraints]) => {
    onConstraintsChange({
      ...constraints,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Constraints & Rules</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={18} className="text-indigo-600" />
                <h3 className="text-lg font-medium text-gray-900">Employee Limits</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max hours per employee per week
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="20"
                      max="60"
                      value={constraints.maxHoursPerEmployee}
                      onChange={(e) => updateConstraint('maxHoursPerEmployee', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="w-12 text-sm font-medium text-gray-900">
                      {constraints.maxHoursPerEmployee}h
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max shifts per employee per day
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      value={constraints.maxShiftsPerDay}
                      onChange={(e) => updateConstraint('maxShiftsPerDay', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="w-12 text-sm font-medium text-gray-900">
                      {constraints.maxShiftsPerDay}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max night shifts per employee per week
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="7"
                      value={constraints.maxNightShiftsPerWeek}
                      onChange={(e) => updateConstraint('maxNightShiftsPerWeek', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="w-12 text-sm font-medium text-gray-900">
                      {constraints.maxNightShiftsPerWeek}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={18} className="text-indigo-600" />
                <h3 className="text-lg font-medium text-gray-900">Time Constraints</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum hours between shifts
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="4"
                    max="24"
                    value={constraints.minHoursBetweenShifts}
                    onChange={(e) => updateConstraint('minHoursBetweenShifts', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="w-12 text-sm font-medium text-gray-900">
                    {constraints.minHoursBetweenShifts}h
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ensures adequate rest time between consecutive shifts
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} className="text-indigo-600" />
                <h3 className="text-lg font-medium text-gray-900">Team & Fairness</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={constraints.preferFixedTeams}
                      onChange={(e) => updateConstraint('preferFixedTeams', e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Prefer fixed teams</span>
                      <p className="text-xs text-gray-500">
                        Try to schedule the same people together when possible
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritize fairness
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">Low</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={constraints.prioritizeFairness}
                      onChange={(e) => updateConstraint('prioritizeFairness', parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">High</span>
                  </div>
                  <div className="flex justify-center mt-1">
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(constraints.prioritizeFairness * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Balance between efficiency and equal distribution of shifts
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Constraint Summary</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <div>• Max {constraints.maxHoursPerEmployee}h per employee per week</div>
                <div>• Max {constraints.maxShiftsPerDay} shift(s) per employee per day</div>
                <div>• Max {constraints.maxNightShiftsPerWeek} night shift(s) per employee per week</div>
                <div>• Min {constraints.minHoursBetweenShifts}h rest between shifts</div>
                <div>• Fairness priority: {Math.round(constraints.prioritizeFairness * 100)}%</div>
                {constraints.preferFixedTeams && <div>• Prefer fixed teams enabled</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Shield size={16} className="text-yellow-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">Hard vs Soft Constraints</h4>
            <p className="text-xs text-yellow-700 mt-1">
              These are <strong>hard constraints</strong> that must be satisfied. The system will not generate 
              schedules that violate these rules. For flexible preferences, use the Preferences tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 