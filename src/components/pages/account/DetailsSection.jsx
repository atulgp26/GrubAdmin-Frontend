import {
  MdEmail,
  MdPhone,
  MdKey,
  MdPerson,
  MdLocationOn,
} from "react-icons/md";
import { HiOutlineMail } from "react-icons/hi";
import { IoCallOutline, IoLocationOutline } from "react-icons/io5";
import { VscKey } from "react-icons/vsc";
import { CiUser } from "react-icons/ci";
import Icon from "@/components/ui/Icon";

export default function DetailsSection({ basicDetails, professionalDetails, onAddPassword }) {
  return (
    <div className="col-span-6 lg:col-span-4 flex flex-col justify-center py-8 px-0 lg:px-12">
      <div>
        <div className="space-y-6 text-[var(--color-neutral-secondary)]">
          <DetailItem
            icon={<HiOutlineMail strokeWidth={2} className="w-5 h-5 text-[var(--color-neutral-light)]" />}
            label="Email"
            value={basicDetails.email}
          />
          <DetailItem
            icon={<IoCallOutline strokeWidth={2} className="w-5 h-5 text-[var(--color-neutral-light)]" />}
            label="Contact"
            value={basicDetails.contact}
            className="-ml-4"
          />
      <DetailItem
    icon={<VscKey className="w-5 h-5 text-[var(--color-neutral-light)]" />}
    label="Password"
    value={
        basicDetails.password === "ADD" || !basicDetails.password ? (
            <button
                onClick={onAddPassword}
                className="text-[var(--color-stroke-brand)] font-semibold text-base"
            >
                ADD
            </button>
        ) : (
            basicDetails.password
        )
    }
/>
        </div>
      </div>

      <hr  className="w-full border-t border-[var(--color-stroke-neutral)] my-5"/>

      <div>
        <div className="space-y-6 !text-[var(--color-neutral-secondary)]">
          <DetailItem
            icon={<CiUser strokeWidth={1} className="w-5 h-5 text-[var(--color-neutral-light)]" />}
            label="Role"
            value={professionalDetails.role}
          />
          <DetailItem
            icon={<IoLocationOutline strokeWidth={2} className="w-5 h-5 text-[var(--color-neutral-light)]" />}
            label="Location"
            value={professionalDetails.facility}
          />
          <DetailItem
            icon={<Icon name="calender" className="w-5 h-5 text-[var(--color-neutral-light)]" />}
            label="Joining date"
            value={professionalDetails.joiningDate}
          />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="grid grid-cols-3 items-center justify-start">
      <div className="flex items-center gap-4 ">
        {icon}
        <span className="text-[var(--color-neutral-secondary)] text-base">{label} :</span>
      </div>
      <span className="text-[var(--color-neutral-secondary)] text-base text-left">{value}</span>
    </div>
  );
}
