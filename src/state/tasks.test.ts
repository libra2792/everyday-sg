import { describe, expect, it } from 'vitest';
import { findDuplicateTask, type PlanTask } from './AppState';

const task = (patch: Partial<PlanTask>): PlanTask => ({ id: 'x', title: 'Task', done: false, source: 'manual', createdAt: '2026-11-01T00:00:00Z', ...patch });

describe('findDuplicateTask', () => {
  it('treats a second reminder for the same guide as a duplicate, whatever its date', () => {
    const tasks = [task({ title: 'Work through “A”', path: '/guides/a', source: 'guide', dueDate: '2026-12-15' })];
    expect(findDuplicateTask(tasks, { title: 'Work through “A”', path: '/guides/a', source: 'guide' })).toBeDefined();
    expect(findDuplicateTask(tasks, { title: 'Work through “B”', path: '/guides/b', source: 'guide' })).toBeUndefined();
  });

  it('matches manual tasks on title (ignoring case and spacing) and date', () => {
    const tasks = [task({ title: 'Renew passport', dueDate: '2027-01-10' })];
    expect(findDuplicateTask(tasks, { title: '  renew   PASSPORT ', dueDate: '2027-01-10', source: 'manual' })).toBeDefined();
    expect(findDuplicateTask(tasks, { title: 'Renew passport', dueDate: '2027-02-10', source: 'manual' })).toBeUndefined();
    expect(findDuplicateTask(tasks, { title: 'Renew passport', source: 'manual' })).toBeUndefined();
  });
});
