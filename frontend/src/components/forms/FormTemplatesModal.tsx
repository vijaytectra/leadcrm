"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    X,
    Search,
    Star,
    Download,
    Eye,
    FileText,
    Users,
    CreditCard,
    MessageSquare,
    ClipboardList,
    Briefcase,
    GraduationCap,
    Heart,
    BarChart3,
    Settings
} from "lucide-react";
import { formsApi } from "@/lib/api/forms";
import { toast } from "sonner";
import type { FormTemplate, FormCategory } from "@/types/form-builder";

interface FormTemplatesModalProps {
    onSelectTemplate: (template: FormTemplate) => void;
    onClose: () => void;
}

const TEMPLATE_CATEGORIES = [
    { value: "admission", label: "Admission", icon: GraduationCap, color: "bg-blue-100 text-blue-800" },
    { value: "contact", label: "Contact", icon: MessageSquare, color: "bg-green-100 text-green-800" },
    { value: "scholarship", label: "Scholarship", icon: Star, color: "bg-yellow-100 text-yellow-800" },
    { value: "feedback", label: "Feedback", icon: Heart, color: "bg-pink-100 text-pink-800" },
    { value: "survey", label: "Survey", icon: BarChart3, color: "bg-purple-100 text-purple-800" },
    { value: "registration", label: "Registration", icon: ClipboardList, color: "bg-indigo-100 text-indigo-800" },
    { value: "application", label: "Application", icon: Briefcase, color: "bg-orange-100 text-orange-800" },
    { value: "payment", label: "Payment", icon: CreditCard, color: "bg-red-100 text-red-800" }
];

