import { useRef } from 'react';

export default function PinInput({ value, onChange, length = 4, disabled = false }) {
  const inputs = Array.from({ length });
  const refs = useRef([]);

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
    const newValue = value.split('');
    newValue[i] = val;
    const joined = newValue.join('').slice(0, length);
    onChange(joined);
    if (val && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center ">
      {inputs.map((_, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="password"
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-12 text-center text-2xl bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
          value={value[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          disabled={disabled}
          autoFocus={i === 0}
        />
      ))}
    </div>
  );
} 