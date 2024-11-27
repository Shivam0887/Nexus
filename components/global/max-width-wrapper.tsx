import clsx from "clsx";

export const MaxWidthWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className="bg-neutral-950">
      <div className={clsx("w-full max-w-7xl mx-auto", className)}>
        {children}
      </div>
    </div>
  );
};
