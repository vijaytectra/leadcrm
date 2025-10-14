import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LeadsTableSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="border-b border-gray-100">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Table Header Skeleton */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-8 gap-4 p-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            
            {/* Table Rows Skeleton */}
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-8 gap-4 p-4">
                  {Array.from({ length: 8 }).map((_, cellIndex) => (
                    <div key={cellIndex} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
