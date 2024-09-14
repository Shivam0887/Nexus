import Skeleton from "./ui/skeleton";

const Loading = () => {
  return (
    <div className="mx-auto flex items-center justify-center space-x-4 w-[80%] max-w-4xl">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="space-y-3 w-3/4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[65%]" />
      </div>
    </div>
  );
};

export default Loading;
