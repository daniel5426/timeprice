'use client';

import { useState } from 'react';
import { Play, Loader2, AlertCircle, Sparkles, FileText, Copy, X } from 'lucide-react';
import { SchedulingConfig, ScheduleResult, GeneratedShift, ScheduleAnalytics, EmployeeUtilization } from '@/types';

interface ScheduleGeneratorProps {
  config: SchedulingConfig;
  onScheduleGenerated: (result: ScheduleResult) => void;
  canGenerate: boolean;
}

export default function ScheduleGenerator({ config, onScheduleGenerated, canGenerate }: ScheduleGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configJson, setConfigJson] = useState<string>('');

  const generateSchedule = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Convert Date objects to ISO strings for API compatibility
      const apiConfig = {
        ...config,
        schedulingPeriod: config.schedulingPeriod ? {
          ...config.schedulingPeriod,
          startDate: config.schedulingPeriod.startDate.toISOString(),
          endDate: config.schedulingPeriod.endDate.toISOString(),
          daysOff: config.schedulingPeriod.daysOff.map(date => date.toISOString()),
          holidays: config.schedulingPeriod.holidays.map(date => date.toISOString()),
        } : undefined,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiConfig),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      console.log(result);

      // Fix: Convert all date strings to Date objects for UI compatibility
      const parseDates = (data: ScheduleResult): ScheduleResult => {
        return {
          ...data,
          shifts: data.shifts.map((shift) => ({
            ...shift,
            date: new Date(shift.date),
          })),
          analytics: data.analytics,
          violations: data.violations,
        };
      };

      onScheduleGenerated(parseDates(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  const showConfigAsJSON = () => {
    try {
      // Convert Date objects to ISO strings for JSON serialization
      const apiConfig = {
        ...config,
        schedulingPeriod: config.schedulingPeriod ? {
          ...config.schedulingPeriod,
          startDate: config.schedulingPeriod.startDate.toISOString(),
          endDate: config.schedulingPeriod.endDate.toISOString(),
          daysOff: config.schedulingPeriod.daysOff.map(date => date.toISOString()),
          holidays: config.schedulingPeriod.holidays.map(date => date.toISOString()),
        } : undefined,
      };

      const jsonString = JSON.stringify(apiConfig, null, 2);
      setConfigJson(jsonString);
      setShowConfigModal(true);
    } catch (error) {
      console.error('Failed to generate config JSON:', error);
      alert('Failed to generate configuration JSON. Please check the console for details.');
    }
  };

  const copyConfigToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(configJson);
      alert('Configuration copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please select and copy manually.');
    }
  };

  const getValidationErrors = () => {
    const errors = [];
    
    if (!config.employees?.length) {
      errors.push('At least one employee is required');
    }
    
    if (!config.shiftTypes?.length) {
      errors.push('At least one shift type is required');
    }
    
    if (!config.schedulingPeriod) {
      errors.push('Scheduling period must be configured');
    }

    return errors;
  };

  const validationErrors = getValidationErrors();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Generate Schedule</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>📋 Employees: {config.employees?.length || 0}</div>
              <div>⏰ Shift Types: {config.shiftTypes?.length || 0}</div>
              <div>📅 Period: {config.schedulingPeriod ? 
                `${config.schedulingPeriod.startDate.toLocaleDateString()} - ${config.schedulingPeriod.endDate.toLocaleDateString()}` : 
                'Not configured'
              }</div>
              <div>⚙️ Max Hours/Week: {config.constraints?.maxHoursPerEmployee || 0}</div>
              <div>🎯 Fairness Priority: {Math.round((config.constraints?.prioritizeFairness || 0) * 100)}%</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Optimization</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Constraint satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Preference optimization</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Fairness balancing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Coverage maximization</span>
              </div>
            </div>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-900">Configuration Issues</h4>
                <ul className="text-xs text-red-700 mt-1 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-900">Generation Error</h4>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={showConfigAsJSON}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText size={16} />
            Show Config JSON
          </button>
          
          <button
            onClick={generateSchedule}
            disabled={!canGenerate || isGenerating || validationErrors.length > 0}
            className="flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Play size={20} />
                Generate Optimal Schedule
              </>
            )}
          </button>
        </div>

        {isGenerating && (
          <div className="mt-4 text-center">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                AI is analyzing constraints and optimizing assignments...
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Config JSON Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Configuration JSON</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">
                  Copy this JSON configuration to share or debug issues:
                </p>
                <button
                  onClick={copyConfigToClipboard}
                  className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100"
                >
                  <Copy size={14} />
                  Copy to Clipboard
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                  {configJson}
                </pre>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}