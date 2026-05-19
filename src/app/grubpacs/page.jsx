"use client";
import React, { useState } from "react";
import InfoPanel from "@/components/common/InfoPanel";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import Button from "@/components/ui/Button";
import AddNewGrubPac from "@/components/pages/grubpacs/addnewgrubpacs";

const GrubPacsPage = () => {
    const [open, setOpen] = useState(false);
      const handleAddGrubpac = () => {
    setOpen(true);
  };
  return (
    <div>
      <InfoPanel
        title="GrubPacs"
        description="Add GrubPac boxes to start tracking and assigning them to clients. You can"
        subdescription="later sync this list with your ERP."
        image={null}
        name="No GrubPacs Added"
        topRight={
          <Link
            href="/grubpacs/list"
            className="text-[var(--info-panel-view-bg)] font-medium cursor-pointer"
          >
            <Button variant="infoPanel">
              KNOW MORE
            </Button>
          </Link>
        }
        buttons={[
          {
            text: "ADD BOXES",
            icon: "plus",
            className: "!px-4 !py-2 rounded-lg font-medium !text-base flex items-center justify-center uppercase",
            variant: "primary",
            onClick: handleAddGrubpac,
          },
        ]}
      />
      <AddNewGrubPac open={open} onClose={()=>setOpen(false)}/>
    </div>
  );
};

export default GrubPacsPage; 