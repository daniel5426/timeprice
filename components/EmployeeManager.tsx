'use client';

import { useState, useRef } from 'react';
import { Upload, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { Employee, AvailabilitySlot } from '@/types';
import Papa from 'papaparse';

interface CSVRow {
  Name?: string;
  Role?: string;
  Skills?: string;
  'Max Hours/Week'?: string;
  Availability?: string;
  Preferences?: string;
  Email?: string;
}

interface CSVParsingResult {
  data: CSVRow[];
  errors: Papa.ParseError[];
  meta: Papa.ParseMeta;
}

interface EmployeeManagerProps {
  employees: Employee[];
  onEmployeesChange: (employees: Employee[]) => void;
}

export default function EmployeeManager({ employees, onEmployeesChange }: EmployeeManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [showAddForm, setShowAddForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingEmployee = employees.find(emp => emp.id === editingId);

  const roles = ['Manager', 'Cashier', 'Cook', 'Server', 'Cleaner', 'Security'];

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file as any, {
      header: true,
      complete: (results: CSVParsingResult) => {
        const csvEmployees: Employee[] = results.data.map((row: CSVRow, index: number) => ({
          id: `emp-${Date.now()}-${index}`,
          name: row.Name || '',
          role: row.Role || '',
          skills: row.Skills ? row.Skills.split(',').map((s: string) => s.trim()) : [],
          maxHoursPerWeek: parseInt(row['Max Hours/Week'] ?? '40') || 40,
          availability: parseAvailability(row.Availability ?? ''),
          preferences: row.Preferences ? row.Preferences.split(',').map((p: string) => p.trim()) : [],
          email: row.Email || '',
        }));
        onEmployeesChange([...employees, ...csvEmployees]);
      },
      error: (error: any) => {
        console.error('Error parsing CSV:', error);
      }
    });
  };

  const parseAvailability = (availabilityString: string): AvailabilitySlot[] => {
    if (!availabilityString.trim()) return [];
    
    try {
      const dayMap: { [key: string]: number } = {
        'sun': 0, 'sunday': 0,
        'mon': 1, 'monday': 1,
        'tue': 2, 'tuesday': 2,
        'wed': 3, 'wednesday': 3,
        'thu': 4, 'thursday': 4,
        'fri': 5, 'friday': 5,
        'sat': 6, 'saturday': 6,
      };

      const slots: AvailabilitySlot[] = [];
      
      // Handle "Weekends Only"
      if (availabilityString.toLowerCase().includes('weekends only')) {
        slots.push(
          { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' }, // Sunday
          { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' }  // Saturday
        );
        return slots;
      }
      
      // Handle "Night Shifts"
      if (availabilityString.toLowerCase().includes('night shifts')) {
        for (let day = 0; day < 7; day++) {
          slots.push({
            dayOfWeek: day,
            startTime: '22:00',
            endTime: '06:00'
          });
        }
        return slots;
      }
      
      // Handle "Mon–Sun 12:00–20:00" format (with en dash)
      const rangeMatch = availabilityString.match(/(\w+)[–-](\w+)\s+(\d+):(\d+)–(\d+):(\d+)/i);
      if (rangeMatch) {
        const [, startDay, endDay, startHour, startMin, endHour, endMin] = rangeMatch;
        const startDayNum = dayMap[startDay.toLowerCase()];
        const endDayNum = dayMap[endDay.toLowerCase()];
        
        if (startDayNum !== undefined && endDayNum !== undefined) {
          for (let day = startDayNum; day <= endDayNum; day++) {
            slots.push({
              dayOfWeek: day,
              startTime: `${startHour.padStart(2, '0')}:${startMin.padStart(2, '0')}`,
              endTime: `${endHour.padStart(2, '0')}:${endMin.padStart(2, '0')}`,
            });
          }
        }
        return slots;
      }
      
      // Handle "Mon-Fri 9-17" format (with regular dash)
      const simpleRangeMatch = availabilityString.match(/(\w+)-(\w+)\s+(\d+)-(\d+)/i);
      if (simpleRangeMatch) {
        const [, startDay, endDay, startHour, endHour] = simpleRangeMatch;
        const startDayNum = dayMap[startDay.toLowerCase()];
        const endDayNum = dayMap[endDay.toLowerCase()];
        
        if (startDayNum !== undefined && endDayNum !== undefined) {
          for (let day = startDayNum; day <= endDayNum; day++) {
            slots.push({
              dayOfWeek: day,
              startTime: `${startHour.padStart(2, '0')}:00`,
              endTime: `${endHour.padStart(2, '0')}:00`,
            });
          }
        }
        return slots;
      }
      
      return slots;
    } catch (error) {
      console.warn('Failed to parse availability:', availabilityString, error);
      return [];
    }
  };

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.role) return;
    
    const employee: Employee = {
      id: `emp-${Date.now()}`,
      name: newEmployee.name,
      role: newEmployee.role,
      skills: newEmployee.skills || [],
      maxHoursPerWeek: newEmployee.maxHoursPerWeek || 40,
      availability: newEmployee.availability || [],
      preferences: newEmployee.preferences || [],
      email: newEmployee.email || '',
    };
    
    onEmployeesChange([...employees, employee]);
    setNewEmployee({});
    setShowAddForm(false);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    onEmployeesChange(employees.map(emp => 
      emp.id === id ? { ...emp, ...updates } : emp
    ));
  };

  const deleteEmployee = (id: string) => {
    onEmployeesChange(employees.filter(emp => emp.id !== id));
  };

  const downloadTemplate = () => {
    const csvContent = 'Name,Role,Skills,Max Hours/Week,Availability,Preferences,Email\n' +
                      'John Doe,Manager,"Leadership,Customer Service",40,"Mon-Fri 9-17","No nights",john@example.com\n' +
                      'Jane Smith,Cashier,"Cash Handling,POS Systems",35,"Mon-Sun 10-18","Prefers weekends",jane@example.com';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const loadTestData = async () => {
    try {
      const response = await fetch('/employee_schedule_test_data.csv');
      const csvText = await response.text();
      
      Papa.parse(csvText as any, {
        header: true,
        complete: (results: CSVParsingResult) => {
          const csvEmployees: Employee[] = results.data
            .filter((row: CSVRow) => row.Name && row.Role)
            .map((row: CSVRow, index: number) => ({
              id: `emp-${Date.now()}-${index}`,
              name: row.Name || '',
              role: row.Role || '',
              skills: row.Skills ? row.Skills.split(',').map((s: string) => s.trim()) : [],
              maxHoursPerWeek: parseInt(row['Max Hours/Week'] ?? '40') || 40,
              availability: parseAvailability(row.Availability || ''),
              preferences: row.Preferences ? row.Preferences.split(',').map((p: string) => p.trim()) : [],
              email: row.Email || '',
            }));
          onEmployeesChange([...employees, ...csvEmployees]);
        },
        error: (error: any) => {
          console.error('Error parsing test data CSV:', error);
        }
      });
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  };

  const clearAllEmployees = () => {
    if (window.confirm('Are you sure you want to remove all employees? This action cannot be undone.')) {
      onEmployeesChange([]);
    }
  };

  const saveEditedEmployee = () => {
    if (!editingId || !editingEmployee) return;
    
    const updatedEmployee: Employee = {
      ...editingEmployee,
      name: newEmployee.name || editingEmployee.name,
      role: newEmployee.role || editingEmployee.role,
      skills: newEmployee.skills || editingEmployee.skills,
      maxHoursPerWeek: newEmployee.maxHoursPerWeek || editingEmployee.maxHoursPerWeek,
      availability: newEmployee.availability || editingEmployee.availability,
      preferences: newEmployee.preferences || editingEmployee.preferences,
      email: newEmployee.email || editingEmployee.email,
    };
    
    updateEmployee(editingId, updatedEmployee);
    setEditingId(null);
    setNewEmployee({});
  };

  const startEditing = (employee: Employee) => {
    setEditingId(employee.id);
    setNewEmployee({
      name: employee.name,
      role: employee.role,
      skills: employee.skills,
      maxHoursPerWeek: employee.maxHoursPerWeek,
      availability: employee.availability,
      preferences: employee.preferences,
      email: employee.email,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        <div className="flex gap-2">
          <button
            onClick={loadTestData}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-300 rounded-md hover:bg-green-100"
          >
            Load Test Data
          </button>
          <button
            onClick={clearAllEmployees}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100"
          >
            Clear All
          </button>
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Download Template
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            <Plus size={16} className="inline mr-1" />
            Add Employee
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Upload size={16} />
            Upload CSV
          </button>
          <p className="text-sm text-gray-600">
            Upload a CSV file with employee data (Name, Role, Skills, Max Hours/Week, Availability, Preferences, Email)
          </p>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Add New Employee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newEmployee.name || ''}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Employee name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={newEmployee.role || ''}
                onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Hours/Week</label>
              <input
                type="number"
                value={newEmployee.maxHoursPerWeek || ''}
                onChange={(e) => setNewEmployee({...newEmployee, maxHoursPerWeek: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={newEmployee.email || ''}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="employee@example.com"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <div className="space-y-2">
              {daysOfWeek.map((day, index) => {
                const existingSlot = (newEmployee.availability || []).find(slot => slot.dayOfWeek === index);
                return (
                  <div key={day} className="flex items-center gap-2">
                    <span className="w-20 text-sm text-gray-600">{day}:</span>
                    <input
                      type="time"
                      placeholder="Start"
                      value={existingSlot?.startTime || ''}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => {
                        const availability = newEmployee.availability || [];
                        const existingSlot = availability.find(slot => slot.dayOfWeek === index);
                        if (existingSlot) {
                          existingSlot.startTime = e.target.value;
                        } else if (e.target.value) {
                          availability.push({
                            dayOfWeek: index,
                            startTime: e.target.value,
                            endTime: '17:00'
                          });
                        }
                        setNewEmployee({...newEmployee, availability});
                      }}
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <input
                      type="time"
                      placeholder="End"
                      value={existingSlot?.endTime || ''}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => {
                        const availability = newEmployee.availability || [];
                        const existingSlot = availability.find(slot => slot.dayOfWeek === index);
                        if (existingSlot) {
                          existingSlot.endTime = e.target.value;
                        } else if (e.target.value) {
                          availability.push({
                            dayOfWeek: index,
                            startTime: '09:00',
                            endTime: e.target.value
                          });
                        }
                        setNewEmployee({...newEmployee, availability});
                      }}
                    />
                    {existingSlot && (
                      <button
                        type="button"
                        onClick={() => {
                          const availability = newEmployee.availability || [];
                          const filteredAvailability = availability.filter(slot => slot.dayOfWeek !== index);
                          setNewEmployee({...newEmployee, availability: filteredAvailability});
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove this day"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Set available hours for each day. Leave blank for days off.
            </p>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={addEmployee}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              <Save size={16} className="inline mr-1" />
              Save Employee
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingId && editingEmployee && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Edit Employee: {editingEmployee.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newEmployee.name || ''}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Employee name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={newEmployee.role || ''}
                onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Hours/Week</label>
              <input
                type="number"
                value={newEmployee.maxHoursPerWeek || ''}
                onChange={(e) => setNewEmployee({...newEmployee, maxHoursPerWeek: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={newEmployee.email || ''}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="employee@example.com"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <div className="space-y-2">
              {daysOfWeek.map((day, index) => {
                const existingSlot = (newEmployee.availability || []).find(slot => slot.dayOfWeek === index);
                return (
                  <div key={day} className="flex items-center gap-2">
                    <span className="w-20 text-sm text-gray-600">{day}:</span>
                    <input
                      type="time"
                      placeholder="Start"
                      value={existingSlot?.startTime || ''}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => {
                        const availability = newEmployee.availability || [];
                        const existingSlot = availability.find(slot => slot.dayOfWeek === index);
                        if (existingSlot) {
                          existingSlot.startTime = e.target.value;
                        } else if (e.target.value) {
                          availability.push({
                            dayOfWeek: index,
                            startTime: e.target.value,
                            endTime: '17:00'
                          });
                        }
                        setNewEmployee({...newEmployee, availability});
                      }}
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <input
                      type="time"
                      placeholder="End"
                      value={existingSlot?.endTime || ''}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => {
                        const availability = newEmployee.availability || [];
                        const existingSlot = availability.find(slot => slot.dayOfWeek === index);
                        if (existingSlot) {
                          existingSlot.endTime = e.target.value;
                        } else if (e.target.value) {
                          availability.push({
                            dayOfWeek: index,
                            startTime: '09:00',
                            endTime: e.target.value
                          });
                        }
                        setNewEmployee({...newEmployee, availability});
                      }}
                    />
                    {existingSlot && (
                      <button
                        type="button"
                        onClick={() => {
                          const availability = newEmployee.availability || [];
                          const filteredAvailability = availability.filter(slot => slot.dayOfWeek !== index);
                          setNewEmployee({...newEmployee, availability: filteredAvailability});
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove this day"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Set available hours for each day. Leave blank for days off.
            </p>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={saveEditedEmployee}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              <Save size={16} className="inline mr-1" />
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setNewEmployee({});
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Hours/Week
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {employee.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.maxHoursPerWeek}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.skills.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {employee.availability.length > 0 ? (
                    <div className="space-y-1">
                      {employee.availability.map((slot, index) => (
                        <div key={index} className="text-xs">
                          {daysOfWeek[slot.dayOfWeek]}: {slot.startTime}-{slot.endTime}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No restrictions</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => startEditing(employee)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteEmployee(employee.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {employees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No employees added yet. Upload a CSV file or add employees manually.</p>
          </div>
        )}
      </div>
    </div>
  );
} 