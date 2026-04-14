import FeedCard from "../components/FeedCard";
import { useState, useEffect } from "react";
import { Search, Plus, Bookmark, CheckCircle2, LayoutList, LayoutGrid, ListFilter, RefreshCw, Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
// List of real feeds we'll fetch
const RSS_FEEDS = [
  { source: "Smashing Magazine", category: "Design", url: "https://www.smashingmagazine.com/feed/" },
  { source: "CSS-Tricks", category: "CSS-Tricks", url: "https://css-tricks.com/feed/" },
  { source: "Cloudflare Blog", category: "Backend & DevOps", url: "https://blog.cloudflare.com/rss/" },
  { source: "web.dev", category: "Frontend", url: "https://web.dev/feed.xml" },
  { source: "Simon Willison", category: "AI & ML", url: "https://simonwillison.net/atom/entries/" }
];

const CATEGORY_COLORS = [
  { name: "Frontend", color: "bg-[#3b82f6]" },
  { name: "CSS-Tricks", color: "bg-[#ef4444]" },
  { name: "Smashing Magazine", color: "bg-[#ef4444]" },
  { name: "Josh Comeau", color: "bg-[#8b5cf6]" },
  { name: "Kent C. Dodds", color: "bg-[#3b82f6]" },
  { name: "web.dev", color: "bg-[#0ea5e9]" },
  { name: "Design", color: "bg-[#ec4899]" },
  { name: "Sidebar.io", color: "bg-[#8b5cf6]" },
  { name: "NN Group", color: "bg-[#10b981]" },
  { name: "Figma Blog", color: "bg-[#1f2937]" },
  { name: "UX Collective", color: "bg-[#3b82f6]" },
  { name: "Backend & DevOps", color: "bg-[#f59e0b]" },
  { name: "General Tech", color: "bg-[#6366f1]" },
  { name: "AI & ML", color: "bg-[#8b5cf6]" },
];

function Home() {
  const [saved, setSaved] = useState<any[]>([]);
  const [view, setView] = useState("All"); // Can be 'All', 'Saved', or a category name
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load saved articles from local storage on mount
  useEffect(() => {
    const data = localStorage.getItem("savedArticles");
    if (data) setSaved(JSON.parse(data));
  }, []);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const fetchPromises = RSS_FEEDS.map(async (feed) => {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        
        return data.items.slice(0, 10).map((item: any, index: number) => {
          // compute a relative time text
          const pubDate = new Date(item.pubDate);
          const now = new Date();
          const hoursDiff = Math.abs(now.getTime() - pubDate.getTime()) / 36e5;
          let timeStr = "";
          if (hoursDiff < 1) {
             const minDiff = Math.floor(hoursDiff * 60);
             timeStr = `${minDiff || 1}m ago`;
          } else if (hoursDiff < 24) {
            timeStr = `${Math.floor(hoursDiff)}h ago`;
          } else {
            timeStr = `${Math.floor(hoursDiff / 24)}d ago`;
          }

          // simple description cleaner (strip html tags)
          let plainDescription = item.description.replace(/<[^>]+>/g, '').trim();
          // unescape common HTML entities
          plainDescription = plainDescription.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#8217;/g, "'").replace(/&amp;/g, '&');
          if (plainDescription.length > 200) {
              plainDescription = plainDescription.substring(0, 200) + '...';
          }

          return {
            id: `${feed.source}-${index}-${item.guid || item.title}`,
            title: item.title,
            description: plainDescription,
            category: feed.category,
            source: feed.source,
            time: timeStr,
            link: item.link,
            rawDate: pubDate.getTime()
          };
        });
      });

      const results = await Promise.allSettled(fetchPromises);
      const validResults = results
          .filter((r) => r.status === "fulfilled")
          .map((r: any) => r.value)
          .flat();

      validResults.sort((a, b) => b.rawDate - a.rawDate);
      setArticles(validResults);
    } catch (error) {
      console.error("Error fetching feeds", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch articles on mount
  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleSave = (article: any) => {
    setSaved((prev) => {
      const exists = prev.find((i) => i.id === article.id);
      let updated;
      if (exists) {
        updated = prev.filter((i) => i.id !== article.id);
      } else {
        updated = [...prev, article];
      }
      localStorage.setItem("savedArticles", JSON.stringify(updated));
      return updated;
    });
  };

  // Setup filtering mechanism based on view and search string
  let baseData = articles;
  if (view === "Saved") {
    baseData = saved;
  } else if (view !== "All") {
    baseData = articles.filter(a => a.category === view || a.source === view);
  }

  const filteredArticles = baseData.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* NAVBAR */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-6 h-6 bg-[#3b82f6] rounded flex items-center justify-center relative shadow-sm">
              <div className="w-[10px] h-[10px] bg-white rounded-sm absolute left-[3px] top-[3px]"></div>
              <div className="w-[10px] h-[10px] border-2 border-white bg-[#3b82f6] rounded-sm absolute left-[9px] top-[9px]"></div>
            </div>
            <h1 className="font-bold text-[16px] tracking-tight">Frontpage</h1>
          </div>

          <div className="flex gap-6 text-[14px] ml-10">
            <span className="font-semibold text-gray-900 cursor-pointer">
              Feed
            </span>
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer font-medium">Digest</span>
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer font-medium">Discover</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-300 absolute left-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-gray-200 rounded-md pl-9 pr-8 py-1.5 text-[13px] w-64 outline-none placeholder:text-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all font-medium"
              placeholder="Search articles..."
            />
            <div className="absolute right-2 flex items-center">
              <span className="text-[10px] px-1.5 py-[1px] border border-gray-200 text-gray-400 rounded">/</span>
            </div>
          </div>

          <button className="w-8 h-8 flex items-center justify-center text-gray-400 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors ml-1">
            <Plus className="w-4 h-4" />
          </button>

          <div className="relative group flex items-center">
            <div className="w-8 h-8 bg-[#6366f1] text-white flex items-center justify-center rounded-full text-[13px] font-semibold ml-2 cursor-pointer ring-2 ring-white shadow-sm">
              {localStorage.getItem("user")?.charAt(0).toUpperCase() || "Guest".charAt(0)}
            </div>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-1.5 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top-right scale-95 group-hover:scale-100">
              <div className="px-4 py-2 border-b border-gray-100 mb-1 leading-tight">
                <p className="text-[12px] text-gray-500">Signed in as</p>
                <p className="text-[14px] font-bold text-gray-900 truncate">
                  {localStorage.getItem("user") || "Guest"}
                </p>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-64 bg-white border-r border-gray-100 px-4 py-6 overflow-y-auto text-sm shrink-0 flex flex-col justify-between">
          <div>
            <div className="space-y-0.5">
              <div
                onClick={() => setView("All")}
                className={`flex justify-between items-center px-3 py-2.5 rounded-md cursor-pointer transition ${
                  view === "All"
                    ? "bg-[#f0f6ff] text-[#2563eb]"
                    : "hover:bg-gray-50 text-gray-600 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  <span className={view === "All" ? "font-semibold" : ""}>All Items</span>
                </div>
                <span className={`text-[12px] ${view === "All" ? "text-[#3b82f6] font-semibold" : "text-[#3b82f6] font-semibold"}`}>
                  {loading ? '...' : articles.length}
                </span>
              </div>

              <div
                onClick={() => setView("Saved")}
                className={`flex justify-between items-center px-3 py-2.5 rounded-md cursor-pointer transition ${
                  view === "Saved"
                    ? "bg-[#f0f6ff] text-[#2563eb]"
                    : "hover:bg-gray-50 text-gray-600 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4 flex-shrink-0" />
                  <span className={view === "Saved" ? "font-semibold" : ""}>Saved</span>
                </div>
                <span className="text-gray-400 text-[12px]">{saved.length}</span>
              </div>
            </div>

            <h3 className="mt-8 mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3">
              Categories
            </h3>

            <div className="space-y-0.5">
              {CATEGORY_COLORS.map((cat) => {
                // Calculate real counts for functional feeds
                const count = articles.filter(a => a.category === cat.name || a.source === cat.name).length;
                if (count === 0 && !loading) return null; // Hide categories with 0 items for cleanliness

                return (
                  <div
                    key={cat.name}
                    onClick={() => setView(cat.name)}
                    className={`flex justify-between items-center px-3 py-1.5 rounded-md cursor-pointer group transition ${
                      view === cat.name ? "bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-gray-600 text-[13px]">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                      <span className={`group-hover:text-gray-900 ${view === cat.name ? 'font-semibold text-gray-900' : ''}`}>{cat.name}</span>
                    </div>
                    <span className="text-gray-400 text-[12px]">{count || "-"}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 px-3 flex items-center gap-2 text-[12px] text-green-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            All feeds healthy
          </div>
        </div>

        {/* FEED */}
        <div className="flex-1 overflow-y-auto flex bg-white border-l border-gray-100 shadow-[inset_1px_0_0_rgba(0,0,0,0.02)]">
          <div className="flex-1 max-w-[950px]">
            <div className="px-10 py-8">
              <div className="flex justify-between items-end mb-6">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
                    {view === "All" ? "All Items" : view === "Saved" ? "Saved Articles" : view}
                  </h2>
                  <span className="text-gray-400 text-[13px] font-medium tracking-wide">
                     {loading ? 'loading' : filteredArticles.length + ' items'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-md bg-white shadow-sm overflow-hidden">
                    <button className="p-1.5 text-gray-700 bg-gray-50 border-r border-gray-200">
                      <LayoutList className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 border-r border-gray-200 hover:bg-gray-50 transition">
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                  </div>

                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-[12px] font-medium text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition">
                    <ListFilter className="w-3.5 h-3.5" />
                    Newest
                  </button>
                  <button 
                    onClick={fetchFeeds}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-[12px] font-medium text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button className="px-3 py-1.5 border border-gray-200 rounded-md text-[12px] font-medium text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition">
                    Mark all read
                  </button>
                </div>
              </div>

              {!loading && (
                <div className="bg-[#f0f6ff] text-[#2563eb] text-[13px] font-medium px-4 py-2.5 rounded-md mb-8 flex justify-center border border-[#e0efff] shadow-sm tracking-wide">
                  ↑ You're caught up. All feeds are fresh!
                </div>
              )}

              <div className="border-b border-gray-100 pb-2 mb-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">LATEST</p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="font-medium text-[13px]">Fetching latest feeds...</p>
                </div>
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((item) => (
                  <FeedCard
                    key={item.id}
                    {...item}
                    data={item}
                    onSave={handleSave}
                    isSaved={saved.some((i) => i.id === item.id)}
                  />
                ))
              ) : (
                <div className="py-20 text-center text-gray-500 font-medium text-[14px]">
                  No items found.
                </div>
              )}
            </div>
          </div>
          <div className="hidden xl:block xl:flex-1 bg-white"></div>
        </div>
      </div>
    </div>
  );
}

export default Home;