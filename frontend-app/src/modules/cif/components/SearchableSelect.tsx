import React, {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface SearchableSelectProps {
  name: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  noOptionsText?: string;
  emptyListText?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  name,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  required,
  loading = false,
  noOptionsText = 'Sin coincidencias',
  emptyListText = 'No hay opciones disponibles',
}) => {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const filteredOptions = useMemo(() => {
    const trimmed = inputValue.trim().toLocaleLowerCase('es');
    if (!trimmed) {
      return options;
    }
    return options.filter((option) =>
      option.toLocaleLowerCase('es').includes(trimmed),
    );
  }, [inputValue, options]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
      return;
    }

    if (filteredOptions.length === 0) {
      setHighlightedIndex(-1);
      return;
    }

    setHighlightedIndex((prev) => {
      if (prev < 0 || prev >= filteredOptions.length) {
        return 0;
      }
      return prev;
    });
  }, [filteredOptions, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setInputValue(value);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, value]);

  const showList = isOpen && !disabled;

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    const focusInput = () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(focusInput);
    } else {
      setTimeout(focusInput, 0);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    if (!isOpen) {
      setIsOpen(true);
    }
    if (nextValue === '') {
      onChange('');
    }
  };

  const handleOptionSelect = (option: string) => {
    onChange(option);
    setInputValue(option);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) {
      if (event.key === 'ArrowDown') {
        setIsOpen(true);
        event.preventDefault();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev + 1;
        return next >= filteredOptions.length ? prev : next;
      });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev - 1;
        return next < 0 ? 0 : next;
      });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) {
        handleOptionSelect(option);
      } else if (filteredOptions.length === 1) {
        handleOptionSelect(filteredOptions[0]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      setInputValue(value);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const relatedTarget = event.relatedTarget as Node | null;
    if (relatedTarget && containerRef.current?.contains(relatedTarget)) {
      return;
    }
    setIsOpen(false);
    setInputValue(value);
  };

  const renderList = () => {
    if (!showList) return null;

    if (loading) {
      return (
        <div className="cif-searchable-select__message" role="status">
          Cargando opciones…
        </div>
      );
    }

    if (options.length === 0) {
      return (
        <div className="cif-searchable-select__message" role="status">
          {emptyListText}
        </div>
      );
    }

    if (filteredOptions.length === 0) {
      return (
        <div className="cif-searchable-select__message" role="status">
          {noOptionsText}
        </div>
      );
    }

    return (
      <ul
        className="cif-searchable-select__list"
        role="listbox"
        id={listId}
        data-listbox
      >
        {filteredOptions.map((option, index) => {
          const isSelected = option === value;
          const isHighlighted = index === highlightedIndex;
          return (
            <li
              key={`${option}-${index}`}
              role="option"
              aria-selected={isSelected}
              className={[
                'cif-searchable-select__option',
                isSelected ? 'is-selected' : '',
                isHighlighted ? 'is-highlighted' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseDown={(event) => {
                event.preventDefault();
                handleOptionSelect(option);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="cif-searchable-select" ref={containerRef}>
      <div className="cif-searchable-select__control">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          name={name}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="cif-searchable-select__input"
          autoComplete="off"
          required={required}
        />
        <button
          type="button"
          className="cif-searchable-select__trigger"
          aria-label="Mostrar opciones"
          onClick={handleToggle}
          disabled={disabled}
        >
          <span aria-hidden>▾</span>
        </button>
      </div>
      {renderList()}
    </div>
  );
};

export default SearchableSelect;
