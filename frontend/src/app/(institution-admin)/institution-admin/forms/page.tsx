import { Metadata } from "next";
import { FormBuilderContainer } from "@/components/forms/FormBuilderContainer";
import { Suspense } from "react";
import { FormBuilderSkeleton } from "@/components/forms/FormBuilderSkeleton";

export const metadata: Metadata = {
    title: "Form Builder - Institution Admin",
    description: "Create and manage forms with our drag-and-drop form builder",
};

interface FormsPageProps {
    searchParams: Promise<{
        formId?: string;
        template?: string;
        mode?: "create" | "edit" | "preview";
    }>;
}

export default async function FormsPage({ searchParams }: FormsPageProps) {
    const params = await searchParams;
    const { formId, template, mode = "create" } = params;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="h-screen flex flex-col">
                <div className="flex-shrink-0 bg-white border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Form Builder
                            </h1>
                            <p className="text-slate-600 text-sm">
                                Create powerful forms with our drag-and-drop builder
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <Suspense fallback={<FormBuilderSkeleton />}>
                        <FormBuilderContainer
                            formId={formId}
                            templateId={template}
                            mode={mode}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
