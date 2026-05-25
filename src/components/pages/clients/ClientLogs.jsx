"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import SearchWithSuggestions from "@/components/ui/SearchWithSuggestions";
import { RiInformationLine } from "react-icons/ri";
import { BsThreeDotsVertical } from "react-icons/bs";
import FilterButton from "@/components/ui/FilterButton";
import { usePathname } from "next/navigation";
import Badge from "@/components/ui/Badge";
import { logsService } from "@/api/services/logsService";
import EmptyState from "@/components/ui/EmptyState";

const verticalIconClassMap = {
  medical: "text-[var(--color-icon-medical)]",
  delivery: "text-[var(--info-panel-view-bg)]",
  hospitality: "text-[var(--color-brand-default)]",
  camping: "text-[var(--color-icon-camping)]",
};

const LogItem = ({ log }) => {
  const timestamp = log.createdAt
    ? new Date(log.createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : log.timestamp || "";

  const logType = log.category || log.type || "General";
  const logAction = log.description || log.action || "";
  const actorName = log.actor?.name || log.admin_name || "";
  const actorRole = log.actor?.role || log.role_name || "";

  return (
    <tr className="border-b border-[var(--color-stroke-neutral)] last:border-b-0">
      <td className="px-4 py-4 font-semibold text-[var(--color-neutral-secondary)] align-top">
        {timestamp}
      </td>
      <td className="px-4 py-4 align-top">
        <div className="flex gap-4">
          <Icon name="profile_note" className="w-6 h-6 text-[var(--color-neutral-light)]" />
          <div className="flex flex-col gap-1">
            <div className="font-medium text-[var(--color-neutral-secondary)]">
              {logType}
            </div>
            {actorName && (
              <div className="text-sm text-[var(--color-stroke-brand)]">
                {actorName}{actorRole ? ` - ${actorRole}` : ""}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <p className="text-[var(--color-neutral-secondary)]">{logAction}</p>
      </td>
    </tr>
  );
};

export default function EmployeeLogs({ clientId, clientName, clientVertical }) {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const pathname = usePathname();
  const fetchIdRef = useRef(0);

  const displayName = clientName || "Client";
  const vertical = (clientVertical || "medical").toLowerCase();

  const fetchLogs = useCallback(async (page) => {
    if (!clientId) return;

    const fetchId = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await logsService.getClientLogs(clientId, {
        page_number: page,
        page_size: pageSize,
      });

      if (fetchId !== fetchIdRef.current) return;

      if (response?.success && response?.code === 200) {
        const logsData = response.data?.logs || [];
        const count = response.data?.count || 0;
        const metaTotalPages = response.meta?.total_pages || 1;
        setLogs(logsData);
        setTotalCount(count);
        setTotalPages(metaTotalPages);
        setCurrentPage(page);
      } else {
        setLogs([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      if (fetchId !== fetchIdRef.current) return;
      setError("Failed to load logs. Please try again.");
      setLogs([]);
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [clientId]);

  useEffect(() => {
    setLogs([]);
    setFilteredLogs([]);
    setCurrentPage(1);
    setTotalCount(0);
    setTotalPages(1);
    setSearch("");
    setError(null);
    if (clientId) {
      fetchLogs(1);
    }
  }, [clientId, fetchLogs]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setFilteredLogs(logs);
  }, [logs]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredLogs(logs);
      return;
    }
    const filtered = logs.filter((log) => {
      const searchable = [
        log.description,
        log.action,
        log.category,
        log.type,
        log.actor?.name,
        log.admin_name,
        log.actor?.role,
        log.role_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(search.toLowerCase());
    });
    setFilteredLogs(filtered);
  }, [search, logs]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    fetchLogs(newPage);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearch(suggestion.name);
  };

  const handleSearchClear = () => {
    setSearch("");
  };

  const formattedVertical =
    vertical.charAt(0).toUpperCase() + vertical.slice(1);
  const badgeIconClass =
    verticalIconClassMap[vertical] ?? "text-[var(--color-icon-medical)]";

  const isDismissPage =
    pathname === "/employees/dismissedlogs" ||
    pathname === "/employees/suspendedlogs";

  const renderContent = () => {
    if (!clientId) {
      return (
        <tr>
          <td colSpan={3} className="px-4 py-12 text-center text-[var(--color-neutral-secondary)] text-sm">
            Select a client to view their logs.
          </td>
        </tr>
      );
    }

    if (loading && logs.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="px-4 py-12 text-center text-[var(--color-neutral-secondary)] text-sm">
            Loading logs...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={3} className="px-4 py-12 text-center text-red-500 text-sm">
            {error}
          </td>
        </tr>
      );
    }

    if (filteredLogs.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="px-4 py-12 text-center text-[var(--color-neutral-secondary)] text-sm">
            {search.trim()
              ? "No logs match your search."
              : "No logs found for this client."}
          </td>
        </tr>
      );
    }

    return filteredLogs.map((log, index) => (
      <LogItem key={log.id || log._id || index} log={log} />
    ));
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6 w-full">
        <div className="flex justify-between">
          <h1 className="flex items-center gap-2 text-[var(--color-neutral-primary)] font-semibold text-2xl">
            <RiInformationLine className="cursor-pointer w-6 h-6 text-[var(--color-stroke-brand)]" />
            {displayName}
          </h1>
          <div className="flex gap-4">
            <Badge
              color={vertical}
              className="leading-none flex items-center space-x-2 w-max cursor-pointer"
            >
              <Icon
                name="inventory"
                className={`w-4 h-4 ${badgeIconClass}`}
              />
              {formattedVertical}
            </Badge>
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-between items-center rounded-lg">
          <SearchWithSuggestions
            data={[]}
            value={search}
            onChange={handleSearchChange}
            onSelect={handleSuggestionSelect}
            onClear={handleSearchClear}
            placeholder="Search log"
            clearable={true}
            className="!w-64"
            getLabel={(item) => item.name}
            getSubLabel={(item) => item.code}
            openOnFocus={false}
            minChars={1}
          />
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--color-stroke-brand)]">
              {loading ? "Loading..." : `Showing ${filteredLogs.length} of ${totalCount}`}
            </span>
            <FilterButton
              open={showFilterModal}
              handleFilterClick={() => setShowFilterModal(true)}
            />
          </div>
        </div>

        <div className="flex-grow bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-sm text-[var(--color-stroke-brand)] border-b border-[var(--color-stroke-neutral)]">
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Time stamp
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>{renderContent()}</tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center py-2 px-4 bg-[var(--color-neutral-secondary-bg)]">
            <span className="text-sm text-[var(--color-stroke-brand)]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}