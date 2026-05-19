"use client";
import { useState } from "react";
import HelpCard from "@/components/pages/help/HelpCard";
import HelpSearchInput from "../HelpSearchInput";
import HelpWriteToUs from "@/components/pages/help/HelpWriteToUs";
import FeedbackModal from "../FeedbackModal";
import { FiSettings } from "react-icons/fi";
import {
  MdMedicalServices,
  MdBluetooth,
  MdOutlineNotificationsNone,
  MdOutlineSupportAgent,
  MdOutlineHelpOutline,
} from "react-icons/md";
import Link from "next/link";
import Image from "next/image";
import DetailsCollapse from "@/components/ui/DetailsCollapse";
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";

const protocols = [
  {
    id: 1,
    icon:<Icon name="two_users" className="h-8 w-8 text-[var(--color-admin-profile-border)]"/>,
    title: "Check FAQs",
    subtitle:
      "Before escalating, see if the answer already exists in our knowledge base. Most common issues are covered.",
    goTo: "BROWSE FAQs",
    href:"/help",
  },
  {
    id: 2,
    icon:<Icon name="two_users" className="h-8 w-8 text-[var(--color-admin-profile-border)]"/>,
    title: "Contact support",
    subtitle:
      <>If the issue isn’t covered in FAQs, reach out to GrubPac Support (<span className="text-sm text-[var(--info-panel-view-bg)]">support@grubpac.com</span>). Use escalation templates for faster resolution.</>,
    goTo: "EMAILS",
    href:"/help",
  },
  {
    id: 3,
    icon:<Icon name="two_users" className="h-8 w-8 text-[var(--color-admin-profile-border)]"/>,
    title: "Escalate to the right team",
    subtitle:
      "For complex issues, use pre-filled templates. They ensure you include all necessary details so Support can quickly redirect your case to the right team.",
    goTo: "TEMPLATES",
    href:"/help/escalation-templates",
  },
];

export default function HelpPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="">
      <div className="flex items-center gap-3 mb-15">
        <Button
        variant="cancel"
          onClick={() => router.back()}
          className="p-2 mb-8 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <IoChevronBack className="w-4 h-4 text-[var(--color-stroke-brand)]" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-neutral-primary)] mb-1">
            Escalation Protocols
          </h1>
          <p className="text-base text-[var(--color-stroke-brand)]">
            Follow these simple steps to resolve client issues effectively.
          </p>
        </div>
      </div>

      {/* Collapsible category filters */}
      <div className="mt-4">
        <div className="px-4 pt-2 pb-4">
          <div className="flex flex-col gap-2">
            {protocols.map((protocol,index) => (
                <> 
              <HelpCard href={protocol.href} protocol={true} className="!h-[100px]">
                <div className="w-full flex items-center py-4 px-6">
                <div className="">
                    {protocol.icon}
                </div>
                <div className="w-full flex justify-between items-center">
                <div className="flex flex-col pl-4">
                  <span className="font-semibold text-base text-[var(--color-neutral-primary)]">
                    Step {protocol.id}: {protocol.title}
                  </span>
                  <span className="text-sm font-normal leading-5 text-[var(--color-stroke-brand)] max-w-[90%]">
                    {protocol.subtitle}
                  </span>
                    </div>
                    <Button variant="grayOutline" onClick={()=>router.push(protocol.href)} className="flex btn-size-md-sm !py-2 px-3 leading-none items-center gap-2">
                        {protocol.goTo}
                        <ArrowUpRight className="w-5 h-5"/>
                    </Button>
                </div>
                </div>
              </HelpCard>
              {
                protocol.id<=protocols.length-1 && (
                    <div className="pl-10">
                        <Icon name="arrow_down" className=" text-[var(--info-panel-view-bg)]"/>
                    </div>
                )
              }
                </>
            ))}
          </div>
        </div>
      </div>
      <FeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onFeedback={() => setModalOpen(false)}
      />
    </div>
  );
}
