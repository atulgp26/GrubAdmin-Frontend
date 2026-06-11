"use client";
import React from "react";
import Icon from "@/components/ui/Icon";

const verticalConfig = {
  medical: {
    icon: "medical_suitcase",
    color: "text-[var(--color-icon-medical)]",
    borderColor: "border-[var(--color-icon-medical)]",
    bgColor: "bg-[var(--color-icon-medical)]",
  },
  delivery: {
    icon: "box",
    color: "text-[var(--info-panel-view-bg)]",
    borderColor: "border-[var(--info-panel-view-bg)]",
    bgColor: "bg-[var(--info-panel-view-bg)]",
  },
  hospitality: {
    icon: "restaurant",
    color: "text-[var(--color-brand-default)]",
    borderColor: "border-[var(--color-brand-default)]",
    bgColor: "bg-[var(--color-brand-default)]",
  },
  camping: {
    icon: "compass",
    color: "text-[var(--color-icon-camping)]",
    borderColor: "border-[var(--color-icon-camping)]",
    bgColor: "bg-[var(--color-icon-camping)]",
  },
};

const defaultConfig = {
  icon: "box",
  color: "text-[var(--color-neutral-secondary)]",
  borderColor: "border-[var(--color-neutral-secondary)]",
  bgColor: "bg-[var(--color-neutral-secondary)]",
};

export default function VerticalList({ verticals = [], clientCounts = {}, onSelect, selectedVertical }) {
  const getVerticalConfig = (name) => {
    const key = name?.toLowerCase() || "";
    return verticalConfig[key] || defaultConfig;
  };

  const getItemCount = (vertical) => {
    return clientCounts[vertical.id] || clientCounts[vertical.name?.toLowerCase()] || 0;
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-[var(--color-neutral-primary)] mb-4 px-2">
        Vertical
      </h3>
      <div className="flex flex-col gap-3">
        {verticals.map((vertical) => {
          const config = getVerticalConfig(vertical.name);
          const count = getItemCount(vertical);
          const isSelected = selectedVertical === vertical.id || selectedVertical === vertical.name;

          return (
            <button
              key={vertical.id}
              onClick={() => onSelect?.(vertical)}
              className={`flex items-center gap-3 px-4 py-3 rounded-full border transition-all duration-200 hover:shadow-sm ${
                isSelected
                  ? `${config.borderColor} bg-white shadow-sm`
                  : "border-[var(--color-box-border)] bg-white hover:border-[var(--color-neutral-light)]"
              }`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} bg-opacity-10`}>
                <Icon name={config.icon} className={`w-5 h-5 ${config.color}`} />
              </div>
              <span className="text-[var(--color-neutral-secondary)] font-medium">
                {vertical.name.charAt(0).toUpperCase() + vertical.name.slice(1).toLowerCase()}
              </span>
              <span className="text-[var(--color-neutral-light)] ml-auto">
                ({count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}