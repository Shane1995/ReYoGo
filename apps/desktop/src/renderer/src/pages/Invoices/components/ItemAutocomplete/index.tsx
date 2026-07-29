import { createPortal } from 'react-dom';
import { cn } from '@reyogo/ui';
import { inputClass } from '../../utils/inputClass';
import { useItemAutocomplete } from './useItemAutocomplete';
import { AutocompleteOptionsList } from './components/AutocompleteOptionsList';
import type { ItemAutocompleteProps } from './types';

export type { ItemOption } from './types';

export function ItemAutocomplete({
  items,
  value,
  onChange,
  entityId,
  placeholder = 'Search or select item…',
  className,
  inputClassName,
  disabled,
  inputId,
  onSelectComplete,
  onNavigateRight,
}: ItemAutocompleteProps) {
  const {
    isOpen,
    setQuery,
    setIsOpen,
    highlightIndex,
    listStyle,
    containerId,
    listId,
    filteredItems,
    displayValue,
    handleFocus,
    handleBlur,
    handleSelect,
    handleKeyDown,
  } = useItemAutocomplete({ items, value, entityId, onChange, onSelectComplete, onNavigateRight });

  return (
    <div id={containerId} className={cn('relative w-full min-w-[10rem]', className)}>
      <input
        id={inputId}
        type="text"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={listId}
        className={cn(inputClass, inputClassName)}
      />
      {isOpen &&
        createPortal(
          <ul
            id={listId}
            role="listbox"
            style={{
              position: 'fixed',
              top: listStyle.top,
              left: listStyle.left,
              width: listStyle.width,
              zIndex: 9999,
            }}
            className="max-h-64 overflow-auto rounded-md border border-[var(--nav-border)] bg-popover py-1 shadow-lg"
          >
            <AutocompleteOptionsList
              items={filteredItems}
              highlightIndex={highlightIndex}
              onSelect={handleSelect}
            />
          </ul>,
          document.body,
        )}
    </div>
  );
}
