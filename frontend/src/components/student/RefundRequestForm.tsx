"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, DollarSign } from "lucide-react";

export function RefundRequestForm() {
    const [formData, setFormData] = useState({
        paymentId: "",
        amount: "",
        reason: "",
        studentName: "",
        studentEmail: "",
        studentPhone: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // API call to create refund request
            ("Creating refund request:", formData);
            // await financeApi.createRefundRequest(tenant, formData);

            // Reset form
            setFormData({
                paymentId: "",
                amount: "",
                reason: "",
                studentName: "",
                studentEmail: "",
                studentPhone: "",
            });

            alert("Refund request submitted successfully!");
        } catch (error) {
            alert("Failed to submit refund request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Request Refund
                </CardTitle>
                <CardDescription>
                    Submit a refund request for a payment
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="paymentId">Payment Reference *</Label>
                            <Select
                                value={formData.paymentId}
                                onValueChange={(value) => handleInputChange("paymentId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="payment-1">Payment #txn_123456789 - $2,500</SelectItem>
                                    <SelectItem value="payment-2">Payment #txn_987654321 - $1,500</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Refund Amount *</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => handleInputChange("amount", e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Refund *</Label>
                        <Select
                            value={formData.reason}
                            onValueChange={(value) => handleInputChange("reason", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="duplicate">Duplicate payment</SelectItem>
                                <SelectItem value="cancelled">Application cancelled</SelectItem>
                                <SelectItem value="overpaid">Overpayment</SelectItem>
                                <SelectItem value="error">Payment error</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="studentName">Your Name *</Label>
                        <Input
                            id="studentName"
                            placeholder="Enter your full name"
                            value={formData.studentName}
                            onChange={(e) => handleInputChange("studentName", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="studentEmail">Email Address *</Label>
                        <Input
                            id="studentEmail"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.studentEmail}
                            onChange={(e) => handleInputChange("studentEmail", e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="studentPhone">Phone Number</Label>
                        <Input
                            id="studentPhone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.studentPhone}
                            onChange={(e) => handleInputChange("studentPhone", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="additionalInfo">Additional Information</Label>
                        <Textarea
                            id="additionalInfo"
                            placeholder="Provide any additional details about your refund request..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Refund Request"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
