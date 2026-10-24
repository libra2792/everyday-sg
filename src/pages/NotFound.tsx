import { LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Misc';

export function NotFound() {
  return (
    <div className="py-12">
      <EmptyState
        icon="compass"
        title="That page does not exist"
        description="The link may be out of date. Try searching for what you need, or start from the home page."
        action={
          <div className="flex gap-2">
            <LinkButton to="/" variant="primary">
              Go home
            </LinkButton>
            <LinkButton to="/search">Search</LinkButton>
          </div>
        }
      />
    </div>
  );
}
