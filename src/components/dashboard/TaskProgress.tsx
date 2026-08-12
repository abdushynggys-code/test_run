import type { Todo } from '../../types/family';

export function TaskProgress({ todos, date }: { todos: Todo[]; date: Date }) {
  const monthTasks = todos.filter((todo) => {
    if (!todo.due_date) return false;
    const due = new Date(`${todo.due_date}T12:00:00`);
    return due.getMonth() === date.getMonth() && due.getFullYear() === date.getFullYear();
  });
  const completed = monthTasks.filter((todo) => todo.completed).length;
  const pending = monthTasks.length - completed;
  const rate = monthTasks.length ? Math.round(completed / monthTasks.length * 100) : 0;
  return <section className="task-progress bottom-panel">
    <header><div><p className="eyebrow">THIS MONTH</p><h2>Task progress</h2></div><strong>{rate}% complete</strong></header>
    <div className="task-progress-stats"><span><b>{monthTasks.length}</b> Total</span><span><b>{completed}</b> Completed</span><span><b>{pending}</b> Pending</span></div>
    <div className="task-progress-track"><i style={{ width: `${rate}%` }} /></div>
  </section>;
}
