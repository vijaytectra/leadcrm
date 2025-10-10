"use client";

import { FormsList } from "@/components/forms/FormsList";
import { useRouter } from "next/navigation";

export default function FormsPage() {
    const router = useRouter();

    const handleEditForm = (formId: string) => {
        router.push(`/institution-admin/forms/edit/${formId}`);
    };

    const handlePreviewForm = (formId: string) => {
        router.push(`/institution-admin/forms/preview/${formId}`);
    };

    const handleCreateForm = () => {
        router.push('/institution-admin/forms/create');
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