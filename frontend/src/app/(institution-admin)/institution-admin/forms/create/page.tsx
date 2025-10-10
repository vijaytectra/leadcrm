"use client";

import { FormBuilderContainer } from "@/components/forms/FormBuilderContainer";

export default function CreateFormPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <FormBuilderContainer mode="create" />
        </div>
    );
}
