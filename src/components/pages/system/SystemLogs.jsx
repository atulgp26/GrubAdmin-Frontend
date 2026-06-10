"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MdCalendarToday } from "react-icons/md";
import { MdOutlineDone } from "react-icons/md";
import { useSearchParams } from "next/navigation";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown";
import SystemLogsFilterModal from "./SystemLogsFilterModal";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/Table";
import { DEBOUNCE_TIME, DEFAULT_PAGE_SIZE } from "@/constants/config";
import { logsService } from "@/api/services/logsService";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "use-debounce";
import { showError } from "@/components/ui/toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { RxCross2 } from "react-icons/rx";

const categoryOptions = [
    { id: "Profile", label: "Profile" },
    { id: "Employee", label: "Employee" },
    { id: "Restaurant", label: "Restaurant" },
    { id: "GrubPac", label: "GrubPac" },
    { id: "GrubLock", label: "GrubLock" },
];

const normalizeLabel = (value = "") =>
    String(value).replace(/_/g, " ").replace(/-/g, " ");

const formatModuleLabel = (module) => {
    const safeModule = String(module || "");
    if (!safeModule) return "Unknown";

    return `${safeModule.charAt(0).toUpperCase()}${safeModule.slice(1)}`;
};

// const SystemLogItem = ({ log }) => (
//  <TableRow>
//      <TableCell className="p-4 align-top whitespace-nowrap font-semibold text-[var(--color-neutral-secondary)]">
//          {log.timestamp}
//      </TableCell>
//      <TableCell className="p-4 align-top">
//          <div className="flex gap-4">
//              {log.icon}
//              <div className="flex flex-col gap-1">
//                  <div className="font-medium text-[var(--color-neutral-secondary)]">
//                      {log.type}
//                  </div>
//                  <div className="text-[var(--color-stroke-brand)] text-sm">
//                      ({log.subtype})
//                  </div>
//              </div>
//          </div>
//      </TableCell>
//      <TableCell className="p-4 align-top">
//          <p className="text-[var(--color-neutral-secondary)] whitespace-normal break-all max-w-full overflow-hidden">
//              {log.action}
//          </p>
//      </TableCell>
//  </TableRow>
// );

const SystemLogItem = ({ log, isBlinking }) => (
    <TableRow className={isBlinking ? "blink-row" : ""}>
        <TableCell className="p-4 align-top whitespace-nowrap font-semibold text-[var(--color-neutral-secondary)]">
            {log.timestamp}
        </TableCell>
        <TableCell className="p-4 align-top">
            <div className="flex gap-4">
                {log.icon}
                <div className="flex flex-col gap-1">
                    <div className="font-medium text-[var(--color-neutral-secondary)]">
                        {log.type}
                    </div>
                    <div className="text-[var(--color-stroke-brand)] text-sm">
                        ({log.subtype})
                    </div>
                </div>
            </div>
        </TableCell>
        <TableCell className="p-4 align-top">
            <p className="text-[var(--color-neutral-secondary)] whitespace-normal break-all max-w-full overflow-hidden">
                {log.action}
            </p>
        </TableCell>
    </TableRow>
);

