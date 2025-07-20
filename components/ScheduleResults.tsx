'use client';

import { useState } from 'react';
import { Download, Calendar, BarChart3, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScheduleResult, GeneratedShift, Employee } from '@/types';
import { format, parseISO } from 'date-fns';

interface ScheduleResultsProps {
  result: ScheduleResult;
  employees?: Employee[];
}

export default function ScheduleResults({ result, employees = [] }: ScheduleResultsProps) {
  const [activeView, setActiveView] = useState<'calendar' | 'analytics' | 'violations'>('calendar');
  
  console.log('ScheduleResults received employees:', employees);
  console.log('ScheduleResults received result:', result);

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Shift Type', 'Start Time', 'End Time', 'Assigned Employees', 'Status'].join(','),
      ...result.shifts.map(shift => [
        format(typeof shift.date === 'string' ? parseISO(shift.date) : shift.date, 'yyyy-MM-dd'),
        shift.shiftTypeId,
        shift.startTime,
        shift.endTime,
        shift.assignedEmployees.join(';'),
        shift.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    window.print();
  };

  const groupShiftsByDate = (shifts: GeneratedShift[]) => {
    const grouped: { [date: string]: GeneratedShift[] } = {};
    shifts.forEach(shift => {
      const shiftDate = typeof shift.date === 'string' ? parseISO(shift.date) : shift.date;
      const dateKey = format(shiftDate, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(shift);
    });
    return grouped;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    console.log('Looking for employee:', employeeId, 'Found:', employee);
    return employee ? employee.name : employeeId;
  };

  const groupedShifts = groupShiftsByDate(result.shifts);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Schedule Results</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download size={16} className="inline mr-1" />
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            <Download size={16} className="inline mr-1" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Shift Coverage</p>
              <p className={`text-2xl font-bold ${getScoreColor(result.analytics.shiftCoveragePercentage)}`}>
                {Math.round(result.analytics.shiftCoveragePercentage)}%
              </p>
            </div>
            <div className={`p-2 rounded-full ${getScoreBg(result.analytics.shiftCoveragePercentage)}`}>
              <BarChart3 size={20} className={getScoreColor(result.analytics.shiftCoveragePercentage)} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Preference Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(result.analytics.preferenceSatisfactionScore)}`}>
                {Math.round(result.analytics.preferenceSatisfactionScore)}%
              </p>
            </div>
            <div className={`p-2 rounded-full ${getScoreBg(result.analytics.preferenceSatisfactionScore)}`}>
              <CheckCircle size={20} className={getScoreColor(result.analytics.preferenceSatisfactionScore)} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fairness Metric</p>
              <p className={`text-2xl font-bold ${getScoreColor(result.analytics.fairnessMetric)}`}>
                {Math.round(result.analytics.fairnessMetric)}%
              </p>
            </div>
            <div className={`p-2 rounded-full ${getScoreBg(result.analytics.fairnessMetric)}`}>
              <Users size={20} className={getScoreColor(result.analytics.fairnessMetric)} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(result.analytics.totalHoursScheduled)}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-100">
              <Calendar size={20} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'calendar', label: 'Calendar View', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'violations', label: 'Violations', icon: AlertTriangle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as 'calendar' | 'analytics' | 'violations')}
                  className={`${
                    activeView === tab.id
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
          {activeView === 'calendar' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Schedule Calendar</h3>
              <div className="space-y-4">
                {Object.entries(groupedShifts).map(([date, shifts]) => (
                  <div key={date} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {format(parseISO(date), 'EEEE, MMMM dd, yyyy')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {shifts.map((shift) => (
                        <div key={shift.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {shift.startTime} - {shift.endTime}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              shift.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              shift.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {shift.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            {shift.assignedEmployees.length > 0 ? (
                              <div>
                                <div className="font-medium mb-1">Assigned Employees:</div>
                                <div className="space-y-1">
                                  {shift.assignedEmployees.map(employeeId => (
                                    <div key={employeeId} className="text-gray-700">
                                      • {getEmployeeName(employeeId)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-500 italic">No employees assigned</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Employee Utilization</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilization %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shifts Assigned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preferences Respected
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.analytics.employeeUtilization.map((util) => (
                      <tr key={util.employeeId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {util.employeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.round(util.totalHours)}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${Math.min(util.utilizationPercentage, 100)}%` }}
                              ></div>
                            </div>
                            {Math.round(util.utilizationPercentage)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {util.shiftsAssigned}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.round(util.preferencesRespected)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'violations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Constraint Violations</h3>
              {result.violations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <p className="text-gray-500">No constraint violations detected!</p>
                  <p className="text-sm text-gray-400 mt-1">
                    All hard constraints have been satisfied in this schedule.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.violations.map((violation, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      violation.type === 'hard' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className={`mt-0.5 ${
                          violation.type === 'hard' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <div>
                          <h4 className={`text-sm font-medium ${
                            violation.type === 'hard' ? 'text-red-900' : 'text-yellow-900'
                          }`}>
                            {violation.type === 'hard' ? 'Hard Constraint' : 'Soft Constraint'} Violation
                          </h4>
                          <p className={`text-xs mt-1 ${
                            violation.type === 'hard' ? 'text-red-700' : 'text-yellow-700'
                          }`}>
                            {violation.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 