import { useState, useRef, useEffect } from "react";
import Collapse from "@/components/ui/Collapse";

export default function GroupCollapseTable({
  groups,
  openIndex,
  setOpenIndex,
  renderTable,
  noResultsMessage = "No results found.",
  tableContainerClass = "w-full",
  restaurantTable,
  titleColor,
  pageSize = 50,
}) {
  const containerRef = useRef(null);
  const [pages, setPages] = useState({}); // key: index => current page

  // Close open collapse on outside click
  useEffect(() => {
    function handleClickOutside(e){
      if (!containerRef.current) return;
      if (openIndex === null) return;
      if (e.target.closest('[data-portal-container="dropdown"]')) {
        return;
      }
      if (!containerRef.current.contains(e.target)) {
        setPages({});
        setOpenIndex(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openIndex, setOpenIndex]);

  const getPage = (idx) => pages[idx] || 1;
  const setPage = (idx, p) => setPages(prev => ({ ...prev, [idx]: p }));

  return (
    <div ref={containerRef}>
      {groups.map((group, idx) => {
        const total = group?.items?.length || 0;
        const current = Math.min(getPage(idx), Math.max(1, Math.ceil((total || 1) / pageSize)));
        const start = (current - 1) * pageSize;
        const end = Math.min(start + pageSize, total);
        const visibleItems = (group.items || []).slice(start, end);

        const pagination = total > 0 ? {
          rangeText: `${start + 1}-${end}`,
          onPrev: () => setPage(idx, Math.max(1, current - 1)),
          onNext: () => setPage(idx, Math.min(Math.ceil(total / pageSize), current + 1)),
          disablePrev: current <= 1,
          disableNext: current >= Math.ceil(total / pageSize),
        } : null;

        const groupForRender = { ...group, items: visibleItems };

        return (
          <Collapse
            key={group.name + idx}
            title={group.name}
            open={openIndex === idx}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            restaurantTable={restaurantTable}
            titleColor={titleColor}
            pagination={pagination}
          >
            {openIndex === idx && (
              <div className={tableContainerClass}>
                {groupForRender.items && groupForRender.items.length > 0 ? (
                  renderTable(groupForRender, idx)
                ) : (
                  <div className="bg-white border-b">
                    <div className="my-2 px-2 py-2 flex items-center">
                      <div className="font-normal text-base text-[var(--color-stroke-brand)] pl-8">
                        No employees assigned to this role.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Collapse>
        );
      })}
    </div>
  );
}