export default function SystemLogs() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [systemLogs, setSystemLogs] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const pageSize = DEFAULT_PAGE_SIZE;
    const fetchIdRef = useRef(0);

    const searchParams = useSearchParams();
    const highlightedItemId = searchParams.get("item_id");
    const highlightedItemType = searchParams.get("item_type");
    const highlightedGoal = searchParams.get("goal");
    const [blinkingId, setBlinkingId] = useState(null);

    const [debouncedSearchValue] = useDebounce(search, DEBOUNCE_TIME);

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const getLogs = useCallback(async () => {
        if (!isAuthenticated || authLoading) return;
        const fetchId = ++fetchIdRef.current;
        setIsLoadingLogs(true);
        try {
            const params = {};

            if (selectedCategories.length > 0) {
                params.category = selectedCategories;
            }

            if (debouncedSearchValue) {
                params.search = debouncedSearchValue;
            }

            if (startDate) {
                const start = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate(),
                    0, 0, 0, 0,
                );
                params.start_date = start.toISOString();
            }
            if (endDate) {
                const end = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth(),
                    endDate.getDate(),
                    23, 59, 59, 999,
                );
                params.end_date = end.toISOString();
            }

            const hasAdvancedFilters = Object.values(advancedFilters).some(
                (v) => Array.isArray(v) && v.length > 0,
            );
            if (hasAdvancedFilters) {
                params.filters = Object.entries(advancedFilters)
                    .filter(([, v]) => Array.isArray(v) && v.length > 0)
                    .map(([category, types]) => ({
                        category,
                        types,
                    }));
            }

            params.page_number = currentPage;
            params.page_size = pageSize;

            const logsResponse = await logsService.getLogs(params);

            if (fetchId !== fetchIdRef.current) return;

            if (logsResponse?.data) {
                setSystemLogs(logsResponse.data.logs || []);
                setTotalItems(logsResponse.data.count || 0);
            }
        } catch (error) {
            if (fetchId !== fetchIdRef.current) return;
            console.error("Failed to fetch logs:", error);
            showError("Failed to load system logs.");
        } finally {
            if (fetchId === fetchIdRef.current) {
                setIsLoadingLogs(false);
            }
        }
    }, [
        isAuthenticated,
        authLoading,
        selectedCategories,
        debouncedSearchValue,
        startDate,
        endDate,
        advancedFilters,
        currentPage,
        pageSize,
    ]);

    const formattedLogs = useMemo(
        () =>
            systemLogs.map((systemLog) => {
                const category = String(
                    systemLog.category || systemLog.module || "unknown",
                );
                const action = String(
                    systemLog.metadata?.action ||
                        systemLog.action ||
                        systemLog.type ||
                        "",
                );
                const moduleName = formatModuleLabel(category);
                const subtype = normalizeLabel(
                    String(systemLog.type || action || "unknown"),
                );
                const message = normalizeLabel(
                    String(systemLog.description || "") ||
                        `${moduleName} ${subtype}`,
                );
                const logTimestamp = systemLog.createdAt || systemLog.updatedAt;

                return {
                    id: systemLog.id,
                    timestamp: new Date(logTimestamp).toLocaleDateString(
                        "en-GB",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        },
                    ),
                    type: moduleName,
                    subtype,
                    action: message,
                    category,
                    rawDescription: String(systemLog.description || ""),
                    icon: (
                        <MdOutlineDone className="w-6 h-6 text-[var(--color-neutral-light)]" />
                    ),
                };
            }),
        [systemLogs],
    );

    const handleExport = useCallback(() => {
        if (systemLogs.length === 0) {
            showError("No logs to export.");
            return;
        }

        const headers = ["Timestamp", "Category", "Type", "Action"];
        const csvContent = [
            headers.join(","),
            ...formattedLogs.map((log) =>
                [
                    `"${log.timestamp}"`,
                    `"${log.type}"`,
                    `"${log.subtype}"`,
                    `"${log.action.replace(/"/g, '""')}"`,
                ].join(","),
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `system_logs_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [systemLogs, formattedLogs]);

    const visibleLogs = useMemo(() => {
        return formattedLogs.filter((log) => {
            const matchesCategory =
                selectedCategories.length === 0 ||
                selectedCategories.includes(log.category);
            return matchesCategory;
        });
    }, [selectedCategories, formattedLogs]);

    // prema
    const suggestions = useMemo(
        () =>
            formattedLogs.map((log) => ({
                id: log.id,
                name: `${log.type} ${log.subtype}`,
                code: log.action,
                timestamp: log.timestamp,
            })),
        [formattedLogs],
    );

    const handleSuggestionSelect = (suggestion) => {
        setSearch(suggestion.name);
    };

    const handleSearchClear = () => setSearch("");

    const totalEntriesText = useMemo(
        () => `${totalItems} entries`,
        [totalItems],
    );
    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(totalItems / pageSize)),
        [totalItems],
    );

    useEffect(() => {
        getLogs();
    }, [getLogs]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchValue, startDate, endDate, advancedFilters]);

    useEffect(() => {
        if (highlightedItemId && !isLoadingLogs && visibleLogs.length > 0) {
            const matchingLog = visibleLogs.find((log) =>
                log.rawDescription?.includes(highlightedItemId),
            );
            if (matchingLog) {
                setBlinkingId(matchingLog.id);
                const timer = setTimeout(() => {
                    setBlinkingId(null);
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [highlightedItemId, isLoadingLogs, visibleLogs]);

    // return (
    //  <div className="flex flex-col gap-6  w-full">
    //      <style>{`
    //     @keyframes blink {
    //         0%, 100% { background-color: transparent; }
    //         50% { background-color: var(--color-neutral-secondary-bg); }
    //     }
    //     .blink-row {
    //         animation: blink 0.6s ease-in-out 5;
    //     }
    // `}</style>
    //      <div className="flex flex-wrap justify-between items-center gap-4">
    //          <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] leading-none">
    //              System logs
    //          </h1>
    //          <Button
    //              variant="text"
    //              size="md"
    //              className="!px-0 uppercase tracking-[0.08em]"
    //              onClick={handleExport}
    //          >
    //              EXPORT
    //          </Button>
    //      </div>

    //      <div className="flex flex-wrap items-center justify-between gap-4">
    //          <SearchWithSuggestions
    //              data={suggestions}
    //              value={search}
    //              onChange={onSearchChange}
    //              onSelect={handleSuggestionSelect}
    //              onClear={handleSearchClear}
    //              placeholder="Search log"
    //              clearable
    //              className="!w-64 [&_input]:!h-8 [&_input]:!py-1"
    //              getLabel={(item) => item.name}
    //              getSubLabel={(item) => item.code}
    //              openOnFocus={false}
    //              minChars={1}
    //          />
    //          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-neutral-secondary)]">
    //              <span className="whitespace-nowrap text-[var(--color-stroke-brand)] text-sm">
    //                  {totalEntriesText}
    //              </span>

    //              <div className="relative">
    //                  <DatePicker
    //                      selectsRange
    //                      startDate={startDate}
    //                      endDate={endDate}
    //                      onChange={(update) => setDateRange(update)}
    //                      placeholderText="Date range"
    //                      className="pr-10 !w-44 !h-8 cursor-pointer !rounded-lg border border-[var(--color-stroke-neutral)] text-[var(--color-neutral-secondary)] px-3 text-sm outline-none"
    //                      dateFormat="dd MMM yy"
    //                  />
    //                  {startDate ? (
    //                      <RxCross2
    //                          className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF5A3C] cursor-pointer"
    //                          onClick={() => setDateRange([null, null])}
    //                      />
    //                  ) : (
    //                      <MdCalendarToday className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF5A3C] cursor-pointer pointer-events-none" />
    //                  )}
    //              </div>
    //              <MultiSelectDropdown
    //                  options={categoryOptions}
    //                  selected={selectedCategories}
    //                  setSelected={setSelectedCategories}
    //                  placeholder="All categories"
    //                  className="min-w-[160px]"
    //                  padding="!py-1.5 !px-3"
    //                  fontsize="text-sm"
    //              />

    //              <Button
    //                  variant="grayOutline"
    //                  size="md"
    //                  className="h-8 flex items-center px-3 rounded-lg"
    //                  onClick={() => setShowAdvancedFilter(true)}
    //              >
    //                  ADVANCED FILTER
    //              </Button>
    //          </div>
    //      </div>

    //      <Pagination
    //          className="rounded-[6px]"
    //          currentPage={currentPage}
    //          pageSize={pageSize}
    //          totalItems={totalItems}
    //          onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
    //          onNext={() =>
    //              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
    //          }
    //      />

    //      <div className="flex-grow">
    //          <div>
    //              <Table className="w-full">
    //                  <TableHead>
    //                      <TableRow>
    //                          <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
    //                              Time stamp
    //                          </TableCell>
    //                          <TableCell className="p-4 pl-18 !text-sm font-medium text-[var(--color-stroke-brand)]">
    //                              Type
    //                          </TableCell>
    //                          <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
    //                              Action
    //                          </TableCell>
    //                      </TableRow>
    //                  </TableHead>
    //                  <TableBody>
    //                      {visibleLogs.map((log) => (
    //                          <SystemLogItem key={log.id} log={log} />
    //                      ))}
    //                  </TableBody>
    //              </Table>
    //              {isLoadingLogs && (
    //                  <div className="text-center text-[var(--color-neutral-light)] py-8">
    //                      Loading logs...
    //                  </div>
    //              )}
    //              {!isLoadingLogs && visibleLogs.length === 0 && (
    //                  <div className="text-center text-[var(--color-neutral-light)] py-8">
    //                      No system logs found for your filters.
    //                  </div>
    //              )}
    //          </div>
    //      </div>
    //      <SystemLogsFilterModal
    //          open={showAdvancedFilter}
    //          onClose={() => setShowAdvancedFilter(false)}
    //          selectedFilters={advancedFilters}
    //          onChange={setAdvancedFilters}
    //          // onApply={() => setShowAdvancedFilter(false)}
    //          onApply={() => {
    //              setCurrentPage(1);
    //              setShowAdvancedFilter(false);
    //          }}
    //      />
    //  </div>
    // );
    return (
        <div className="flex flex-col gap-6  w-full">
            <style>{`
            @keyframes blink {
                0%, 100% { background-color: transparent; }
                50% { background-color: var(--color-neutral-secondary-bg); }
            }
            .blink-row {
                animation: blink 0.6s ease-in-out 5;
            }
        `}</style>

            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] leading-none">
                    System logs
                </h1>
                <Button
                    variant="text"
                    size="md"
                    className="!px-0 uppercase tracking-[0.08em]"
                    onClick={handleExport}
                >
                    EXPORT
                </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <SearchWithSuggestions
                    data={suggestions}
                    value={search}
                    onChange={onSearchChange}
                    onSelect={handleSuggestionSelect}
                    onClear={handleSearchClear}
                    placeholder="Search log"
                    clearable
                    className="!w-64 [&_input]:!h-8 [&_input]:!py-1"
                    getLabel={(item) => item.name}
                    getSubLabel={(item) => item.code}
                    openOnFocus={false}
                    minChars={1}
                />
                <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-neutral-secondary)]">
                    <span className="whitespace-nowrap text-[var(--color-stroke-brand)] text-sm">
                        {totalEntriesText}
                    </span>

                    <div className="relative">
                        <DatePicker
                            selectsRange
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            placeholderText="Date range"
                            className="pr-10 !w-44 !h-8 cursor-pointer !rounded-lg border border-[var(--color-stroke-neutral)] text-[var(--color-neutral-secondary)] px-3 text-sm outline-none"
                            dateFormat="dd MMM yy"
                        />
                        {startDate ? (
                            <RxCross2
                                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF5A3C] cursor-pointer"
                                onClick={() => setDateRange([null, null])}
                            />
                        ) : (
                            <MdCalendarToday className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF5A3C] cursor-pointer pointer-events-none" />
                        )}
                    </div>
                    <MultiSelectDropdown
                        options={categoryOptions}
                        selected={selectedCategories}
                        setSelected={setSelectedCategories}
                        placeholder="All categories.."
                        className="min-w-[160px]"
                        padding="!py-3 !px-3"
                        fontsize="text-sm"
                    />

                    <Button
                        variant="grayOutline"
                        size="md"
                        className="h-8 flex items-center px-3 rounded-lg"
                        onClick={() => setShowAdvancedFilter(true)}
                    >
                        ADVANCED FILTER
                    </Button>
                </div>
            </div>

            <Pagination
                className="rounded-[6px]"
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalItems}
                onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                onNext={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
            />

            <div className="flex-grow">
                <div>
                    <Table className="w-full">
                        <TableHead>
                            <TableRow>
                                <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
                                    Time stamp
                                </TableCell>
                                <TableCell className="p-4 pl-18 !text-sm font-medium text-[var(--color-stroke-brand)]">
                                    Type
                                </TableCell>
                                <TableCell className="p-4 !text-sm font-medium text-[var(--color-stroke-brand)]">
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        {/* <TableBody>
                            {visibleLogs.map((log) => (
                                <SystemLogItem
                                    key={log.id}
                                    log={log}
                                    isBlinking={blinkingId === log.id}
                                />
                            ))}
                        </TableBody> */}

                        <TableBody>
                            {visibleLogs.map((log) => (
                                <SystemLogItem
                                    key={log.id}
                                    log={log}
                                    isBlinking={blinkingId === log.id}
                                />
                            ))}
                        </TableBody>
                    </Table>
                    {isLoadingLogs && (
                        <div className="text-center text-[var(--color-neutral-light)] py-8">
                            Loading logs...
                        </div>
                    )}
                    {!isLoadingLogs && visibleLogs.length === 0 && (
                        <div className="text-center text-[var(--color-neutral-light)] py-8">
                            No system logs found for your filters.
                        </div>
                    )}
                </div>
            </div>
            <SystemLogsFilterModal
                open={showAdvancedFilter}
                onClose={() => setShowAdvancedFilter(false)}
                selectedFilters={advancedFilters}
                onChange={setAdvancedFilters}
                onApply={() => {
                    setCurrentPage(1);
                    setShowAdvancedFilter(false);
                }}
            />
        </div>
    );
}