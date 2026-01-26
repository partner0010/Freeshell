type FormFieldProps = {
  label: string;
  required?: boolean;
  helperText?: string;
  errorText?: string;
  children: React.ReactNode;
};

export default function FormField({
  label,
  required = false,
  helperText,
  errorText,
  children,
}: FormFieldProps) {
  const helperColor = errorText ? "text-error-500" : "text-neutral-500";

  return (
    <label className="block text-sm font-medium text-neutral-700">
      <span>
        {label}
        {required ? <span className="ml-1 text-error-500">*</span> : null}
      </span>
      <div className="mt-2">{children}</div>
      {helperText || errorText ? (
        <p className={`mt-1 text-xs ${helperColor}`}>{errorText ?? helperText}</p>
      ) : null}
    </label>
  );
}
