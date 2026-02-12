export default function DashboardLoading() {
    return (
        <div className="p-8 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-3">
                    <div className="h-8 w-48 bg-white/5 rounded-xl" />
                    <div className="h-4 w-32 bg-white/5 rounded-lg" />
                </div>
                <div className="h-12 w-32 bg-white/5 rounded-xl" />
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-white/5 rounded-[2rem] border border-white/5" />
                ))}
            </div>

            <div className="h-96 bg-white/5 rounded-[2rem] border border-white/5" />
        </div>
    );
}
