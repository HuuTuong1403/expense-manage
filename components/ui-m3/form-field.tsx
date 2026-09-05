import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: string | string[];
  className?: string;
  children: React.ReactNode;
};

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: FormFieldProps) {
  const message = Array.isArray(error) ? error[0] : error;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-body-sm font-medium text-on-surface-variant"
      >
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </label>
      {children}
      {message ? (
        <span className="text-body-sm text-destructive">{message}</span>
      ) : hint ? (
        <span className="text-[11px] text-outline">{hint}</span>
      ) : null}
    </div>
  );
}
