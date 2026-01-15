import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce';

const SearchInput = ({
  value = '',
  onChange,
  placeholder = 'Buscar...',
  debounceMs = 300,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`position-relative ${className}`}>
      <FiSearch
        className="position-absolute top-50 translate-middle-y text-muted"
        style={{ left: '12px' }}
        size={18}
      />
      <input
        type="text"
        className="form-control ps-5 pe-5"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
      {localValue && (
        <button
          type="button"
          className="btn btn-link position-absolute top-50 translate-middle-y p-0 text-muted"
          style={{ right: '12px' }}
          onClick={handleClear}
        >
          <FiX size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
