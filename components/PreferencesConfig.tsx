'use client';

import { Heart, Moon, Calendar, BarChart3 } from 'lucide-react';
import { Preferences } from '@/types';

interface PreferencesConfigProps {
  preferences: Preferences;
  onPreferencesChange: (preferences: Preferences) => void;
}

export default function PreferencesConfig({ preferences, onPreferencesChange }: PreferencesConfigProps) {
  const updatePreference = (key: keyof Preferences, value: Preferences[keyof Preferences]) => {
    onPreferencesChange({
      ...preferences,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Heart size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Preferences & Prioritization</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">Employee Preferences</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.respectEmployeePreferences}
                      onChange={(e) => updatePreference('respectEmployeePreferences', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Respect employee preferences</span>
                      <p className="text-xs text-gray-500">
                        Take into account individual employee availability and preferences
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preference weight
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">Low</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={preferences.preferenceWeight}
                      onChange={(e) => updatePreference('preferenceWeight', parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      disabled={!preferences.respectEmployeePreferences}
                    />
                    <span className="text-xs text-gray-500">High</span>
                  </div>
                  <div className="flex justify-center mt-1">
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(preferences.preferenceWeight * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    How strongly to prioritize employee preferences vs other factors
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Moon size={18} className="text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">Shift Distribution</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.minimizeNightShifts}
                      onChange={(e) => updatePreference('minimizeNightShifts', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Minimize night shifts</span>
                      <p className="text-xs text-gray-500">
                        Reduce the number of night shifts when possible
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.minimizeConsecutiveNightShifts}
                      onChange={(e) => updatePreference('minimizeConsecutiveNightShifts', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Minimize consecutive night shifts</span>
                      <p className="text-xs text-gray-500">
                        Avoid scheduling employees for multiple night shifts in a row
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-purple-600" />
                <h3 className="text-lg font-medium text-gray-900">Weekend & Fairness</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences.spreadWeekendShiftsFairly}
                      onChange={(e) => updatePreference('spreadWeekendShiftsFairly', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Spread weekend shifts fairly</span>
                      <p className="text-xs text-gray-500">
                        Distribute weekend work equally among all employees
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">Preference Summary</h4>
              <div className="space-y-1 text-xs text-purple-700">
                <div>• Employee preferences: {preferences.respectEmployeePreferences ? `${Math.round(preferences.preferenceWeight * 100)}% weight` : 'Disabled'}</div>
                <div>• Minimize night shifts: {preferences.minimizeNightShifts ? 'Enabled' : 'Disabled'}</div>
                <div>• Minimize consecutive nights: {preferences.minimizeConsecutiveNightShifts ? 'Enabled' : 'Disabled'}</div>
                <div>• Fair weekend distribution: {preferences.spreadWeekendShiftsFairly ? 'Enabled' : 'Disabled'}</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Optimization Strategy</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Hard constraints (must be satisfied)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Soft preferences (optimized when possible)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Efficiency goals (coverage & utilization)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Heart size={16} className="text-green-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-green-900">Soft Constraints</h4>
            <p className="text-xs text-green-700 mt-1">
              These preferences will be <strong>optimized</strong> but may be sacrificed if necessary to meet 
              hard constraints or ensure adequate coverage. The system will find the best balance possible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 