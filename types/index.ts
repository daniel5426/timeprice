export interface Employee {
  id: string;
  name: string;
  role: string;
  skills: string[];
  maxHoursPerWeek: number;
  availability: AvailabilitySlot[];
  preferences: string[];
  email?: string;
}

export interface AvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ShiftType {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  requiredRoles: RequiredRole[];
  duration: number;
  isRepeating: boolean;
  repeatPattern: 'daily' | 'weekly' | 'custom';
  priority: number;
}

export interface RequiredRole {
  role: string;
  count: number;
}

export interface SchedulingPeriod {
  startDate: Date;
  endDate: Date;
  daysOff: Date[];
  holidays: Date[];
  minRestTimeBetweenShifts: number;
  weekendRules: WeekendRules;
}

export interface WeekendRules {
  rotateWeekends: boolean;
  avoidBackToBack: boolean;
  maxWeekendsPerMonth: number;
}

export interface Constraints {
  maxHoursPerEmployee: number;
  maxShiftsPerDay: number;
  maxNightShiftsPerWeek: number;
  minHoursBetweenShifts: number;
  preferFixedTeams: boolean;
  prioritizeFairness: number;
}

export interface Preferences {
  respectEmployeePreferences: boolean;
  minimizeNightShifts: boolean;
  spreadWeekendShiftsFairly: boolean;
  minimizeConsecutiveNightShifts: boolean;
  preferenceWeight: number;
}

export interface GeneratedShift {
  id: string;
  shiftTypeId: string;
  date: Date | string; // API returns ISO string, frontend may convert to Date
  startTime: string;
  endTime: string;
  assignedEmployees: string[];
  status: 'confirmed' | 'pending' | 'conflict';
}

export interface ScheduleResult {
  shifts: GeneratedShift[];
  analytics: ScheduleAnalytics;
  violations: ConstraintViolation[];
}

export interface ScheduleAnalytics {
  shiftCoveragePercentage: number;
  preferenceSatisfactionScore: number;
  fairnessMetric: number;
  totalHoursScheduled: number;
  employeeUtilization: EmployeeUtilization[];
}

export interface EmployeeUtilization {
  employeeId: string;
  totalHours: number;
  utilizationPercentage: number;
  shiftsAssigned: number;
  preferencesRespected: number;
}

export interface ConstraintViolation {
  type: 'hard' | 'soft';
  description: string;
  severity: number;
  affectedEmployees: string[];
  affectedShifts: string[];
}

export interface SchedulingConfig {
  employees: Employee[];
  shiftTypes: ShiftType[];
  schedulingPeriod: SchedulingPeriod;
  constraints: Constraints;
  preferences: Preferences;
} 