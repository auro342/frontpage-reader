type FeedCardProps = {
  title: string;
  description: string;
  category: string;
  source: string;
  time: string;
  link: string;
  data: any;
  onSave: (article: any) => void;
  isSaved: boolean;
  isUnread?: boolean;
};

// Map sources to colors for their fallback logos
const sourceColors: Record<string, string> = {
  "Smashing Magazine": "bg-[#ef4444]",
  "Cloudflare Blog": "bg-[#f59e0b]",
  "Simon Willison": "bg-[#1f2937]",
  "Josh Comeau": "bg-[#6366f1]",
  "Figma Blog": "bg-[#111827]",
  "web.dev": "bg-[#0ea5e9]",
  "CSS-Tricks": "bg-[#ef4444]",
  "Sidebar.io": "bg-[#8b5cf6]",
};

const categoryTagColors: Record<string, string> = {
  "Design": "bg-[#fce7f3] text-[#db2777]", // pink
  "Frontend": "bg-[#eff6ff] text-[#2563eb]", // blue
  "AI & ML": "bg-[#f3e8ff] text-[#9333ea]", // purple
  "Backend & DevOps": "bg-[#fef3c7] text-[#d97706]", // amber
};

function FeedCard({
  title,
  description,
  category,
  source,
  time,
  link,
  data,
  onSave,
  isSaved,
  isUnread = true,
}: FeedCardProps) {
  const sourceInitials = source
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
    
  const tagColorClass = categoryTagColors[category] || "bg-gray-100 text-gray-600";
  const sourceColorClass = sourceColors[source] || "bg-gray-800";

  return (
    <div className="relative py-4 md:py-6 border-b border-gray-100/80 hover:bg-gray-50/50 transition cursor-pointer group px-0 rounded-lg">
      {isUnread && (
        <div className="absolute -left-4 md:-left-6 top-[22px] md:top-[28px] flex items-center justify-center">
          <div className="w-[6px] h-[6px] bg-[#2563eb] rounded-full shadow-sm"></div>
        </div>
      )}
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1.5">
          <div className={`w-[18px] h-[18px] shrink-0 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${sourceColorClass}`}>
            {sourceInitials.charAt(0)}
          </div>
          <p className="text-[12px] font-medium text-gray-500 truncate">
            <span className="text-gray-600">{source}</span> <span className="text-gray-300 mx-0.5">•</span> {time}
          </p>
        </div>

        <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block" onClick={(e) => e.stopPropagation()}>
          <h3 className="font-bold text-[15px] md:text-[16px] text-gray-900 tracking-tight leading-snug mb-1 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 md:line-clamp-none">
            {title}
          </h3>
        </a>

        <p className="text-[13px] text-gray-500 leading-relaxed max-w-4xl md:pr-8 mt-1 line-clamp-2 md:line-clamp-3">
          {description}
        </p>

        <div className="flex items-center mt-3">
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded ${tagColorClass}`}
          >
            {category}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(data);
            }}
            className={`ml-auto text-[12px] font-medium transition-opacity ${
              isSaved ? "text-blue-600 opacity-100" : "text-gray-400 hover:text-blue-600 opacity-100 sm:opacity-0 group-hover:opacity-100"
            }`}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedCard;