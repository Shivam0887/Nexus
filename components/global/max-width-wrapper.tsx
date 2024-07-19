import clsx from "clsx";

export const MaxWidthWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className="bg-neutral">
      <div className={clsx("max-w-7xl mx-auto", className)}>{children}</div>
    </div>
  );
};
