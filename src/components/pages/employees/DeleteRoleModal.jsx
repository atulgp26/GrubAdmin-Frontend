import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Image from "next/image";
import React from "react";
import { FaAngleRight } from "react-icons/fa6";

const DeleteRoleModal = ({ open, onClose,deleteNotAllowed,assignees, onDelete,title,description,onNext }) => {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} width="w-[600px]">
      <div className="flex justify-center flex-col mt-12">
        {
        deleteNotAllowed && (
        <div className="flex justify-center mb-6">
        <Image src="/exclamation-triangle.svg" width={60} height={60} alt="warning_image" />
        </div>
        )
        }
        <h1 className="text-2xl text-center text-[var(--color-neutral-primary)] font-semibold pb-4">
          {title || `Delete “Branch Manager” and 4 other roles?`}
        </h1>
        <p className="text-[var(--color-neutral-secondary)] text-center text-lg">
          {description || `None of the selected roles have assigned employees. They will be permanently removed.`}
        </p>
        <hr className="border-t border-[var(--color-box-border)] my-6" />
          {deleteNotAllowed ?
          (
            <>
        <Button
          onClick={onClose}
          variant="grayOutline"
          size="mdLg"
          className="flex items-center justify-center gap-2 mb-4"
        >
            <span>GO TO EMPLOYEE MANAGEMENT</span>
            <FaAngleRight/>
        </Button>
            </>
          ):
        <Button
          onClick={assignees>0? onNext:onDelete}
          variant={`${assignees>0?"secondary":"primary"}`}
          size="mdLg"
          className="flex items-center justify-center gap-2 mb-4"
        >
         {`${assignees>0?"NEXT":"YES, DELETE ROLE"}`}
        </Button>
          }
        <Button onClick={onClose} variant="cancel" size="mdLg">
          CANCEL
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteRoleModal;
