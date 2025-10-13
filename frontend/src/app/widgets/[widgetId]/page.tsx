// import React from 'react';
// import { notFound } from 'next/navigation';
// import { apiGet } from '@/lib/utils';
// import { getThemeStyles, generateThemeCSS } from '@/lib/widget-themes';
// import { FormFieldRenderer } from '@/components/forms/FormFieldRenderer';
// import { getToken } from '@/lib/getToken';

// interface WidgetPageProps {
//     params: {
//         widgetId: string;
//     };
//     searchParams: {
//         theme?: string;
//         primaryColor?: string;
//         borderRadius?: string;
//     };
// }

// interface Widget {
//     id: string;
//     name: string;
//     formId: string;
//     settings: {
//         theme: string;
//         primaryColor: string;
//         borderRadius: number;
//         width: string;
//         height: string;
//     };
//     isActive: boolean;
// }

// interface Form {
//     id: string;
//     title: string;
//     description?: string;
//     fields: Array<{
//         id: string;
//         type: string;
//         label: string;
//         required: boolean;
//         placeholder?: string;
//         options?: any;
//         validation?: any;
//         conditionalLogic?: any;
//     }>;
//     steps: Array<{
//         id: string;
//         title: string;
//         description?: string;
//         fields: string[];
//     }>;
// }

// export default async function WidgetPage({ params, searchParams }: WidgetPageProps) {
//     const { widgetId } = params;
//     const { theme, primaryColor, borderRadius } = searchParams;

//     try {
//         const token = await getToken();
//         // Fetch widget details
//         const widgetResponse = await apiGet<{ success: boolean; data: Widget }>(
//             `/widgets/${widgetId}`,
//             { token: token }

//         );
//         const widget = widgetResponse.data;

//         if (!widget.isActive) {
//             return (
//                 <div className="min-h-screen flex items-center justify-center bg-slate-50">
//                     <div className="text-center">
//                         <h1 className="text-2xl font-bold text-slate-900 mb-2">Widget Inactive</h1>
//                         <p className="text-slate-600">This widget is currently not available.</p>
//                     </div>
//                 </div>
//             );
//         }

//         // Fetch form details
//         const formResponse = await apiGet<{ success: boolean; data: Form }>(
//             `/forms/${widget.formId}`,
//             { token: token } // Public endpoint
//         );
//         const form = formResponse.data;

//         // Determine theme settings
//         const effectiveTheme = theme || widget.settings.theme;
//         const effectivePrimaryColor = primaryColor || widget.settings.primaryColor;
//         const effectiveBorderRadius = borderRadius ? parseInt(borderRadius) : widget.settings.borderRadius;

//         // Get theme styles
//         const themeStyles = getThemeStyles(effectiveTheme as any);
//         const customTheme = {
//             ...themeStyles,
//             primaryColor: effectivePrimaryColor,
//             borderRadius: effectiveBorderRadius
//         };

//         // Generate CSS
//         const themeCSS = generateThemeCSS(customTheme);

//         return (
//             <div className="min-h-screen bg-slate-50">
//                 <style jsx global>{`
//           ${themeCSS}
//         `}</style>

//                 <div className="container mx-auto px-4 py-8">
//                     <div className="max-w-2xl mx-auto">
//                         {/* Form Header */}
//                         <div className="text-center mb-8">
//                             <h1 className="text-3xl font-bold text-slate-900 mb-2">
//                                 {form.title}
//                             </h1>
//                             {form.description && (
//                                 <p className="text-slate-600">
//                                     {form.description}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Form Container */}
//                         <div className="widget-form bg-white rounded-lg shadow-lg p-8">
//                             <form
//                                 action={`/api/forms/${form.id}/submit`}
//                                 method="POST"
//                                 className="space-y-6"
//                                 onSubmit={async (e) => {
//                                     e.preventDefault();

//                                     // Track form submission
//                                     try {
//                                         await fetch(`/api/widgets/${widgetId}/track`, {
//                                             method: 'POST',
//                                             headers: {
//                                                 'Content-Type': 'application/json',
//                                             },
//                                             body: JSON.stringify({
//                                                 type: 'submission',
//                                                 timestamp: new Date().toISOString()
//                                             })
//                                         });
//                                     } catch (error) {
//                                         console.error('Failed to track submission:', error);
//                                     }

//                                     // Submit form
//                                     const formData = new FormData(e.currentTarget);
//                                     const response = await fetch(`/api/forms/${form.id}/submit`, {
//                                         method: 'POST',
//                                         body: formData
//                                     });

//                                     if (response.ok) {
//                                         // Show success message
//                                         const successMessage = document.createElement('div');
//                                         successMessage.className = 'form-success p-4 bg-green-50 border border-green-200 rounded-lg mb-4';
//                                         successMessage.innerHTML = `
//                       <div class="flex items-center">
//                         <svg class="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
//                         </svg>
//                         <span class="text-green-800 font-medium">Thank you! Your submission has been received.</span>
//                       </div>
//                     `;
//                                         e.currentTarget.parentNode?.insertBefore(successMessage, e.currentTarget);
//                                         e.currentTarget.style.display = 'none';
//                                     } else {
//                                         // Show error message
//                                         const errorMessage = document.createElement('div');
//                                         errorMessage.className = 'form-error p-4 bg-red-50 border border-red-200 rounded-lg mb-4';
//                                         errorMessage.innerHTML = `
//                       <div class="flex items-center">
//                         <svg class="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                         </svg>
//                         <span class="text-red-800 font-medium">There was an error submitting your form. Please try again.</span>
//                       </div>
//                     `;
//                                         e.currentTarget.parentNode?.insertBefore(errorMessage, e.currentTarget);
//                                     }
//                                 }}
//                             >
//                                 {/* Form Fields */}
//                                 {form.fields.map((field) => (
//                                     <div key={field.id} className="form-field">
//                                         <FormFieldRenderer
//                                             field={field}
//                                             value=""
//                                             onChange={() => { }}
//                                             onBlur={() => { }}
//                                             error=""
//                                             isSubmitting={false}
//                                         />
//                                     </div>
//                                 ))}

//                                 {/* Submit Button */}
//                                 <div className="pt-6">
//                                     <button
//                                         type="submit"
//                                         className="form-button w-full"
//                                     >
//                                         Submit Form
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>

//                         {/* Footer */}
//                         <div className="text-center mt-8 text-sm text-slate-500">
//                             <p>Powered by Lead101 CRM</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Track page view */}
//                 <script
//                     dangerouslySetInnerHTML={{
//                         __html: `
//               (function() {
//                 fetch('/api/widgets/${widgetId}/track', {
//                   method: 'POST',
//                   headers: {
//                     'Content-Type': 'application/json',
//                   },
//                   body: JSON.stringify({
//                     type: 'view',
//                     timestamp: new Date().toISOString()
//                   })
//                 }).catch(console.error);
//               })();
//             `
//                     }}
//                 />
//             </div>
//         );
//     } catch (error) {
//         console.error('Error loading widget:', error);
//         notFound();
//     }
// }

// // Track widget views
// export async function trackWidgetView(widgetId: string) {
//     try {
//         await fetch(`/api/widgets/${widgetId}/track`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 type: 'view',
//                 timestamp: new Date().toISOString()
//             })
//         });
//     } catch (error) {
//         console.error('Failed to track widget view:', error);
//     }
// }
export default function PublicWidgetPage() {
    return (
        <div>
            <h1>Public Widget</h1>
        </div>
    );
}