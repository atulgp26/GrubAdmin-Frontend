"use client";
import React from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import Icon from "@/components/ui/Icon";

const TakeActionModal = ({
  open,
  onClose,
  actions = [],
  modalProps = {},
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      width="w-98"
      height="h-auto"
      top="top-36"
      right="right-2"
      noBlur={true}
      positionClass="items-start justify-end"
      closeOnOutsideClick={true}
      noXPadding={true}
      hideClose={true}
      {...modalProps}
    >
      <div className="divide-y divide-[var(--color-stroke-neutral)]">
        {actions.map((action, index) => {
          const Wrapper = action.href ? Link : React.Fragment;
          const wrapperProps = action.href ? { href: action.href } : {};

          const content = (
            <div
              onClick={action.onClick}
              className="cursor-pointer group hover:bg-[var(--sidebar-active-bg)] active:bg-[var(--color-admin-profile-border)] flex items-center gap-3 px-4 py-3"
            >
              <div className="flex justify-center">
                <Icon
                  name={action.icon}
                  className={`w-5 h-5 ${action.iconColor || "text-[var(--color-neutral-light)]"}`}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm text-[var(--color-neutral-secondary)] group-active:text-[var(--color-neutral-primary)] mb-1">
                  {action.title}
                </h3>
                <p className="text-xs text-[var(--color-stroke-brand)] group-active:text-[var(--color-neutral-secondary)] leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          );

          return (
            <Wrapper key={index} {...wrapperProps}>
              {content}
            </Wrapper>
          );
        })}
      </div>
    </Modal>
  );
};

export default TakeActionModal;
