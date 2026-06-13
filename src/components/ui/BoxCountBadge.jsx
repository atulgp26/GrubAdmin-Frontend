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
  borderColor,
}) {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent row click
    if (onClick) onClick(e);
  };

  const derivedBorderColor = borderColor || (iconColor ? iconColor.replace('text-', 'border-') : '');

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

  return (
    <>
      <Tooltip.Provider delayDuration={100}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleClick}
              className={`group transition-all duration-200 outline-none border ${derivedBorderColor || "border-[var(--color-admin-profile-border)]"} hover:opacity-80 bg-white rounded-full px-4 py-2 flex items-center gap-2 text-base font-normal select-none focus:ring-2 focus:ring-[var(--color-brand-default)] ${className}`}
              style={{ minWidth: 64 }}
            >
              {iconName ?
              <Icon name={iconName} className={`w-5 h-5 ${iconColor?iconColor:""} transition-colors`} />:
              <Icon name="inventory" className={`w-5 h-5 ${iconColor?iconColor:""} transition-colors`} />
            }
              {label && <span className="text-[var(--color-neutral-secondary)] text-sm font-normal">{label}</span>}
              {count !== undefined && <span className="text-[var(--color-neutral-secondary)] text-sm font-normal">({count})</span>}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side={tooltipSide}
              align={tooltipAlign}
              className={`z-50 rounded-lg bg-white px-3 py-2 shadow-lg ${tooltipTextColor} text-sm font-normal animate-fadeIn min-w-[90px] ${tooltipClassName}`}
              sideOffset={5}
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