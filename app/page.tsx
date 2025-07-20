'use client';

import { useState } from 'react';
import { Calendar, Users, Clock, Settings, BarChart3, Download } from 'lucide-react';
import EmployeeManager from '@/components/EmployeeManager';
import ShiftTypeManager from '@/components/ShiftTypeManager';
import SchedulingPeriodConfig from '@/components/SchedulingPeriodConfig';
import ConstraintsConfig from '@/components/ConstraintsConfig';
import PreferencesConfig from '@/components/PreferencesConfig';
import ScheduleGenerator from '@/components/ScheduleGenerator';
import ScheduleResults from '@/components/ScheduleResults';
import { SchedulingConfig, ScheduleResult } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState('employees');
  const [schedulingConfig, setSchedulingConfig] = useState<Partial<SchedulingConfig>>({
    employees: [],
    shiftTypes: [],
    schedulingPeriod: undefined,
    constraints: {
      maxHoursPerEmployee: 40,
      maxShiftsPerDay: 1,
      maxNightShiftsPerWeek: 2,
      minHoursBetweenShifts: 12,
      preferFixedTeams: false,
      prioritizeFairness: 0.7,
    },
    preferences: {
      respectEmployeePreferences: true,
      minimizeNightShifts: true,
      spreadWeekendShiftsFairly: true,
      minimizeConsecutiveNightShifts: true,
      preferenceWeight: 0.8,
    },
  });
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null);

  const tabs = [
    { id: 'employees', label: 'Employee Management', icon: Users },
    { id: 'shifts', label: 'Shift Types', icon: Clock },
    { id: 'period', label: 'Scheduling Period', icon: Calendar },
    { id: 'constraints', label: 'Constraints & Rules', icon: Settings },
    { id: 'preferences', label: 'Preferences', icon: BarChart3 },
    { id: 'generate', label: 'Generate Schedule', icon: Download },
  ];

  const updateConfig = (section: keyof SchedulingConfig, data: SchedulingConfig[keyof SchedulingConfig]) => {
    setSchedulingConfig(prev => ({
      ...prev,
      [section]: data,
    }));
  };

  const canGenerate = Boolean(
    (schedulingConfig.employees?.length ?? 0) > 0 && 
    (schedulingConfig.shiftTypes?.length ?? 0) > 0 && 
    schedulingConfig.schedulingPeriod
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shift Scheduler
          </h1>
          <p className="text-lg text-gray-600">
            Create optimal work schedules with AI-powered optimization
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'employees' && (
              <EmployeeManager
                employees={schedulingConfig.employees || []}
                onEmployeesChange={(employees) => updateConfig('employees', employees)}
              />
            )}

            {activeTab === 'shifts' && (
              <ShiftTypeManager
                shiftTypes={schedulingConfig.shiftTypes || []}
                onShiftTypesChange={(shiftTypes) => updateConfig('shiftTypes', shiftTypes)}
              />
            )}

            {activeTab === 'period' && (
              <SchedulingPeriodConfig
                schedulingPeriod={schedulingConfig.schedulingPeriod}
                onSchedulingPeriodChange={(period) => updateConfig('schedulingPeriod', period)}
              />
            )}

            {activeTab === 'constraints' && (
              <ConstraintsConfig
                constraints={schedulingConfig.constraints!}
                onConstraintsChange={(constraints) => updateConfig('constraints', constraints)}
              />
            )}

            {activeTab === 'preferences' && (
              <PreferencesConfig
                preferences={schedulingConfig.preferences!}
                onPreferencesChange={(preferences) => updateConfig('preferences', preferences)}
              />
            )}

            {activeTab === 'generate' && (
              <div className="space-y-6">
                <ScheduleGenerator
                  config={schedulingConfig as SchedulingConfig}
                  onScheduleGenerated={setScheduleResult}
                  canGenerate={canGenerate}
                />
                
                {scheduleResult && (
                  <ScheduleResults 
                    result={scheduleResult} 
                    employees={schedulingConfig.employees || []}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
