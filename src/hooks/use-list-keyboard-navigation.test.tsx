import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@/test/test-utils';

import { ListContainer } from '@/components/filters/base-filter/ListContainer';
import { ListOption } from '@/components/filters/base-filter/ListOption';

function TestList({ onSelect }: { onSelect: () => void }) {
  return (
    <div>
      <button data-testid="outside-focus-target">outside</button>

      <ListContainer
        height={48}
        isFetchingNextPage={false}
        isLoading={false}
        isSearchResultsEmpty={false}
        isEmpty={false}
      >
        <ListOption
          uniqueIdPart="1"
          label="Option 1"
          selected={false}
          optionHeight={48}
          optionStart={0}
          onClick={onSelect}
        />
      </ListContainer>
    </div>
  );
}

describe('useListKeyboardNavigation', () => {
  it('does not steal focus from outside element when pressing on a list option', () => {
    const onSelect = vi.fn();
    render(<TestList onSelect={onSelect} />);

    const outsideFocusTarget = screen.getByTestId('outside-focus-target');
    outsideFocusTarget.focus();
    expect(outsideFocusTarget).toHaveFocus();

    fireEvent.mouseDown(screen.getByText('Option 1'));
    expect(outsideFocusTarget).toHaveFocus();

    fireEvent.click(screen.getByText('Option 1'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('focuses list container when clicking outside any option', () => {
    render(<TestList onSelect={vi.fn()} />);

    const listContainer = screen.getByRole('listbox');
    fireEvent.mouseDown(listContainer);

    expect(listContainer).toHaveFocus();
  });
});
