"use client"
import { useState } from "react"
import Collapse from "@/components/ui/Collapse"

export default function GrubPacsEmptyState({
    poweredOnMessage,
    poweredOffMessage,
    poweredOnTitle = "Powered on",
    poweredOffTitle = "Powered off",
    poweredOnInitiallyExpanded = true,
    poweredOffInitiallyExpanded = false,
    className = "",
}) {
    const [openSection, setOpenSection] = useState(
        poweredOnInitiallyExpanded ? "poweredOn" : poweredOffInitiallyExpanded ? "poweredOff" : null,
    )

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Powered on section */}
            <Collapse
                title={poweredOnTitle}
                open={openSection === "poweredOn"}
                onClick={() => setOpenSection(openSection === "poweredOn" ? null : "poweredOn")}
            >
                {poweredOnMessage && (
                    <div className="p-4 border-b border-[var(--color-stroke-neutral)] ">
                        <p className="text-[var(--color-neutral-secondary)]">{poweredOnMessage}</p>
                    </div>
                )}
            </Collapse>
            {/* Powered off section */}
            <Collapse
                title={poweredOffTitle}
                open={openSection === "poweredOff"}
                onClick={() => setOpenSection(openSection === "poweredOff" ? null : "poweredOff")}
            >
                {poweredOffMessage && (
                    <div className="px-4 border-b border-[var(--color-stroke-neutral)] py-4">
                        <p className="text-[var(--color-neutral-secondary)]">{poweredOffMessage}</p>
                    </div>
                )}
            </Collapse>
        </div>
    )
}
