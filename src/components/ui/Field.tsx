import React from 'react';
import { cn } from '../../lib/cn';

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => (
  <label className={cn('mb-1.5 block text-sm font-medium text-slate-700', className)} {...props} />
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn('field', className)} {...props} />
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn('field resize-y', className)} {...props} />
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn('field cursor-pointer appearance-none pr-9', className)} {...props}>
      {children}
    </select>
  )
);
Select.displayName = 'Select';

/** A labelled field group: <FormField label="Email"> <Input/> </FormField> */
export const FormField: React.FC<{
  label?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ label, hint, required, children, className }) => (
  <div className={className}>
    {label && (
      <Label>
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </Label>
    )}
    {children}
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
);
