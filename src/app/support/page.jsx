"use client"
import InfoPanel from "@/components/common/InfoPanel";
import AddCategory from "@/components/pages/support/addcategory";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { faqService } from "@/api/services/faqService";
import { usePermissions } from "@/context/PermissionContext";

export default function SupportPage() {
  const router = useRouter();
  const [addCategory, setAddCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasCategories, setHasCategories] = useState(false);
  const { can } = usePermissions();
  const canAddCategory = (
    can("add new category", "support") ||
    can("add new category")
  );

  useEffect(() => {
    const load = async () => {
      try {
        const res = await faqService.getCategories();
        if (res?.success && res?.code === 200) {
          const list = res.data?.faq_categories || res.data?.data?.faq_categories || [];
          const has = Array.isArray(list) && list.length > 0;
          setHasCategories(has);
          if (has) {
            router.replace("/support/categories");
            return;
          }
        }
      } catch (_) { }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!loading && hasCategories) {
      router.replace("/support/categories");
    }
  }, [loading, hasCategories, router]);

  const handleAddCategory = () => setAddCategory(true);

  if (loading || hasCategories) return null;
  return (
    <div className="min-h-[calc(100vh-150px)]">
      <div className="flex flex-col">
        <div className="">
          <h1 className="text-2xl font-semibold text-[var(--color-neutral-primary)] mb-2">
            Client support management
          </h1>
          <p className="text-base text-[var(--color-stroke-brand)]">
            Oversee the content and resources shown in client help sections.
          </p>
        </div>
        <InfoPanel
          description="Create your first category to organize client-facing support content."
          image={null}
          name="No FAQs or categories added yet."
          buttons={canAddCategory ? [
            {
              text: "ADD CATEGORY",
              icon: "plus",
              className:
                "!px-4 !py-2 rounded-lg font-medium !text-base flex items-center justify-center uppercase",
              variant: "primary",
              onClick: handleAddCategory,
            },
          ] : []}
        />
      </div>
      <AddCategory open={addCategory} onClose={() => setAddCategory(false)} />
    </div>
  );
}
