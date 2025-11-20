// app/lib/storage.ts
import {
  mockUsers,
  mockPositions,
  mockEmployees,
  mockEmployeePositions,
  mockDepartments,
} from './mockData';
import { User, Position, Employee, EmployeePosition, Department } from './types';

const KEYS = {
  USERS: 'pr-po-users',
  POSITIONS: 'pr-po-positions',
  EMPLOYEES: 'pr-po-employees',
  EMPLOYEE_POSITIONS: 'pr-po-employee-positions',
  DEPARTMENTS: 'pr-po-departments',
};

const load = <T>(key: string, fallback: T[]): T[] => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const save = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Save failed:', e);
  }
};

// === USERS ===
export const getUsers = () => load(KEYS.USERS, mockUsers);
export const setUsers = (data: User[]) => save(KEYS.USERS, data);

// === POSITIONS ===
export const getPositions = () => load(KEYS.POSITIONS, mockPositions);
export const setPositions = (data: Position[]) => save(KEYS.POSITIONS, data);

// === EMPLOYEES ===
export const getEmployees = () => load(KEYS.EMPLOYEES, mockEmployees);
export const setEmployees = (data: Employee[]) => save(KEYS.EMPLOYEES, data);

// === EMPLOYEE POSITIONS ===
export const getEmployeePositions = () => load(KEYS.EMPLOYEE_POSITIONS, mockEmployeePositions);
export const setEmployeePositions = (data: EmployeePosition[]) => save(KEYS.EMPLOYEE_POSITIONS, data);

// === DEPARTMENTS ===
export const getDepartments = () => load(KEYS.DEPARTMENTS, mockDepartments);
export const setDepartments = (data: Department[]) => save(KEYS.DEPARTMENTS, data);