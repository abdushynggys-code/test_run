import type { SidekickAction } from '../../lib/sidekick';

const actionText = (action: SidekickAction) => {
  if (action.type === 'create_todo') return `Add task: ${action.title}`;
  if (action.type === 'complete_todo') return 'Mark this task complete';
  if (action.type === 'delete_todo') return 'Delete this task';
  if (action.type === 'create_event') return `Add event: ${action.title}`;
  if (action.type === 'delete_event') return 'Delete this event';
  return '';
};

export function SidekickActionCard({ action, onApply, onDismiss }: { action: SidekickAction; onApply: () => void; onDismiss: () => void }) {
  if (action.type === 'none') return null;
  return <div className="sidekick-action-card">
    <span>Ready to review</span>
    <strong>{actionText(action)}</strong>
    <div><button className="secondary-button" onClick={onDismiss}>Not now</button><button className="primary-button" onClick={onApply}>Apply</button></div>
  </div>;
}
