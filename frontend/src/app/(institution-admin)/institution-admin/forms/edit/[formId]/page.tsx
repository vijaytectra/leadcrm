"use client";

import { FormBuilderContainer } from "@/components/forms/FormBuilderContainer";
import { use } from "react";

interface EditFormPageProps {
    params: Promise<{
        formId: string;
    }>;
}

export default function EditFormPage({ params }: EditFormPageProps) {
    const { formId } = use(params);

    if (!formId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <FormBuilderContainer
                mode="edit"
                formId={formId}
            />
        </div>
    );
}
