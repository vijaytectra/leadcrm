"use client";

import { FormBuilderContainer } from "@/components/forms/FormBuilderContainer";
import { useRouter } from "next/navigation";
import { use } from "react";

interface PreviewFormPageProps {
    params: Promise<{
        formId: string;
    }>;
}

export default function PreviewFormPage({ params }: PreviewFormPageProps) {
    const router = useRouter();
    const { formId } = use(params);

    const handleBack = () => {
        router.push("/institution-admin/forms");
    };

    if (!formId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading form preview...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto py-6 px-4">
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Forms
                    </button>
                </div>

                <FormBuilderContainer
                    mode="preview"
                    formId={formId}
                />
            </div>
        </div>
    );
}
