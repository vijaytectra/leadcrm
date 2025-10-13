"use client";

import * as React from "react";
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalCloseButton } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertTriangle,
    Trash2,
    Building2,
    Users,
    TrendingUp,
    DollarSign,
    AlertCircle,
    XCircle,
    CheckCircle
} from "lucide-react";
import { Institution, deleteInstitution } from "@/lib/api/institutions";
import { toast } from "sonner";

interface DeleteInstitutionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    institution: Institution | null;
    onSuccess: () => void;
}

export const DeleteInstitutionDialog: React.FC<DeleteInstitutionDialogProps> = ({
    isOpen,
    onClose,
    institution,
    onSuccess
}) => {
    const [confirmationText, setConfirmationText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [step, setStep] = React.useState<"warning" | "confirm">("warning");

    const institutionName = institution?.name || "";
    const isConfirmationValid = confirmationText === institutionName;

    React.useEffect(() => {
        if (isOpen) {
            setConfirmationText("");
            setStep("warning");
        }
    }, [isOpen]);

    const handleDelete = async () => {
        if (!institution || !isConfirmationValid) return;

        setIsDeleting(true);

        try {
            await deleteInstitution(institution.id);

            toast.success("Institution deleted successfully", {
                description: `${institution.name} and all associated data have been removed`
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting institution:", error);
            toast.error("Failed to delete institution", {
                description: error instanceof Error ? error.message : "Please try again later"
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleNext = () => {
        setStep("confirm");
    };

    const handleBack = () => {
        setStep("warning");
    };

    if (!institution) return null;

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl w-full">
            <ModalHeader>
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center shadow-sm">
                        <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-red-900 via-orange-900 to-red-900 bg-clip-text text-transparent">
                            Delete Institution
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                            {step === "warning" ? "Review the impact of this action" : "Confirm deletion"}
                        </p>
                    </div>
                </div>
                <ModalCloseButton onClose={onClose} />
            </ModalHeader>

            <ModalContent className="w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
                {step === "warning" ? (
                    <div className="space-y-6">
                        {/* Warning */}
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
                                <CardTitle className="flex items-center space-x-3 text-red-800">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <span>Critical Warning</span>
                                </CardTitle>
                                <CardDescription className="text-red-700">
                                    This action cannot be undone and will permanently delete all data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-red-900">Permanent Data Loss</p>
                                            <p className="text-sm text-red-700">
                                                All institution data, user accounts, leads, applications, and payments will be permanently deleted.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-red-900">Cascade Deletion</p>
                                            <p className="text-sm text-red-700">
                                                This will also delete all related records including user accounts, leads, applications, and payment records.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Institution Details */}
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
                                <CardTitle className="flex items-center space-x-3 text-slate-800">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <span>Institution Details</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 text-lg">{institution.name}</h3>
                                        <p className="text-slate-600 text-sm">Slug: {institution.slug}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center space-x-2 text-slate-700">
                                            <Users className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm">
                                                <span className="font-semibold">{formatNumber(institution._count.users)}</span> users
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-slate-700">
                                            <TrendingUp className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm">
                                                <span className="font-semibold">{formatNumber(institution._count.leads)}</span> leads
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-slate-700">
                                            <DollarSign className="h-4 w-4 text-slate-500" />
                                            <span className="text-sm">
                                                <span className="font-semibold">{formatNumber(institution._count.payments)}</span> payments
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                        <div className="flex items-start space-x-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-900">Data Impact Summary</p>
                                                <p className="text-sm text-amber-700 mt-1">
                                                    Deleting this institution will permanently remove all associated users, leads, applications, and payment records. This action cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Confirmation Step */}
                        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
                                <CardTitle className="flex items-center space-x-3 text-red-800">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-red-600" />
                                    </div>
                                    <span>Confirm Deletion</span>
                                </CardTitle>
                                <CardDescription className="text-red-700">
                                    Type the institution name to confirm deletion
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                                        <p className="text-sm text-red-800 font-medium">
                                            To confirm deletion, type the institution name exactly as shown:
                                        </p>
                                        <p className="text-lg font-bold text-red-900 mt-2">{institutionName}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmation" className="text-sm font-semibold text-slate-700">
                                            Institution Name
                                        </Label>
                                        <Input
                                            id="confirmation"
                                            value={confirmationText}
                                            onChange={(e) => setConfirmationText(e.target.value)}
                                            placeholder={`Type "${institutionName}" to confirm`}
                                            className="border-slate-300 focus:border-red-400 focus:ring-red-400/20"
                                        />
                                        {confirmationText && !isConfirmationValid && (
                                            <p className="text-sm text-red-600">Name does not match. Please type exactly: {institutionName}</p>
                                        )}
                                        {isConfirmationValid && (
                                            <p className="text-sm text-green-600 flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                Confirmation matches
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </ModalContent>

            <ModalFooter className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-b-lg">
                <div className="flex items-center space-x-4 w-full justify-between">
                    <div>
                        {step === "confirm" && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                            >
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                        >
                            Cancel
                        </Button>
                        {step === "warning" ? (
                            <Button
                                onClick={handleNext}
                                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                Continue to Confirmation
                            </Button>
                        ) : (
                            <Button
                                onClick={handleDelete}
                                disabled={!isConfirmationValid || isDeleting}
                                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete Institution</span>
                                    </div>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    );
};
