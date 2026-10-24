import { Button } from './ui/Button';
import { useAppState, type SavedItemType } from '@/state/AppState';

interface SaveButtonProps {
  type: Exclude<SavedItemType, 'snapshot'>;
  refId: string;
  title: string;
  subtitle?: string;
  path: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Toggle an item in Saved Items. */
export function SaveButton({ type, refId, title, subtitle, path, size = 'md', className }: SaveButtonProps) {
  const { isSaved, toggleSaved } = useAppState();
  const saved = isSaved(type, refId);
  return (
    <Button
      variant={saved ? 'secondary' : 'ghost'}
      size={size}
      icon={saved ? 'bookmark-check' : 'bookmark'}
      aria-pressed={saved}
      className={className}
      onClick={() => toggleSaved({ type, refId, title, subtitle, path })}
    >
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
}