const SAMPLE_TEMPLATES: FormTemplate[] = [
    {
        id: "student-admission",
        name: "Student Admission Form",
        description: "Complete admission form for new students with document upload and payment integration",
        category: "admission",
        isPublic: true,
        isPremium: false,
        formConfig: {
            id: "template-1",
            tenantId: "",
            title: "Student Admission Form",
            description: "Complete admission form for new students",
            isActive: true,
            requiresPayment: true,
            paymentAmount: 500,
            allowMultipleSubmissions: false,
            maxSubmissions: 1,
            submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            settings: {
                theme: {
                    primaryColor: "#3b82f6",
                    secondaryColor: "#6b7280",
                    backgroundColor: "#ffffff",
                    textColor: "#111827",
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    fontFamily: "Inter",
                    fontSize: 16
                },
                layout: {
                    width: "full",
                    alignment: "left",
                    spacing: "normal",
                    showProgress: true,
                    showStepNumbers: true
                },
                validation: {
                    validateOnSubmit: true,
                    showInlineErrors: true,
                    customValidationRules: []
                },
                notifications: {
                    emailOnSubmission: true,
                    emailRecipients: ["admin@school.edu"],
                    smsOnSubmission: false,
                    smsRecipients: [],
                    autoResponse: true,
                    autoResponseMessage: "Thank you for your application. We will review it and get back to you soon."
                },
                integrations: {
                    customScripts: []
                },
                security: {
                    requireCaptcha: true,
                    allowAnonymous: false,
                    rateLimit: {
                        enabled: true,
                        maxSubmissions: 5,
                        timeWindow: 60
                    }
                }
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        fields: [
            {
                id: "personal-info",
                formId: "template-1",
                type: "heading",
                label: "Personal Information",
                placeholder: "",
                description: "",
                required: false,
                order: 0,
                width: "full",
                validation: { required: false },
                conditionalLogic: { enabled: false, conditions: [], actions: [] },
                options: {},
                styling: {},
                advanced: {}
            },
            {
                id: "full-name",
                formId: "template-1",
                type: "text",
                label: "Full Name",
                placeholder: "Enter your full name",
                description: "",
                required: true,
                order: 1,
                width: "full",
                validation: { required: true, minLength: 2, maxLength: 100 },
                conditionalLogic: { enabled: false, conditions: [], actions: [] },
                options: {},
                styling: {},
                advanced: {}
            },
            {
                id: "email",
                formId: "template-1",
                type: "email",
                label: "Email Address",
                placeholder: "Enter your email address",
                description: "",
                required: true,
                order: 2,
                width: "full",
                validation: { required: true },
                conditionalLogic: { enabled: false, conditions: [], actions: [] },
                options: {},
                styling: {},
                advanced: {}
            },
            {
                id: "phone",
                formId: "template-1",
                type: "phone",
                label: "Phone Number",
                placeholder: "Enter your phone number",
                description: "",
                required: true,
                order: 3,
                width: "full",
                validation: { required: true },
                conditionalLogic: { enabled: false, conditions: [], actions: [] },
                options: {},
                styling: {},
                advanced: {}
            }
        ],
        steps: [],
        previewImage: "/templates/student-admission.png",
        tags: ["admission", "student", "education"],
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "contact-form",
        name: "Contact Form",
        description: "Simple contact form for inquiries and feedback",
        category: "contact",
        isPublic: true,
        isPremium: false,
        formConfig: {
            id: "template-2",
            tenantId: "",
            title: "Contact Form",
            description: "Get in touch with us",
            isActive: true,
            requiresPayment: false,
            allowMultipleSubmissions: true,
            settings: {
                theme: {
                    primaryColor: "#10b981",
                    secondaryColor: "#6b7280",
                    backgroundColor: "#ffffff",
                    textColor: "#111827",
                    borderColor: "#d1d5db",
                    borderRadius: 8,
                    fontFamily: "Inter",
                    fontSize: 16
                },
                layout: {
                    width: "full",
                    alignment: "left",
                    spacing: "normal",
                    showProgress: false,
                    showStepNumbers: false
                },
                validation: {
                    validateOnSubmit: true,
                    showInlineErrors: true,
                    customValidationRules: []
                },
                notifications: {
                    emailOnSubmission: true,
                    emailRecipients: ["contact@company.com"],
                    smsOnSubmission: false,
                    smsRecipients: [],
                    autoResponse: true,
                    autoResponseMessage: "Thank you for contacting us. We will get back to you within 24 hours."
                },
                integrations: {
                    customScripts: []
                },
                security: {
                    requireCaptcha: false,
                    allowAnonymous: true,
                    rateLimit: {
                        enabled: true,
                        maxSubmissions: 10,
                        timeWindow: 60
                    }
                }
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        fields: [
            {
                id: "name",
                formId: "template-2",
                type: "text",
                label: "Name",
                placeholder: "Your name",
                description: "",
                required: true,
                order: 0,
                width: "full",
                validation: { required: true },
                conditionalLogic: { enabled: false, conditions: [], actions: [] },
                options: {},
                styling: {},
                advanced: {}
            },
            {
                id: "email",
                formId: "template-2",
                type: "email",
                label: "Email",
                placeholder: "your@email.com",
                description: "",
                required: true,
                order: 1,
                width: "full",
                validation: { required: true },
                conditionalLogic: { enabled: false, conditions: [], actions: [] },
                options: {},
                styling: {},
                advanced: {}
            },
            {
                id: "subject",
                formId: "template-2",
                type: "select",
                label: "Subject",
                placeholder: "Select a subject",
                description: "",
                required: true,
                order: 2,
                width: "full",
                validation: { required: true },
                conditionalLogic: { enabled: false, conditions: [], actions: [] },
                options: {
                    choices: [
                        { id: "general", label: "General Inquiry", value: "general" },
                        { id: "support", label: "Technical Support", value: "support" },
                        { id: "billing", label: "Billing Question", value: "billing" }
                    ]
                },
                styling: {},
                advanced: {}
            },
            {
                id: "message",
                formId: "template-2",
                type: "textarea",
                label: "Message",
                placeholder: "Your message here...",
                description: "",
                required: true,
                order: 3,
                width: "full",
                validation: { required: true, minLength: 10, maxLength: 1000 },
                conditionalLogic: { enabled: false, conditions: [], actions: [] },
                options: {},
                styling: {},
                advanced: {}
            }
        ],
        steps: [],
        previewImage: "/templates/contact-form.png",
        tags: ["contact", "inquiry", "feedback"],
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export function FormTemplatesModal({ onSelectTemplate, onClose }: FormTemplatesModalProps) {
    const [templates, setTemplates] = useState<FormTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<FormTemplate[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<FormCategory | "all">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        filterTemplates();
    }, [templates, selectedCategory, searchTerm]);

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            // For now, use sample templates
            // In production, this would call the API
            setTemplates(SAMPLE_TEMPLATES);
        } catch (error) {
            toast.error("Failed to load templates");
        } finally {
            setIsLoading(false);
        }
    };

    const filterTemplates = () => {
        let filtered = templates;

        if (selectedCategory !== "all") {
            filtered = filtered.filter(template => template.category === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredTemplates(filtered);
    };

    const handleSelectTemplate = (template: FormTemplate) => {
        onSelectTemplate(template);
        toast.success(`Template "${template.name}" selected`);
    };

    const getCategoryIcon = (category: FormCategory) => {
        const categoryData = TEMPLATE_CATEGORIES.find(c => c.value === category);
        return categoryData?.icon || FileText;
    };

    const getCategoryColor = (category: FormCategory) => {
        const categoryData = TEMPLATE_CATEGORIES.find(c => c.value === category);
        return categoryData?.color || "bg-gray-100 text-gray-800";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">Form Templates</h3>
                        <p className="text-slate-600 mt-1">Choose from our collection of pre-built form templates</p>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search templates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                size="sm"
                                variant={selectedCategory === "all" ? "default" : "outline"}
                                onClick={() => setSelectedCategory("all")}
                            >
                                All
                            </Button>
                            {TEMPLATE_CATEGORIES.map((category) => {
                                const IconComponent = category.icon;
                                return (
                                    <Button
                                        key={category.value}
                                        size="sm"
                                        variant={selectedCategory === category.value ? "default" : "outline"}
                                        onClick={() => setSelectedCategory(category.value as FormCategory)}
                                        className="flex items-center space-x-1"
                                    >
                                        <IconComponent className="h-4 w-4" />
                                        <span>{category.label}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-slate-600">Loading templates...</p>
                            </div>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-slate-600 mb-2">No templates found</h4>
                                <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map((template) => {
                                const CategoryIcon = getCategoryIcon(template.category);
                                const categoryColor = getCategoryColor(template.category);

                                return (
                                    <div
                                        key={template.id}
                                        className="bg-white border border-slate-200 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group"
                                        onClick={() => handleSelectTemplate(template)}
                                    >
                                        {/* Template Preview */}
                                        <div className="aspect-video bg-slate-100 rounded-t-lg flex items-center justify-center">
                                            {template.previewImage ? (
                                                <img
                                                    src={template.previewImage}
                                                    alt={template.name}
                                                    className="w-full h-full object-cover rounded-t-lg"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <CategoryIcon className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                                                    <p className="text-sm text-slate-500">Preview</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Template Info */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {template.name}
                                                </h4>
                                                <div className="flex items-center space-x-1">
                                                    {template.isPremium && (
                                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                    )}
                                                    <Badge className={`text-xs ${categoryColor}`}>
                                                        {template.category}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                                {template.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {template.fields.length} fields
                                                    </Badge>
                                                    {template.requiresPayment && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Payment
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle preview
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle download
                                                        }}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">
                            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    // Handle create custom template
                                    toast.info("Custom template creation coming soon");
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Create Custom
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
