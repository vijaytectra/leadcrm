"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    FileText,
    CheckCircle,
    Clock,
    History,
    Settings,
    BarChart3,
    Upload,
    Eye,
    CheckSquare,
} from "lucide-react";

const navigation = [
    {
        name: "Dashboard",
        href: "/document-verifier/dashboard",
        icon: BarChart3,
    },
    {
        name: "Document Queue",
        href: "/document-verifier/queue",
        icon: Clock,
    },
    {
        name: "Verify Documents",
        href: "/document-verifier/verify",
        icon: Eye,
    },
    {
        name: "Verification History",
        href: "/document-verifier/history",
        icon: History,
    },
    {
        name: "Document Types",
        href: "/document-verifier/settings",
        icon: Settings,
    },
];

export function DocumentVerifierSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tenant = searchParams.get("tenant");

    return (
        <div className="hidden md:flex md:w-64 md:flex-col">
            <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
                <div className="flex flex-col flex-grow">
                    <div className="flex items-center flex-shrink-0 px-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-blue-600" />
                            <span className="ml-2 text-xl font-semibold text-gray-900">
                                Document Verifier
                            </span>
                        </div>
                    </div>
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={`${item.href}?tenant=${tenant}`}
                                    className={cn(
                                        isActive
                                            ? "bg-blue-50 border-blue-500 text-blue-700"
                                            : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-colors"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            isActive
                                                ? "text-blue-500"
                                                : "text-gray-400 group-hover:text-gray-500",
                                            "mr-3 flex-shrink-0 h-5 w-5"
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}
