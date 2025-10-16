"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormBuilder } from "./FormBuilderProvider";
import {
    Search,
    Type,
    FileText,
    Mail,
    Phone,
    Hash,
    Calendar,
    Clock,
    ChevronDown,
    CheckSquare,
    Radio,
    Upload,
    PenTool,
    Star,
    Sliders,
    MapPin,
    Link,
    Lock,
    EyeOff,
    Minus,
    Heading,
    AlignLeft,
    Calculator,
    CreditCard,
    Layers,
    Settings,
    BarChart3
} from "lucide-react";
import { FIELD_TYPES } from "@/types/form-builder";

export function FormBuilderSidebar() {
    const { state, actions, dragDropActions } = useFormBuilder();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("fields");

    const handleFieldDragStart = (fieldType: string) => {
        dragDropActions.setDraggedFieldType(fieldType);
        dragDropActions.setIsDragging(true);
    };

    const handleFieldDragEnd = () => {
        dragDropActions.setDraggedFieldType(null);
        dragDropActions.setIsDragging(false);
    };

    const filteredFieldTypes = FIELD_TYPES.map(category => ({
        ...category,
        types: category.types.filter(type =>
            type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            type.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.types.length > 0);

    const getFieldIcon = (iconName: string) => {
        const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
            Type, FileText, Mail, Phone, Hash, Calendar, Clock, ChevronDown,
            CheckSquare, Radio, Upload, PenTool, Star, Sliders, MapPin, Link,
            Lock, EyeOff, Minus, Heading, AlignLeft, Calculator, CreditCard
        };
        return iconMap[iconName] || Type;
    };

    return (
        <div className="w-56 overflow-y-auto h-full  bg-slate-50 border-r border-slate-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Form Builder
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search fields..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 text-black bg-white"
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col w-56">
                <TabsList className="grid w-full   grid-cols-1 h-20 m-4 mb-0">
                    <TabsTrigger value="fields" className="text-xs w-full">
                        <Layers className="h-4 w-4 mr-1" />
                        Fields
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs">
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        Analytics
                    </TabsTrigger>
                </TabsList>

                {/* Fields Tab */}
                <TabsContent value="fields" className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                        {filteredFieldTypes.map((category) => (
                            <div key={category.category} className="space-y-2">
                                <h4 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                                    {category.category}
                                </h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {category.types.map((fieldType) => {
                                        const IconComponent = getFieldIcon(fieldType.icon);
                                        return (
                                            <div
                                                key={fieldType.type}
                                                draggable
                                                onDragStart={() => handleFieldDragStart(fieldType.type)}
                                                onDragEnd={handleFieldDragEnd}
                                                className="group cursor-move p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                        <IconComponent className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {fieldType.label}
                                                        </div>
                                                        <div className="text-xs text-slate-500 truncate">
                                                            {fieldType.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="flex-1 overflow-auto p-4">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Form Settings</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">
                                        Form Title
                                    </label>
                                    <Input
                                        value={state.currentForm?.title || ""}
                                        onChange={(e) => {
                                            if (state.currentForm) {
                                                actions.setCurrentForm({
                                                    ...state.currentForm,
                                                    title: e.target.value
                                                });
                                            }
                                        }}
                                        placeholder="Enter form title"
                                        className="text-sm text-black"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600 mb-1 block">
                                        Description
                                    </label>
                                    <textarea
                                        value={state.currentForm?.description || ""}
                                        onChange={(e) => {
                                            if (state.currentForm) {
                                                actions.setCurrentForm({
                                                    ...state.currentForm,
                                                    description: e.target.value
                                                });
                                            }
                                        }}
                                        placeholder="Enter form description"
                                        className="w-full text-black p-2 text-sm border border-slate-200 rounded-lg resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Submission Settings</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Allow multiple submissions</span>
                                    <input type="checkbox" className="rounded text-black" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Require payment</span>
                                    <input type="checkbox" className="rounded text-black" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Show progress bar</span>
                                    <input type="checkbox" className="rounded text-black" defaultChecked />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-slate-700 mb-3">Security</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Require CAPTCHA</span>
                                    <input type="checkbox" className="rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">Rate limiting</span>
                                    <input type="checkbox" className="rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="flex-1 overflow-auto p-4">
                    <div className="space-y-4">
                        <div className="text-center py-8">
                            <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h4 className="text-sm font-medium text-slate-600 mb-2">
                                Form Analytics
                            </h4>
                            <p className="text-xs text-slate-500">
                                Analytics will appear here once your form is published and starts receiving submissions.
                            </p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
