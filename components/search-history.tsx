"use client";

import { deleteSearchHistory, getSearchHistory } from "@/actions/user.actions";
import { TMonth, TSearchHistory } from "@/lib/types";
import { typedEntries } from "@/lib/utils";
import { format, getYear, getMonth, differenceInHours } from "date-fns";
import { Loader, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type TSearchHistoryGroup = Record<string, TSearchHistory[]>;

const months: TMonth[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const groupSearchHistory = (data: TSearchHistory[]) => {
  const searchHistory: TSearchHistoryGroup = {};
  const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  data.forEach(({ createdAt, searchItem, id }) => {
    const diffInDays = Math.trunc(differenceInHours(now, createdAt) / 24) | 0;
    const diffInYears = getYear(now) - getYear(createdAt);

    const item = { id, createdAt, searchItem };

    if (diffInDays === 0) {
      if (!searchHistory["Today"]) searchHistory["Today"] = [];
      searchHistory["Today"].push(item);
    } else if (diffInDays === 1) {
      if (!searchHistory["Yesterday"]) searchHistory["Yesterday"] = [];
      searchHistory["Yesterday"].push(item);
    } else if (diffInDays > 1 && diffInDays <= 7) {
      if (!searchHistory["Previous 7 Days"])
        searchHistory["Previous 7 Days"] = [];
      searchHistory["Previous 7 Days"].push(item);
    } else if (diffInDays > 7 && diffInDays <= 30) {
      if (!searchHistory["Previous 30 Days"])
        searchHistory["Previous 30 Days"] = [];
      searchHistory["Previous 30 Days"].push(item);
    } else if (diffInYears === 0) {
      const month = months[getMonth(createdAt)];
      if (!searchHistory[month]) searchHistory[month] = [];
      searchHistory[month].push(item);
    } else {
      const year = "_" + getYear(createdAt).toString();
      if (!searchHistory[year]) searchHistory[year] = [];
      searchHistory[year].push(item);
    }
  });

  return searchHistory;
};

const getSearchTime = (group: string, createdAt: Date) => {
  if (group === "Today" || group === "Yesterday")
    return format(createdAt, "KK:mm aaa");
  return format(createdAt, "yyyy-MM-dd");
};

const SearchHistory = ({ hasSubscription }: { hasSubscription: boolean }) => {
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({}); //track of the selected history by Id
  const [selectCount, setSelectCount] = useState(0);

  const [searchHistory, setSearchHistory] = useState<TSearchHistory[]>([]);
  const [searchHistoryGroupBy, setSearchHistoryGroupBy] = useState<
    [string, TSearchHistory[]][]
  >([]);

  const [pageToken, setPageToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAllSelected = selectCount === searchHistory.length;

  const updateSearchHistory = async (
    pageToken: string | null,
    onDelete: boolean = false
  ) => {
    const result = await getSearchHistory(pageToken);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    const data = onDelete
      ? result.data.searchHistory
      : [...searchHistory, ...result.data.searchHistory];

    setSearchHistory(data);
    setPageToken(result.data.nextPageToken);
  };

  const updateSearchHistoryGroupBy = useCallback(
    async (data: TSearchHistory[]) => {
      setIsLoading(true);

      setTimeout(() => {
        const result = groupSearchHistory(data);
        setIsLoading(false);
        setSearchHistoryGroupBy(typedEntries(result));
      }, 0);
    },
    []
  );

  const handleSelectAll = () => {
    const checkboxes =
      document.querySelectorAll<HTMLInputElement>(".select-search");

    const selectAllCheckbox = selected;

    checkboxes.forEach((checkbox) => {
      checkbox.checked = true;
      selectAllCheckbox[checkbox.id] = !isAllSelected;
    });

    setSelected({ ...selectAllCheckbox });
    setSelectCount(isAllSelected ? 0 : searchHistory.length);
  };

  const handleSelectChange = (id: string) => {
    const result = selected;
    result[id] = !result[id];

    const curSelectCount = selectCount + (result[id] ? 1 : -1);

    setSelected({ ...result });
    setSelectCount(curSelectCount);
  };

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const scolled = Math.ceil(
      e.currentTarget.scrollTop + e.currentTarget.clientHeight
    );
    const scrollHeight = e.currentTarget.scrollHeight;

    if (pageToken && scolled >= scrollHeight) {
      await updateSearchHistory(pageToken);
    }
  };

  const handleHistoryDelete = async (searchId: string[]) => {
    try {
      const result = await deleteSearchHistory(searchId);
      if (!result.success) toast.error(result.error);
      else {
        await updateSearchHistory(null, true);
        setSelectCount((prev) => prev - searchId.length);
        toast.success(result.data);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    (async () => {
      const result = await getSearchHistory(null);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setSearchHistory(result.data.searchHistory);
      setPageToken(result.data.nextPageToken);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await updateSearchHistoryGroupBy(searchHistory);
    })();
  }, [searchHistory, updateSearchHistoryGroupBy]);

  return (
    <div className="flex-1 shrink-0 flex flex-col gap-2 overflow-hidden mt-3">
      <div className="space-x-3">
        <button
          onClick={handleSelectAll}
          type="button"
          className={`${
            isAllSelected ? "bg-neutral-950" : "bg-neutral-800"
          } text-xs rounded-lg py-2 px-4 hover:bg-neutral-950/80 transition-colors shadow-lg`}
        >
          Select All {isAllSelected ? `(${selectCount})` : ""}
        </button>
        {selectCount > 0 && (
          <button
            onClick={() => {
              const searchId = Object.entries(selected).map(([key]) => key);
              handleHistoryDelete(searchId);
            }}
            type="button"
            className="bg-red-600 text-xs rounded-lg px-4 py-2 hover:bg-red-500 transition-colors shadow-lg"
          >
            Delete selected ({selectCount})
          </button>
        )}
      </div>
      {hasSubscription && (
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto space-y-5 pr-4"
        >
          {searchHistoryGroupBy.map(([group, item]) => (
            <div key={group} className="space-y-1">
              <p className="text-sm text">
                {group[0] === "_" ? group.slice(1) : group}
              </p>
              {item.map(({ id, createdAt, searchItem }) => (
                <div
                  key={id}
                  onClick={() => handleSelectChange(id)}
                  className="text-neutral-300 text-sm flex items-center gap-2 group hover:bg-neutral-950 p-1 rounded-sm cursor-pointer"
                >
                  <input
                    id={id}
                    checked={!!selected[id]}
                    onChange={() => {}}
                    type="checkbox"
                    className="select-search text-base text-white customCheckbox !border-neutral-500"
                  />
                  <span>{getSearchTime(group, createdAt)}</span>
                  <p className="flex-1 line-clamp-1">{searchItem}</p>
                  {selected[id] && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHistoryDelete([id]);
                      }}
                      type="button"
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash className="size-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
          {isLoading && (
            <Loader className="size-4 text-neutral-500 animate-spin mx-auto" />
          )}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;
