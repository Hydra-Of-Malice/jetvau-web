import Link from "next/link";
import { Clock, IndianRupee, CheckCircle, ArrowRight, Plane } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { resolveApiUrl } from "@/lib/api";

interface CourseCardProps {
    slug: string;
    title: string;
    category: string;
    duration: string;
    price: string;
    originalPrice?: string;
    image: string;
    features: string[];
    isEnrolled?: boolean;
}

export function CourseCard({ slug, title, category, duration, price, originalPrice, image, features, isEnrolled }: CourseCardProps) {
    return (
        <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
            {/* Image Container */}
            <div className="relative h-48 bg-slate-200 overflow-hidden">
                {image ? (
                    // Course images are served by the API, which next/image isn't configured for
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveApiUrl(image)} alt={title} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-500" aria-hidden="true">
                        <Plane size={40} />
                    </div>
                )}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 w-fit text-xs font-semibold bg-white/90 text-primary rounded-full shadow-sm">
                        {category}
                    </span>
                    {isEnrolled && (
                        <span className="px-3 py-1 w-fit text-xs font-semibold bg-green-600 text-white rounded-full shadow-sm flex items-center gap-1.5">
                            <CheckCircle size={14} aria-hidden="true" />
                            Enrolled
                        </span>
                    )}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-secondary transition-colors">
                    {title}
                </h3>

                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                        <Clock size={16} aria-hidden="true" />
                        <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold">
                        <IndianRupee size={16} className="text-primary" aria-hidden="true" />
                        <span className="text-primary">{price}</span>
                        {originalPrice && (
                            <span className="text-slate-400 line-through text-xs font-normal">{originalPrice}</span>
                        )}
                    </div>
                </div>

                <ul className="space-y-2 mb-6 flex-grow">
                    {features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle size={16} className="text-secondary shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{feat}</span>
                        </li>
                    ))}
                </ul>

                <Button className="w-full gap-2 group-hover:bg-secondary" asChild>
                    <Link href={`/courses/${slug}`} aria-label={`View details for ${title}`}>
                        View details <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
