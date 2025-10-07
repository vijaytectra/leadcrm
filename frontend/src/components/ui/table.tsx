import * as React from "react";
import { cn } from "@/lib/utils";

interface TableProps {
    children: React.ReactNode;
    className?: string;
}

interface TableHeaderProps {
    children: React.ReactNode;
    className?: string;
}

interface TableBodyProps {
    children: React.ReactNode;
    className?: string;
}

interface TableRowProps {
    children: React.ReactNode;
    className?: string;
}

interface TableHeadProps {
    children: React.ReactNode;
    className?: string;
}

interface TableCellProps {
    children: React.ReactNode;
    className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
    return (
        <div className="relative w-full overflow-auto">
            <table className={cn("w-full caption-bottom text-sm", className)}>
                {children}
            </table>
        </div>
    );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
    return (
        <thead className={cn("[&_tr]:border-b", className)}>
            {children}
        </thead>
    );
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
    return (
        <tbody className={cn("[&_tr:last-child]:border-0", className)}>
            {children}
        </tbody>
    );
};

export const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
    return (
        <tr className={cn(
            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
            className
        )}>
            {children}
        </tr>
    );
};

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => {
    return (
        <th className={cn(
            "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
            className
        )}>
            {children}
        </th>
    );
};

export const TableCell: React.FC<TableCellProps> = ({ children, className }) => {
    return (
        <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}>
            {children}
        </td>
    );
};
