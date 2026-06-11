import Image from "next/image";
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { MdOutlineLock } from "react-icons/md";
import { TbFridge } from "react-icons/tb";
import { TfiReceipt } from "react-icons/tfi";
export default function Icon({ name, className = "" }) {
  const icons = {
    dashboard: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 20 20"
      >
        <path
          d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    
    restaurant: (
      <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    warning_yellow: (
      <Image
        src="/exclamation-triangle-yellow.svg"
        width={16}
        height={16}
        alt="warning_image"
      />
    ),
    warning: (
      <Image
        src="/exclamation-triangle.svg"
        width={16}
        height={16}
        alt="warning_image"
      />
    ),
    check: (
      <Image src="/check-circle.svg" width={16} height={16} alt="check_image" />
    ),
    power: (
      <Image src="/power.svg" width={16} height={16} alt="power" />
    ),
    login_user: (
<svg width="24" height="24" className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M7 6C7 3.23858 9.23858 1 12 1C14.7614 1 17 3.23858 17 6C17 8.76142 14.7614 11 12 11C9.23858 11 7 8.76142 7 6ZM12 3C10.3431 3 9 4.34315 9 6C9 7.65685 10.3431 9 12 9C13.6569 9 15 7.65685 15 6C15 4.34315 13.6569 3 12 3Z" fill="currentColor"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2 22C2 16.4772 6.47715 12 12 12C17.5228 12 22 16.4772 22 22V23H2V22ZM4.06189 21H19.9381C19.446 17.0537 16.0796 14 12 14C7.92038 14 4.55399 17.0537 4.06189 21Z" fill="currentColor"/>
</svg>
    ),
    minus: <Image src="/minus-circle.svg" width={20} height={20} alt="minus" />,
    users_gray: (
      <Image src="/users-gray.svg" width={20} height={20} alt="users" />
    ),
    users_red: (
      <Image src="/users-red.svg" width={20} height={20} alt="users" />
    ),
    dots_vertical: (
      <Image src="/dots-vertical.svg" width={20} height={20} alt="dots-vertical" />
    ),
    question_mark: (
      <Image src="/question-mark.svg" width={32} height={32} alt="question-mark" />
    ),
    write_to_us: (
      <Image src="/write-to-us.svg" width={20} height={20} alt="write-to-us" />
    ),
    done: (
      <Image src="/done.svg" width={28} height={25} alt="done" />
    ),
    shop: (
      <Image src="/shop.svg" width={20} height={20} alt="shop" />
    ),
    wind: (
      <Image src="/ioniser.svg" width={20} height={20} alt="ioniser" />
    ),
    login_mark: (
      <Image src="/login-mark.svg" width={56} height={56} alt="login-mark" />
    ),
    filter: (
      <Image src="/filter.svg" width={16} height={16} alt="filter" />
    ),
    gyroscope: (
      <Image src="/gyrosenser.svg" width={20} height={20} alt="gyroscope" />
    ),
    heart: (
      <Image src="/heart.svg" width={20} height={20} alt="heart" />
    ),
    thermometer: (
      <Image src="/thermostat.svg" width={20} height={20} alt="thermometer" />
    ),
        thermometer_icon: (
      <Image src="/thermometer-icon.svg" width={20} height={20} alt="thermometer" />
    ),
    monitor: (
      <Image src="/advert_screen.svg" width={20} height={20} alt="screen" />
    ),
    lock: (
      <Image src="/lock.svg" width={16} height={16} alt="lock" />
    ),
    user_check: (
<svg className={className} width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M4.83366 5.00065C4.83366 2.69946 6.69914 0.833984 9.00033 0.833984C11.3015 0.833984 13.167 2.69946 13.167 5.00065C13.167 7.30184 11.3015 9.16732 9.00033 9.16732C6.69914 9.16732 4.83366 7.30184 4.83366 5.00065ZM9.00033 2.50065C7.61961 2.50065 6.50033 3.61994 6.50033 5.00065C6.50033 6.38136 7.61961 7.50065 9.00033 7.50065C10.381 7.50065 11.5003 6.38136 11.5003 5.00065C11.5003 3.61994 10.381 2.50065 9.00033 2.50065Z" fill="currentColor"/>
<path d="M2.38524 17.5007C2.79532 14.2121 5.60064 11.6673 9.00033 11.6673C10.906 11.6673 12.6238 12.4658 13.8399 13.7488L14.4131 14.3537L15.6228 13.2072L15.0495 12.6023C13.5319 11.0011 11.3822 10.0007 9.00033 10.0007C4.39795 10.0007 0.666992 13.7316 0.666992 18.334V19.1673H10.2793V17.5007H2.38524Z" fill="currentColor"/>
<path d="M18.5122 15.0007L14.0003 19.5125L11.1551 16.6673L12.3337 15.4888L14.0003 17.1555L17.3337 13.8221L18.5122 15.0007Z" fill="currentColor"/>
</svg>
    ),
    user_wrong: (
<svg className={className} width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M4.83366 4.99967C4.83366 2.69849 6.69914 0.833008 9.00033 0.833008C11.3015 0.833008 13.167 2.69849 13.167 4.99967C13.167 7.30086 11.3015 9.16634 9.00033 9.16634C6.69914 9.16634 4.83366 7.30086 4.83366 4.99967ZM9.00033 2.49967C7.61961 2.49967 6.50033 3.61896 6.50033 4.99967C6.50033 6.38039 7.61961 7.49967 9.00033 7.49967C10.381 7.49967 11.5003 6.38039 11.5003 4.99967C11.5003 3.61896 10.381 2.49967 9.00033 2.49967Z" fill="currentColor"/>
<path d="M2.38524 17.4997C2.79532 14.2111 5.60064 11.6663 9.00033 11.6663C9.78776 11.6663 10.5416 11.8025 11.2407 12.0519L12.0256 12.3319L12.5855 10.7621L11.8006 10.4821C10.9243 10.1695 9.98126 9.99967 9.00033 9.99967C4.39795 9.99967 0.666992 13.7306 0.666992 18.333V19.1663H10.667V17.4997H2.38524Z" fill="currentColor"/>
<path d="M13.167 12.9878L15.2503 15.0712L17.3337 12.9878L18.5122 14.1663L16.4288 16.2497L18.5122 18.333L17.3337 19.5115L15.2503 17.4282L13.167 19.5115L11.9885 18.333L14.0718 16.2497L11.9885 14.1663L13.167 12.9878Z" fill="currentColor"/>
</svg>
    ),
    download: (
<svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M17.3337 17.3337H0.666992V8.16699H2.33366V15.667H15.667V8.16699H17.3337V17.3337Z" fill="currentColor"/>
<path d="M9.00033 13.5122L4.48848 9.00033L5.66699 7.82182L8.16699 10.3218V0.666992H9.83366V10.3218L12.3337 7.82182L13.5122 9.00033L9.00033 13.5122Z" fill="currentColor"/>
</svg>
    ),

    wifi: (
      <Image src="/wifi.svg" width={22} height={22} alt="wifi" />
    ),
    bluetooth: (
      <Image src="/bluetooth.svg" width={16} height={21} alt="bluetooth" />
    ),
    dots_vertical: (
      <Image src="/dots_vertical.svg" width={16} height={16} alt="more" />
    ),
    signal: (
      <Image src="/signal.svg" width={18} height={20} alt="signal" />
    ),
    account_delete_profile: (
      <Image src="/account_delete_profile.svg" width={120} height={120} alt="profile" />
    ),
    gps: (
      <Image src="/gps.svg" width={20} height={20} alt="gps" />
    ),
    battery: (
      <Image src="/battery.svg" width={20} height={20} alt="battery" />
    ),
    solar: (
      <Image src="/solar.svg" width={20} height={20} alt="solar panels" />
    ),
    plug: (
      <Image src="/plug.svg" width={20} height={20} alt="220V/110V port" />
    ),
    zap: (
      <Image src="/plug.svg" width={20} height={20} alt="12V port" />
    ),
    sdcard: (
      <Image src="/sdcard.svg" width={18} height={22} alt="memory card" />
    ),
    save: (
      <Image src="/save.svg" width={18} height={22} alt="save to card" />
    ),
    locked_yellow: (
      <Image src="/unlocked_yellow.svg" width={18} height={22} alt="save to card" />
    ),
    camera: (
      <Image src="/camera.svg" width={22} height={20} alt="BoxCam 360°" />
    ),
    car: (
      <Image src="/car.svg" width={22} height={22} alt="ADAS" />
    ),
    light: (
      <Image src="/light.svg" width={20} height={20} alt="light" />
    ),
    search: (
      <Image src="/search.svg" width={20} height={20} alt="search" />
    ),
    chevron_down: (
      <Image src="/chevron-down.svg" width={20} height={20} alt="down" />
    ),
    note: (
<svg width="24" height="30" className={className} viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.33333 13.6654H12V16.332H5.33333V13.6654Z" fill="currentColor"/>
<path d="M5.33333 18.9987H18.6667V21.6654H5.33333V18.9987Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M7.44772 0.332031H16.5523L18.6667 2.44641V2.9987H24V29.6654H0V2.9987H5.33333V2.44641L7.44772 0.332031ZM5.33333 5.66536H2.66667V26.9987H21.3333V5.66536H18.6667V8.33203H5.33333V5.66536ZM16 3.55098L15.4477 2.9987H8.55228L8 3.55098V5.66536H16V3.55098Z" fill="currentColor"/>
</svg>
    ),
    file_check: (
<svg width="20" height="20" className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.6785 11.6673L9.16667 16.1792L6.32149 13.334L7.5 12.1555L9.16667 13.8221L12.5 10.4888L13.6785 11.6673Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M2.5 0.833984H12.0118L17.5 6.32214V19.1673H2.5V0.833984ZM4.16667 2.50065V17.5006H15.8333V7.50065H10.8333V2.50065H4.16667ZM12.5 3.67916L14.6548 5.83398H12.5V3.67916Z" fill="currentColor"/>
</svg>
    ),
    copy_paste: (
<svg width="16" height="16" className={className} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M4.66667 0.666016H10.6095L14 4.05654V12.666H4.66667V0.666016ZM6 1.99935V11.3327H12.6667V5.33268H9.33333V1.99935H6ZM10.6667 2.60882L12.0572 3.99935H10.6667V2.60882Z" fill="#6B7971"/>
<path d="M3.33333 3.33268V13.9993H11.3333V15.3327H2V3.33268H3.33333Z" fill="#6B7971"/>
</svg>
    ),
    file_cross: (
<svg width="20" height="20" className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.33333 10.4888L10 12.1555L11.6667 10.4888L12.8452 11.6673L11.1785 13.334L12.8452 15.0006L11.6667 16.1792L10 14.5125L8.33333 16.1792L7.15482 15.0006L8.82149 13.334L7.15482 11.6673L8.33333 10.4888Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M2.5 0.833984H12.0118L17.5 6.32214V19.1673H2.5V0.833984ZM4.16667 2.50065V17.5006H15.8333V7.50065H10.8333V2.50065H4.16667ZM12.5 3.67916L14.6548 5.83398H12.5V3.67916Z" fill="currentColor"/>
</svg>
    ),
    arrows_up_down: (
<svg width="20" height="20" viewBox="0 0 20 20" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.15527 4.9998L5.83379 1.32129L9.5123 4.9998L8.33378 6.17831L6.66712 4.51165L6.66712 18.3331H5.00045L5.00045 4.51165L3.33378 6.17831L2.15527 4.9998Z" fill="currentColor"/>
<path d="M11.6671 13.8213L13.3338 15.488V1.66647L15.0004 1.66647L15.0004 15.488L16.6671 13.8213L17.8456 14.9998L14.1671 18.6783L10.4886 14.9998L11.6671 13.8213Z" fill="currentColor"/>
</svg>
    ),
    user_plus: (
<svg className={className} width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M4.83366 4.99967C4.83366 2.69849 6.69914 0.833008 9.00033 0.833008C11.3015 0.833008 13.167 2.69849 13.167 4.99967C13.167 7.30086 11.3015 9.16634 9.00033 9.16634C6.69914 9.16634 4.83366 7.30086 4.83366 4.99967ZM9.00033 2.49967C7.61961 2.49967 6.50033 3.61896 6.50033 4.99967C6.50033 6.38039 7.61961 7.49967 9.00033 7.49967C10.381 7.49967 11.5003 6.38039 11.5003 4.99967C11.5003 3.61896 10.381 2.49967 9.00033 2.49967Z" fill="currentColor"/>
<path d="M2.38524 17.4997C2.79532 14.2111 5.60064 11.6663 9.00033 11.6663C9.9706 11.6663 10.8904 11.8731 11.7198 12.2442L12.4804 12.5845L13.1611 11.0631L12.4004 10.7228C11.3611 10.2578 10.2097 9.99967 9.00033 9.99967C4.39795 9.99967 0.666992 13.7306 0.666992 18.333V19.1663H10.9621V17.4997H2.38524Z" fill="currentColor"/>
<path d="M15.667 12.4997V14.9997H18.167V16.6663H15.667V19.1663H14.0003V16.6663H11.5003V14.9997H14.0003V12.4997H15.667Z" fill="currentColor"/>
</svg>
    ),
    notes_info: (
<svg className={className} width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.83333 6.66634H8V8.33301H3.83333V6.66634Z" fill="currentColor"/>
<path d="M3.83333 9.99967H12.1667V11.6663H3.83333V9.99967Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M5.5 0.833008V1.66634H7.16667V0.833008H8.83333V1.66634H10.5V0.833008H12.1667V1.66634H15.5V19.1663H0.5V1.66634H3.83333V0.833008H5.5ZM3.83333 3.33301H2.16667V17.4997H13.8333V3.33301H12.1667V4.16634H10.5V3.33301H8.83333V4.16634H7.16667V3.33301H5.5V4.16634H3.83333V3.33301Z" fill="currentColor"/>
</svg>
    ),
    logout: (
<svg width="23" height="20" className={className} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.0002 0H10.0002V2H19.0002V18H10.0002V20H21.0002V0Z" fill="currentColor"/>
<path d="M6.00015 4.58579L0.585938 10L6.00015 15.4142L7.41436 14L4.41755 11.0032L16.0005 10.9997L15.9998 8.9997L4.41118 9.00319L7.41436 6L6.00015 4.58579Z" fill="currentColor"/>
</svg>
    ),
    calender: (
<svg width="20" height="22" className={className} viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M4 11H10V17H4V11ZM6 13V15H8V13H6Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M6 0V2H14V0H16V2H20V22H0V2H4V0H6ZM2 4V6H18V4H2ZM18 8H2V20H18V8Z" fill="currentColor"/>
</svg>
    ),
    messaging: (
<svg width="16" height="15" className={className} viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.9998 4.33594H3.99984V5.66927H11.9998V4.33594Z" fill="currentColor"/>
<path d="M8.6665 7.0026H3.99984V8.33594H8.6665V7.0026Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M15.3332 0.335938H0.666504V12.3359H3.99984V14.5388L7.52437 12.3359H15.3332V0.335938ZM13.9998 1.66927V11.0026H7.14197L5.33317 12.1331V11.0026H1.99984V1.66927H13.9998Z" fill="currentColor"/>
</svg>
    ),
    subscription: (
      <Image src="/subscription.svg" width={20} height={20} alt="logout" />
    ),
    home: (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} width="16" height="14" viewBox="0 0 16 14" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M3.61217 0.333984H12.3859L15.8145 6.33398H13.999V13.6673H12.6657V6.33398H9.99905V13.6673H1.99905V6.33398H0.183594L3.61217 0.333984ZM2.48117 5.00065H13.5169L11.6122 1.66732H4.38593L2.48117 5.00065ZM8.66571 6.33398H3.33238V9.66732H8.66571V6.33398ZM8.66571 11.0007H3.33238V12.334H8.66571V11.0007Z" fill="currentColor" />
      </svg>
    ),
    shield: (
<svg width="27" height="31" className={className} viewBox="0 0 27 31" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.8845 11.9183L11.6673 21.9734L6.45015 16.2819L8.41589 14.48L11.6673 18.027L18.9187 10.1164L20.8845 11.9183Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M13.6673 0.78125L16.8863 4.0002H27.0007V17.0682C27.0007 21.8105 24.2078 26.1079 19.8743 28.034L13.6673 30.7926L7.46032 28.034C3.12679 26.1079 0.333984 21.8105 0.333984 17.0682V4.0002H10.4484L13.6673 0.78125ZM13.6673 4.55249L11.5529 6.66687H3.00065V17.0682C3.00065 20.7567 5.17283 24.0991 8.54336 25.5971L13.6673 27.8744L18.7913 25.5971C22.1618 24.0991 24.334 20.7566 24.334 17.0682V6.66687H15.7817L13.6673 4.55249Z" fill="currentColor"/>
</svg>
    ),
    box_plus: (
<svg width="28" height="28" className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.3337 7.33464V12.668H20.667V15.3346H15.3337V20.668H12.667V15.3346H7.33366V12.668H12.667V7.33464H15.3337Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M0.666992 0.667969H27.3337V27.3346H0.666992V0.667969ZM3.33366 3.33464V24.668H24.667V3.33464H3.33366Z" fill="currentColor"/>
</svg>
    ),
    tick_mark: (
      <svg
        className="w-6 h-6 text-[var(--primary)] group-hover:text-white transition-colors"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    lock_yellow: (
      <Image src="/lock_yellow.svg" width={28} height={28} alt="lock" />
    ),
    shop_red: <Image src="/shop-red.svg" width={20} height={20} alt="more" />,
    unlock: <Image src="/unlocked.svg" width={20} height={20} alt="more" />,
    grubpacs: (
      <Image
        src="/grubpac.svg"
        width={20}
        height={20}
        alt="GrubPacs"
        className={className}
      />
    ),
    system_logs: (
      <Image
        src="/system_log.svg"
        width={20}
        height={20}
        alt="System logs"
        className={className}
      />
    ),
    grublock: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-orange-500"
        viewBox="0 0 512 512"
        fill="currentColor"
      >
        <rect x="96" y="208" width="320" height="240" rx="48" ry="48" />
        <path
          d="M336 208V144a80 80 0 10-160 0v64"
          fill="none"
          stroke="currentColor"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="256" cy="336" r="30" fill="white" />
      </svg>
    ),
    help: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    users: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
        <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1" />
        <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
        <path d="M17 10h2a2 2 0 0 1 2 2v1" />
        <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
        <path d="M3 13v-1a2 2 0 0 1 2 -2h2" />
      </svg>
    ),
    two_users: (
<svg width="30" height="28" className={className} viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M4.3335 6.0013C4.3335 3.05578 6.72131 0.667969 9.66683 0.667969C12.6123 0.667969 15.0002 3.05578 15.0002 6.0013C15.0002 8.94682 12.6123 11.3346 9.66683 11.3346C6.72131 11.3346 4.3335 8.94682 4.3335 6.0013ZM9.66683 3.33464C8.19407 3.33464 7.00016 4.52854 7.00016 6.0013C7.00016 7.47406 8.19407 8.66797 9.66683 8.66797C11.1396 8.66797 12.3335 7.47406 12.3335 6.0013C12.3335 4.52854 11.1396 3.33464 9.66683 3.33464Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M17.6668 8.66797C17.6668 6.45883 19.4577 4.66797 21.6668 4.66797C23.876 4.66797 25.6668 6.45883 25.6668 8.66797C25.6668 10.8771 23.876 12.668 21.6668 12.668C19.4577 12.668 17.6668 10.8771 17.6668 8.66797ZM21.6668 7.33464C20.9304 7.33464 20.3335 7.93159 20.3335 8.66797C20.3335 9.40435 20.9304 10.0013 21.6668 10.0013C22.4032 10.0013 23.0002 9.40435 23.0002 8.66797C23.0002 7.93159 22.4032 7.33464 21.6668 7.33464Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M0.333496 22.0013C0.333496 16.8466 4.51217 12.668 9.66683 12.668C12.4355 12.668 14.9217 13.8741 16.6297 15.7861C18.0042 14.671 19.7576 14.0013 21.6668 14.0013C26.0851 14.0013 29.6668 17.583 29.6668 22.0013V27.3346H0.333496V22.0013ZM18.1127 18.0246C18.682 19.232 19.0002 20.5808 19.0002 22.0013V24.668H27.0002V22.0013C27.0002 19.0558 24.6123 16.668 21.6668 16.668C20.3018 16.668 19.057 17.1797 18.1127 18.0246ZM16.3335 24.668V22.0013C16.3335 20.7185 15.9725 19.5241 15.3472 18.5095C14.1714 16.6016 12.0665 15.3346 9.66683 15.3346C5.98493 15.3346 3.00016 18.3194 3.00016 22.0013V24.668H16.3335Z" fill="currentColor"/>
</svg>
    ),
    windows_plus: (
<svg width="28" height="28" className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M0.666504 0.667969H12.6665V12.668H0.666504V0.667969ZM3.33317 3.33464V10.0013H9.99984V3.33464H3.33317Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M15.3332 0.667969H27.3332V12.668H15.3332V0.667969ZM17.9998 3.33464V10.0013H24.6665V3.33464H17.9998Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M0.666504 15.3346H12.6665V27.3346H0.666504V15.3346ZM3.33317 18.0013V24.668H9.99984V18.0013H3.33317Z" fill="currentColor"/>
<path d="M22.6665 15.3346V20.0013H27.3332V22.668H22.6665V27.3346H19.9998V22.668H15.3332V20.0013H19.9998V15.3346H22.6665Z" fill="currentColor"/>
</svg>
    ),
    medical_suitcase: (
<svg width="30" height="28" className={className} viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.333 12.668V15.3346H18.9997V18.0013H16.333V20.668H13.6663V18.0013H10.9997V15.3346H13.6663V12.668H16.333Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M8.33301 0.667969H21.6663V6.0013H29.6663V27.3346H0.333008V6.0013H8.33301V0.667969ZM5.66634 8.66797H2.99967V24.668H5.66634V8.66797ZM8.33301 24.668V8.66797H21.6663V24.668H8.33301ZM24.333 24.668H26.9997V8.66797H24.333V24.668ZM18.9997 6.0013H10.9997V3.33464H18.9997V6.0013Z" fill="currentColor"/>
</svg>
    ),
    warning_light_blue: (
<svg width="30" height="28" className={className} viewBox="0 0 30 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.0006 8.66801V16.668H13.3339V8.66801H16.0006Z" fill="currentColor"/>
<path d="M13.3339 19.3347H16.0139V22.0013H13.3339V19.3347Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M13.4873 0.0469225L15.8471 0.046875L29.1804 25.3804L28.0006 27.3347H1.33519L0.155273 25.3804L13.4873 0.0469225ZM14.6673 3.53078L3.54357 24.668H25.7921L14.6673 3.53078Z" fill="currentColor"/>
</svg>
    ),
    user_shield: (
<svg width="29" height="30" className={className} viewBox="0 0 29 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M7.33366 6.9987C7.33366 3.3168 10.3184 0.332031 14.0003 0.332031C17.6822 0.332031 20.667 3.3168 20.667 6.9987C20.667 10.6806 17.6822 13.6654 14.0003 13.6654C10.3184 13.6654 7.33366 10.6806 7.33366 6.9987ZM14.0003 2.9987C11.7912 2.9987 10.0003 4.78956 10.0003 6.9987C10.0003 9.20784 11.7912 10.9987 14.0003 10.9987C16.2095 10.9987 18.0003 9.20784 18.0003 6.9987C18.0003 4.78956 16.2095 2.9987 14.0003 2.9987Z" fill="currentColor"/>
<path d="M3.41618 26.9987C4.07231 21.7369 8.56083 17.6654 14.0003 17.6654C14.5739 17.6654 15.1359 17.7105 15.6834 17.7972L17.0003 18.0057L17.4174 15.3719L16.1005 15.1634C15.4156 15.0549 14.714 14.9987 14.0003 14.9987C6.63653 14.9987 0.666992 20.9682 0.666992 28.332V29.6654H16.9215V26.9987H3.41618Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M23.3336 17.0525L24.3049 18.0852C25.0158 18.8411 25.8628 19.2209 26.8337 19.2209H28.667V22.1959C28.667 25.6138 26.6917 28.6996 23.7235 29.6071L23.3337 29.7263L22.9438 29.6071C19.9756 28.6996 18.0003 25.6138 18.0003 22.1959L18.0004 19.2209H19.8337C20.8045 19.2209 21.6515 18.8411 22.3624 18.0852L23.3336 17.0525ZM20.667 21.8319L20.667 22.1959C20.667 24.4821 21.8709 26.2517 23.3337 26.9099C24.7964 26.2517 26.0003 24.4821 26.0003 22.1959V21.8325C25.0185 21.6993 24.121 21.3302 23.3336 20.7658C22.5463 21.3302 21.6488 21.6988 20.667 21.8319Z" fill="currentColor"/>
</svg>
    ),
    box: (
      <svg width="16" height="16" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" /><path d="M3 9h18M9 21V9" stroke="currentColor" /></svg>
    ),
    computer_access: (
<svg width="20" height="18" className={className} viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M9.99967 0.664062H19.1663V17.3307H13.333V15.6641H17.4997V2.33073H11.6663V3.16406H15.833V14.8307H9.16634V15.6641H11.6663V17.3307H4.99967V15.6641H7.49967V14.8307H0.833008V3.16406H9.99967V0.664062ZM14.1663 13.1641V4.83073H2.49967V13.1641H14.1663Z" fill="currentColor"/>
</svg>
    ),
profile_note: (
<svg width="16" height="20" className={className} viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.33333 10.0026C6.33333 9.08213 7.07953 8.33594 8 8.33594C8.92047 8.33594 9.66667 9.08213 9.66667 10.0026C9.66667 10.9231 8.92047 11.6693 8 11.6693C7.07953 11.6693 6.33333 10.9231 6.33333 10.0026Z" fill="currentColor"/>
<path d="M8 14.1693C7.27562 14.1693 6.65715 14.6319 6.42795 15.2803L6.15025 16.066L4.57885 15.5106L4.85655 14.7249C5.31375 13.4314 6.54734 12.5026 8 12.5026C9.45266 12.5026 10.6862 13.4314 11.1434 14.7249L11.4212 15.5106L9.84975 16.066L9.57205 15.2803C9.34285 14.6319 8.72437 14.1693 8 14.1693Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M5.15482 0.835938H10.8452L12.1667 2.15743V2.5026H15.5V19.1693H0.5V2.5026H3.83333V2.15743L5.15482 0.835938ZM3.83333 4.16927H2.16667V17.5026H13.8333V4.16927H12.1667V5.83594H3.83333V4.16927ZM10.5 2.84778L10.1548 2.5026H5.84518L5.5 2.84778V4.16927H10.5V2.84778Z" fill="currentColor"/>
</svg>
    ),
    plus: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    more: (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <circle cx="4" cy="10" r="2" />
        <circle cx="10" cy="10" r="2" />
        <circle cx="16" cy="10" r="2" />
      </svg>
    ),
    menu: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
    bell: (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    ),
    close: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    arrow: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    ),
    trash: (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m3 0v12a2 2 0 01-2 2H7a2 2 0 01-2-2V7h14z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6m4-6v6" />
      </svg>
    ),
    key: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="4" y="10" width="8" height="4" />
        <rect x="12" y="12" width="2" height="2" />
        <rect x="14" y="14" width="2" height="2" />
        <rect x="16" y="16" width="2" height="2" />
        <rect x="18" y="10" width="2" height="2" />
        <rect x="18" y="8" width="2" height="2" />
        <rect x="18" y="6" width="2" height="2" />
        <rect x="8" y="12" width="2" height="2" fill="#fff" />
      </svg>
    ),
    icon_alert: (
      <Image src="/Icon-alert.svg" width={28} height={27} alt="alert" />
    ),
    globe: (
      <HiOutlineGlobeAlt className={className} />
    ),
    inventory: (
      <TbFridge className={className}/>
    ),
    crown: (
<svg width="30" height="24" className={className} viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M12.667 2.66667C12.667 1.19391 13.8609 0 15.3337 0C16.8064 0 18.0003 1.19391 18.0003 2.66667C18.0003 3.4727 17.6427 4.1952 17.0775 4.68418L19.9009 11.2721L24.8603 7.66531C24.7356 7.35687 24.667 7.01978 24.667 6.66667C24.667 5.19391 25.8609 4 27.3337 4C28.8064 4 30.0003 5.19391 30.0003 6.66667C30.0003 8.00189 29.019 9.10791 27.7382 9.30284L24.398 24H6.26935L2.92909 9.30284C1.64832 9.10791 0.666992 8.00189 0.666992 6.66667C0.666992 5.19391 1.8609 4 3.33366 4C4.80642 4 6.00033 5.19391 6.00033 6.66667C6.00033 7.01978 5.93169 7.35687 5.80704 7.66531L10.7664 11.2721L13.5898 4.68418C13.0246 4.1952 12.667 3.4727 12.667 2.66667ZM15.3337 7.38479L11.9009 15.3945L6.08731 11.1665L8.39796 21.3333H22.2694L24.58 11.1665L18.7664 15.3945L15.3337 7.38479Z" fill="currentColor"/>
</svg>
    ),
    arrow_down: (
<svg width="12" height="50" className={className} viewBox="0 0 12 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 50L11.7735 40L0.226495 40L6 50ZM6 0L5 -4.37114e-08L5 41L6 41L7 41L7 4.37114e-08L6 0Z" fill="currentColor"/>
</svg>
    ),
    ticket: (
      <TfiReceipt className={`${className}`}/>
    ),
    compass: (
      <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"/>
      </svg>
    ),
    ruler_pencil: (
      <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
        <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
        <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
        <path d="M17.7 16.3a2.5 2.5 0 1 1-1.8-4.3H2"/>
      </svg>
    ),
    pencil: (
      <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
      </svg>
    ),
    drafting_compass: (
      <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v4"/>
        <path d="M12 18v4"/>
        <path d="M4.93 4.93l2.83 2.83"/>
        <path d="M16.24 16.24l2.83 2.83"/>
        <path d="M2 12h4"/>
        <path d="M18 12h4"/>
        <path d="M4.93 19.07l2.83-2.83"/>
        <path d="M16.24 7.76l2.83-2.83"/>
      </svg>
    ),
    settings: (
      <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  };
  return icons[name] || null;

}