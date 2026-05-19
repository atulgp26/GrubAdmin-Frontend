"use client";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import React, { useEffect, useMemo, useState } from "react";
import { GrDrag } from "react-icons/gr";

const normalizeCategory = (category) => {
  if (!category) return null;
  const id = category.id ?? category.value ?? category.category_id;
  const title = category.title || category.name || category.label || "";
  if (id === undefined || id === null || title === "") return null;
  return { id, title };
};

const ReorderCategoriesModal = ({ open, onClose, onConfirm, items = [] }) => {
  const [categories, setCategories] = useState([]);

  const normalizedItems = useMemo(() => {
    return (items || [])
      .map(normalizeCategory)
      .filter(Boolean);
  }, [items]);

  useEffect(() => {
    if (open) {
      setCategories(normalizedItems);
    }
  }, [open, normalizedItems]);

  if (!open) return null;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(categories);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setCategories(reordered);
  };

  return (
    <Modal open={open} onClose={onClose} width="w-[600px]">
      <div className="bg-white rounded-2xl w-full">
        <div className="flex justify-between items-start mb-6 px-6">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-neutral-primary)]">Reorder categories</h2>
            <p className="text-[var(--color-stroke-brand)] mt-1">
              Drag and drop to set the order in which categories appear in the client Help section.
            </p>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto px-6"
              >
                {categories.map((cat, index) => (
                  <Draggable key={cat.id} draggableId={String(cat.id)} index={index}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className="flex items-center gap-3 border border-[var(--color-stroke-brand)] rounded-lg px-4 py-3 bg-white w-full min-w-0"
                      >
                        <GrDrag className="text-[var(--color-stroke-brand)] w-6 h-6 flex-shrink-0" />
                        <span className="uppercase text-[var(--color-stroke-brand)] text-lg truncate flex-1 min-w-0">
                          {cat.title}
                        </span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex gap-4 pt-4 border-t border-[var(--color-box-border)] px-6 pb-6">
          <Button
            variant="cancel"
            onClick={onClose}
            className="btn-size-md-lg w-1/2"
          >
            CANCEL
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              const orderMap = {};
              categories.forEach((c, idx) => {
                orderMap[c.id] = idx + 1;
              });
              onConfirm(orderMap);
            }}
            className="btn-size-md-lg w-1/2"
          >
            CONFIRM
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReorderCategoriesModal;
