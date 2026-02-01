import React from 'react';

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-slate-300 text-sm font-medium mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5
          bg-slate-700/50
          border ${error ? 'border-red-500' : 'border-slate-600'}
          rounded-xl
          text-white
          placeholder-slate-500
          focus:outline-none
          focus:border-cyan-500
          focus:ring-2
          focus:ring-cyan-500/20
          transition-all
          disabled:opacity-50
          disabled:cursor-not-allowed
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
