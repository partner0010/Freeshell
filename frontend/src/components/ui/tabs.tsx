import * as React from "react";

import { cn } from "../../lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  baseId: string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>.");
  }
  return context;
};

export type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, value, defaultValue, onValueChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
    const baseId = React.useId();
    const resolvedValue = value ?? internalValue;
    const handleValueChange = (nextValue: string) => {
      setInternalValue(nextValue);
      onValueChange?.(nextValue);
    };

    return (
      <TabsContext.Provider value={{ value: resolvedValue, onValueChange: handleValueChange, baseId }}>
        <div ref={ref} className={cn("w-full", className)} {...props} />
      </TabsContext.Provider>
    );
  },
);

Tabs.displayName = "Tabs";

export const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-neutral-100 p-1 text-neutral-600",
        className,
      )}
      {...props}
    />
  ),
);

TabsList.displayName = "TabsList";

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const { value: activeValue, onValueChange, baseId } = useTabsContext();
    const isActive = activeValue === value;
    const triggerId = `${baseId}-trigger-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        id={triggerId}
        aria-selected={isActive}
        aria-controls={panelId}
        tabIndex={isActive ? 0 : -1}
        className={cn(
          "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60",
          isActive
            ? "bg-neutral-900 text-white shadow-sm"
            : "hover:bg-neutral-200",
          className,
        )}
        onClick={() => onValueChange(value)}
        {...props}
      />
    );
  },
);

TabsTrigger.displayName = "TabsTrigger";

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const { value: activeValue, baseId } = useTabsContext();
    const isActive = activeValue === value;
    const triggerId = `${baseId}-trigger-${value}`;
    const panelId = `${baseId}-panel-${value}`;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={panelId}
        aria-labelledby={triggerId}
        hidden={!isActive}
        className={cn("mt-4 focus-visible:outline-none", className)}
        {...props}
      />
    );
  },
);

TabsContent.displayName = "TabsContent";
