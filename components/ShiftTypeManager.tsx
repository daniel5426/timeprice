'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Clock } from 'lucide-react';
import { ShiftType } from '@/types';

interface ShiftTypeManagerProps {
  shiftTypes: ShiftType[];
  onShiftTypesChange: (shiftTypes: ShiftType[]) => void;
}

export default function ShiftTypeManager({ shiftTypes, onShiftTypesChange }: ShiftTypeManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newShiftType, setNewShiftType] = useState<Partial<ShiftType>>({
    requiredRoles: [],
    priority: 5,
    isRepeating: true,
    repeatPattern: 'daily',
  });
  const [editingShiftType, setEditingShiftType] = useState<Partial<ShiftType>>({});

  const roles = ['Manager', 'Cashier', 'Cook', 'Server', 'Cleaner', 'Security'];

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const addShiftType = () => {
    if (!newShiftType.name || !newShiftType.startTime || !newShiftType.endTime) return;
    
    const duration = calculateDuration(newShiftType.startTime, newShiftType.endTime);
    
    const shiftType: ShiftType = {
      id: `shift-${Date.now()}`,
      name: newShiftType.name,
      startTime: newShiftType.startTime,
      endTime: newShiftType.endTime,
      requiredRoles: newShiftType.requiredRoles || [],
      duration,
      isRepeating: newShiftType.isRepeating || false,
      repeatPattern: newShiftType.repeatPattern || 'daily',
      priority: newShiftType.priority || 5,
    };
    
    onShiftTypesChange([...shiftTypes, shiftType]);
    setNewShiftType({
      requiredRoles: [],
      priority: 5,
      isRepeating: true,
      repeatPattern: 'daily',
    });
    setShowAddForm(false);
  };

  const startEditing = (shiftType: ShiftType) => {
    console.log('startEditing called with:', shiftType);
    setEditingId(shiftType.id);
    setEditingShiftType({
      name: shiftType.name,
      startTime: shiftType.startTime,
      endTime: shiftType.endTime,
      requiredRoles: [...shiftType.requiredRoles],
      priority: shiftType.priority,
      isRepeating: shiftType.isRepeating,
      repeatPattern: shiftType.repeatPattern,
    });
    console.log('editingId set to:', shiftType.id);
  };

  const saveEdit = () => {
    if (!editingId || !editingShiftType.name || !editingShiftType.startTime || !editingShiftType.endTime) return;
    
    const duration = calculateDuration(editingShiftType.startTime, editingShiftType.endTime);
    
    const updatedShiftType: ShiftType = {
      id: editingId,
      name: editingShiftType.name,
      startTime: editingShiftType.startTime,
      endTime: editingShiftType.endTime,
      requiredRoles: editingShiftType.requiredRoles || [],
      duration,
      isRepeating: editingShiftType.isRepeating || false,
      repeatPattern: editingShiftType.repeatPattern || 'daily',
      priority: editingShiftType.priority || 5,
    };
    
    onShiftTypesChange(shiftTypes.map(shift => 
      shift.id === editingId ? updatedShiftType : shift
    ));
    
    setEditingId(null);
    setEditingShiftType({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingShiftType({});
  };


  const deleteShiftType = (id: string) => {
    onShiftTypesChange(shiftTypes.filter(shift => shift.id !== id));
  };

  const addRequiredRole = (role: string, count: number) => {
    const existingRoles = newShiftType.requiredRoles || [];
    const existingRole = existingRoles.find(r => r.role === role);
    
    if (existingRole) {
      setNewShiftType({
        ...newShiftType,
        requiredRoles: existingRoles.map(r => 
          r.role === role ? { ...r, count } : r
        ),
      });
    } else {
      setNewShiftType({
        ...newShiftType,
        requiredRoles: [...existingRoles, { role, count }],
      });
    }
  };

  const removeRequiredRole = (role: string) => {
    setNewShiftType({
      ...newShiftType,
      requiredRoles: (newShiftType.requiredRoles || []).filter(r => r.role !== role),
    });
  };

  const addEditingRequiredRole = (role: string, count: number) => {
    const existingRoles = editingShiftType.requiredRoles || [];
    const existingRole = existingRoles.find(r => r.role === role);
    
    if (existingRole) {
      setEditingShiftType({
        ...editingShiftType,
        requiredRoles: existingRoles.map(r => 
          r.role === role ? { ...r, count } : r
        ),
      });
    } else {
      setEditingShiftType({
        ...editingShiftType,
        requiredRoles: [...existingRoles, { role, count }],
      });
    }
  };

  const removeEditingRequiredRole = (role: string) => {
    setEditingShiftType({
      ...editingShiftType,
      requiredRoles: (editingShiftType.requiredRoles || []).filter(r => r.role !== role),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Shift Types</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          <Plus size={16} className="inline mr-1" />
          Add Shift Type
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Add New Shift Type</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
              <input
                type="text"
                value={newShiftType.name || ''}
                onChange={(e) => setNewShiftType({...newShiftType, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Morning, Evening, Night"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newShiftType.priority || 5}
                onChange={(e) => setNewShiftType({...newShiftType, priority: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={newShiftType.startTime || ''}
                onChange={(e) => setNewShiftType({...newShiftType, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={newShiftType.endTime || ''}
                onChange={(e) => setNewShiftType({...newShiftType, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Roles</label>
            <div className="space-y-2">
              {roles.map(role => {
                const existingRole = (newShiftType.requiredRoles || []).find(r => r.role === role);
                return (
                  <div key={role} className="flex items-center gap-2">
                    <span className="w-20 text-sm text-gray-600">{role}:</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={existingRole?.count || 0}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        if (count > 0) {
                          addRequiredRole(role, count);
                        } else {
                          removeRequiredRole(role);
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newShiftType.isRepeating || false}
                onChange={(e) => setNewShiftType({...newShiftType, isRepeating: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Repeating Shift</span>
            </label>
            
            {newShiftType.isRepeating && (
              <div className="mt-2">
                <select
                  value={newShiftType.repeatPattern || 'daily'}
                  onChange={(e) => setNewShiftType({...newShiftType, repeatPattern: e.target.value as 'daily' | 'weekly' | 'custom'})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={addShiftType}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              <Save size={16} className="inline mr-1" />
              Save Shift Type
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

      {editingId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Edit Shift Type</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
              <input
                type="text"
                value={editingShiftType.name || ''}
                onChange={(e) => setEditingShiftType({...editingShiftType, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Morning, Evening, Night"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={editingShiftType.priority || 5}
                onChange={(e) => setEditingShiftType({...editingShiftType, priority: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={editingShiftType.startTime || ''}
                onChange={(e) => setEditingShiftType({...editingShiftType, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={editingShiftType.endTime || ''}
                onChange={(e) => setEditingShiftType({...editingShiftType, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Roles</label>
            <div className="space-y-2">
              {roles.map(role => {
                const existingRole = (editingShiftType.requiredRoles || []).find(r => r.role === role);
                return (
                  <div key={role} className="flex items-center gap-2">
                    <span className="w-20 text-sm text-gray-600">{role}:</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={existingRole?.count || 0}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        if (count > 0) {
                          addEditingRequiredRole(role, count);
                        } else {
                          removeEditingRequiredRole(role);
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editingShiftType.isRepeating || false}
                onChange={(e) => setEditingShiftType({...editingShiftType, isRepeating: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">Repeating Shift</span>
            </label>
            
            {editingShiftType.isRepeating && (
              <div className="mt-2">
                <select
                  value={editingShiftType.repeatPattern || 'daily'}
                  onChange={(e) => setEditingShiftType({...editingShiftType, repeatPattern: e.target.value as 'daily' | 'weekly' | 'custom'})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              <Save size={16} className="inline mr-1" />
              Save Changes
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shiftTypes.map((shiftType) => (
          <div key={shiftType.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">{shiftType.name}</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => startEditing(shiftType)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteShiftType(shiftType.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>{shiftType.startTime} - {shiftType.endTime}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {shiftType.duration}h
                </span>
              </div>
              
              <div>
                <span className="font-medium">Required Roles:</span>
                <div className="mt-1">
                  {shiftType.requiredRoles.map((role, index) => (
                    <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                      {role.count}x {role.role}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs">Priority: {shiftType.priority}/10</span>
                {shiftType.isRepeating && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {shiftType.repeatPattern}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {shiftTypes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No shift types defined yet. Add shift types to get started.</p>
        </div>
      )}
    </div>
  );
} 