#!/usr/bin/env python3

import requests
import json
from datetime import datetime, timedelta

# Test data that matches frontend format
test_config = {
    "employees": [
        {
            "id": "emp1",
            "name": "John Manager",
            "role": "Manager",
            "skills": ["Leadership", "Customer Service"],
            "maxHoursPerWeek": 40,
            "availability": [
                {
                    "dayOfWeek": 0,  # Monday
                    "startTime": "09:00",
                    "endTime": "17:00"
                },
                {
                    "dayOfWeek": 1,  # Tuesday
                    "startTime": "09:00",
                    "endTime": "17:00"
                }
            ],
            "preferences": ["Morning shifts"],
            "email": "john@example.com"
        }
    ],
    "shiftTypes": [
        {
            "id": "morning-shift",
            "name": "Morning Shift",
            "startTime": "09:00",
            "endTime": "17:00",
            "requiredRoles": [
                {
                    "role": "Manager",
                    "count": 1
                }
            ],
            "duration": 8.0,
            "isRepeating": True,
            "repeatPattern": "daily",
            "priority": 5
        }
    ],
    "schedulingPeriod": {
        "startDate": "2024-01-15T00:00:00Z",  # Monday
        "endDate": "2024-01-16T23:59:59Z",    # Tuesday
        "daysOff": [],
        "holidays": [],
        "minRestTimeBetweenShifts": 12,
        "weekendRules": {
            "rotateWeekends": True,
            "avoidBackToBack": True,
            "maxWeekendsPerMonth": 2
        }
    },
    "constraints": {
        "maxHoursPerEmployee": 40,
        "maxShiftsPerDay": 1,
        "maxNightShiftsPerWeek": 2,
        "minHoursBetweenShifts": 12,
        "preferFixedTeams": False,
        "prioritizeFairness": 0.8
    },
    "preferences": {
        "respectEmployeePreferences": True,
        "minimizeNightShifts": True,
        "spreadWeekendShiftsFairly": True,
        "minimizeConsecutiveNightShifts": True,
        "preferenceWeight": 0.7
    }
}

def debug_assignment():
    """Debug why no workers are assigned"""
    try:
        response = requests.post(
            "http://localhost:8000/schedule",
            json=test_config,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("=== DEBUGGING ASSIGNMENT ISSUE ===")
            print(f"Total shifts generated: {len(result['shifts'])}")
            
            for i, shift in enumerate(result['shifts']):
                print(f"\nShift {i+1}:")
                print(f"  ID: {shift['id']}")
                print(f"  Date: {shift['date']}")
                print(f"  Time: {shift['startTime']} - {shift['endTime']}")
                print(f"  Assigned employees: {shift['assignedEmployees']}")
                print(f"  Status: {shift['status']}")
                
            print(f"\nEmployee utilization:")
            for util in result['analytics']['employeeUtilization']:
                print(f"  {util['employeeId']}: {util['shiftsAssigned']} shifts, {util['totalHours']} hours")
                
            print(f"\nConstraint violations: {len(result['violations'])}")
            for violation in result['violations']:
                print(f"  - {violation['type']}: {violation['description']}")
                
            return result
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

if __name__ == "__main__":
    debug_assignment()