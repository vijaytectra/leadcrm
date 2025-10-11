"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface DocumentType {
    name: string;
    category: string;
    description?: string;
}

interface VerificationChecklistProps {
    documentType: DocumentType;
}

interface ChecklistItem {
    id: string;
    title: string;
    description?: string;
    isRequired: boolean;
    isChecked: boolean;
}

export function VerificationChecklist({ documentType }: VerificationChecklistProps) {
    // Mock checklist data - in real implementation, this would come from the API
    const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
        {
            id: "1",
            title: "Document is clear and readable",
            description: "All text and images are clearly visible",
            isRequired: true,
            isChecked: false,
        },
        {
            id: "2",
            title: "Document is not expired",
            description: "Check expiration date if applicable",
            isRequired: true,
            isChecked: false,
        },
        {
            id: "3",
            title: "Document matches student information",
            description: "Name and details match application",
            isRequired: true,
            isChecked: false,
        },
        {
            id: "4",
            title: "Document is properly formatted",
            description: "File format and quality are acceptable",
            isRequired: false,
            isChecked: false,
        },
    ]);

    const handleCheckboxChange = (itemId: string, checked: boolean) => {
        setChecklistItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, isChecked: checked } : item
            )
        );
    };

    const requiredItems = checklistItems.filter(item => item.isRequired);
    const checkedRequiredItems = requiredItems.filter(item => item.isChecked);
    const allRequiredChecked = requiredItems.length === checkedRequiredItems.length;
    const totalChecked = checklistItems.filter(item => item.isChecked).length;

    const getCompletionStatus = () => {
        if (allRequiredChecked) {
            return {
                status: "complete",
                icon: <CheckCircle className="h-4 w-4 text-green-500" />,
                text: "All requirements met",
                color: "text-green-600"
            };
        } else if (checkedRequiredItems.length > 0) {
            return {
                status: "partial",
                icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
                text: "Some requirements missing",
                color: "text-yellow-600"
            };
        } else {
            return {
                status: "incomplete",
                icon: <XCircle className="h-4 w-4 text-red-500" />,
                text: "Requirements not met",
                color: "text-red-600"
            };
        }
    };

    const completionStatus = getCompletionStatus();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Verification Checklist
                </CardTitle>
                <CardDescription>
                    Review document against verification requirements
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Completion Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        {completionStatus.icon}
                        <span className={`text-sm font-medium ${completionStatus.color}`}>
                            {completionStatus.text}
                        </span>
                    </div>
                    <Badge variant="outline">
                        {totalChecked}/{checklistItems.length}
                    </Badge>
                </div>

                {/* Checklist Items */}
                <div className="space-y-3">
                    {checklistItems.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                            <Checkbox
                                id={item.id}
                                checked={item.isChecked}
                                onCheckedChange={(checked) =>
                                    handleCheckboxChange(item.id, checked as boolean)
                                }
                                className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                                <label
                                    htmlFor={item.id}
                                    className="text-sm font-medium text-gray-900 cursor-pointer"
                                >
                                    {item.title}
                                    {item.isRequired && (
                                        <span className="text-red-500 ml-1">*</span>
                                    )}
                                </label>
                                {item.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {item.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Summary */}
                <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Required items completed:</span>
                        <span className="font-medium">
                            {checkedRequiredItems.length}/{requiredItems.length}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${(checkedRequiredItems.length / requiredItems.length) * 100}%`
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
