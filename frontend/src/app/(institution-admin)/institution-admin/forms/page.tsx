"use client";

import { FormsList } from "@/components/forms/FormsList";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "next/navigation";

export default function FormsPage() {
    const router = useRouter();
    const { currentTenantSlug } = useAuthStore();

    const handleEditForm = (formId: string) => {
        router.push(`/institution-admin/forms/edit/${formId}?tenant=${currentTenantSlug}`);
    };

    const handlePreviewForm = (formId: string) => {
        router.push(`/institution-admin/forms/preview/${formId}?tenant=${currentTenantSlug}`);
    };

    const handleCreateForm = () => {
        router.push(`/institution-admin/forms/create?tenant=${currentTenantSlug}`);
    };

    return (
        <div className="container mx-auto py-6 px-4">
            <FormsList
                onEditForm={handleEditForm}
                onPreviewForm={handlePreviewForm}
                onCreateForm={handleCreateForm}
            />
        </div>
    );
}