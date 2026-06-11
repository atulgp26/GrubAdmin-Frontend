import * as Tooltip from '@radix-ui/react-tooltip';
import Icon from './Icon';
import { TbFridge } from 'react-icons/tb';

export default function BoxCountBadge({ 
  count, 
  icon, 
  tooltipText = 'View list', 
  tooltipContent, 
  tooltipSide = 'bottom',
  tooltipAlign = 'start',
  tooltipClassName = '',
  tooltipTextColor = 'text-[var(--color-stroke-brand)]',
  className = '', 
  onClick, 
  children,
  asText = false,
  textClassName = '',
  onViewList,
  iconColor,
  iconName="",
  label="",
}) {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent row click
    if (onClick) onClick(e);
  };

  // If used as text wrapper (for Manager tooltip)
  if (asText) {
    return (
      <Tooltip.Provider delayDuration={100}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span className={`cursor-default ${textClassName}`}>
              {children}
            </span>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side={tooltipSide}
              align={tooltipAlign}
              className={`z-50 !rounded-lg bg-white px-3 py-2 shadow-lg animate-fadeIn min-w-[130px] ${tooltipClassName}`}
              sideOffset={5}
            >
              {tooltipContent || (
                <div className='cursor-pointer'>
                  <div className={`${tooltipTextColor} text-sm`}>
                    12 permissions
                  </div>
                  <div className="text-[var(--info-panel-view-bg)] text-sm font-semibold cursor-pointer hover:underline">
                    View details &gt;&gt;
                  </div>
                </div>
              )}
              <Tooltip.Arrow className="fill-white drop-shadow-md w-4 h-2" width={16} height={8} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    );
  }

  // Original button behavior for count badges
  return (
    <>
      <Tooltip.Provider delayDuration={100}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleClick}
              className={`group transition-all duration-200 outline-none border ${count>0? "border-[var(--color-admin-profile-border)]":"border-[var(--color-box-border)]"} hover:border-[var(--info-panel-view-bg)] bg-white hover:bg-[var(--color-admin-profile-border)] rounded-full px-4 py-2 flex items-center gap-2 text-base font-normal select-none focus:ring-2 focus:ring-[var(--color-brand-default)] ${className}`}
              style={{ minWidth: 64 }}
            >
              {iconName ?
              <Icon name={iconName} className={`w-5 h-5 ${iconColor?iconColor:""} ${count>0 ? "text-[var(--info-panel-view-bg)]":"text-[var(--color-neutral-light)] group-hover:text-[var(--color-brand-default)]"} transition-colors`} />:
              <Icon name="inventory" className={`w-5 h-5 ${iconColor?iconColor:""} ${count>0 ? "text-[var(--info-panel-view-bg)]":"text-[var(--color-neutral-light)] group-hover:text-[var(--color-brand-default)]"} transition-colors`} />
            }
              {label && <span className="text-[var(--color-neutral-secondary)] text-sm font-normal">{label}</span>}
              <span className="text-[var(--color-neutral-secondary)] text-sm font-normal">{count}</span>
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side={tooltipSide}
              align={tooltipAlign}
              className={`cursor-pointer z-50 rounded-lg bg-white px-3 py-2 shadow-lg ${tooltipTextColor} text-sm font-normal animate-fadeIn min-w-[90px] ${tooltipClassName}`}
              sideOffset={0}
              onClick={(e) => {
                e.stopPropagation();
                if (onViewList) onViewList(e);
              }}
            >
              {tooltipText}
              <Tooltip.Arrow className="fill-white drop-shadow-md w-4 h-2" width={24} height={16} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>

    </>
  );
}

// Add this to your global CSS or Tailwind config for smooth fade
// .animate-fadeIn { animation: fadeIn 0.18s cubic-bezier(0.16,1,0.3,1); }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: none; } } 