import React from 'react'
import { FiFilter } from 'react-icons/fi'

const FilterButton = ({open,handleFilterClick}) => {
  return (
      <div
        className={`rounded-[10px] relative inline-block`}
      >
        <button
          onClick={handleFilterClick}
          className={`flex group items-center hover:underline active:bg-[var(--color-admin-profile-border)] active:border-[var(--info-panel-view-bg)] active:shadow-[0_0_0_2px_var(--color-shadow-select)] hover:bg-[var(--sidebar-active-bg)] hover:!border-[var(--color-filter-text)] hover:text-[var(--color-filter-text)] space-x-2 h-8 px-3 border py-1.5 rounded-lg transition-all duration-200 active:shadow-[0px_0px_0px_4px_var(--color-special-effects-ring)] ${open
            ? "border-[var(--color-filter-text)] bg-[var(--sidebar-active-bg)] shadow-[0px_0px_0px_2px_var(--color-shadow-select)] text-[var(--color-filter-text)] "
            : "border-[var(--color-stroke-brand)] bg-white"
            }`}
        >
          <FiFilter
            className={`w-4 h-4 ${open
              ? "text-[var(--color-filter-text)]"
              : "text-[var(--color-stroke-brand)] group-hover:text-[var(--color-filter-text)]"
              }`}
          />
          <span
            className={`text-sm group-hover:underline font-medium leading-none ${open
              ? " text-[var(--color-filter-text)] underline"
              : "text-[var(--color-stroke-brand)] group-hover:text-[var(--color-filter-text)]"
              }`}
          >
            FILTER
          </span>
        </button>
      </div>
  )
}

export default FilterButton
