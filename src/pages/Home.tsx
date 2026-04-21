import FeedCard from "../components/FeedCard";
import { useState, useEffect } from "react";
import { Search, Plus, Bookmark, CheckCircle2, LayoutList, LayoutGrid, ListFilter, RefreshCw, Loader2, LogOut, Menu, X, AlignJustify, Layers } from "lucide-react";
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
  const [view, setView] = useState("All"); 
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

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

          let plainDescription = item.description.replace(/<[^>]+>/g, '').trim();
          plainDescription = plainDescription.replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#8217;/g, "'").replace(/&amp;/g, '&');
          if (plainDescription.length > 150) {
              plainDescription = plainDescription.substring(0, 150) + '...';
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
    <div className="h-[100dvh] flex flex-col bg-white text-gray-900 font-sans">
      {/* NAVBAR */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 relative bg-white">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            className="md:hidden p-1 text-gray-500 hover:text-gray-900 focus:outline-none"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-6 h-6 bg-[#2563eb] rounded flex items-center justify-center relative shadow-sm shrink-0">
              <div className="w-[10px] h-[10px] bg-white rounded-sm absolute left-[4px] top-[4px]"></div>
              <div className="w-[10px] h-[10px] border-2 border-white bg-[#2563eb] rounded-sm absolute left-[8px] top-[8px]"></div>
            </div>
            <h1 className="font-bold text-[16px] tracking-tight">Frontpage</h1>
          </div>

          <div className="hidden lg:flex gap-6 text-[14px] ml-10">
            <span className="font-semibold text-gray-900 cursor-pointer">Feed</span>
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer font-medium">Digest</span>
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer font-medium">Discover</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* SEARCH DESKTOP */}
          <div className="relative hidden md:flex items-center">
            <Search className="w-3.5 h-3.5 text-gray-300 absolute left-3" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-gray-200 rounded-md pl-9 pr-8 py-1.5 text-[13px] w-48 lg:w-64 outline-none placeholder:text-gray-300 focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all font-medium"
              placeholder="Search articles..."
            />
            <div className="absolute right-2 flex items-center">
              <span className="text-[10px] px-1.5 py-[1px] border border-gray-200 bg-gray-50 text-gray-400 rounded font-sans leading-relaxed">/</span>
            </div>
          </div>

          {/* SEARCH MOBILE TOGGLE & INPUT OVERLAY */}
          <button 
             onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
             className="md:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md focus:outline-none"
          >
             <Search className="w-4 h-4" />
          </button>
          
          {isMobileSearchOpen && (
             <div className="absolute top-14 left-0 right-0 p-3 bg-white border-b border-gray-100 z-50 md:hidden flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2">
                 <div className="relative flex-1">
                     <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                     <input
                         autoFocus
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                         className="w-full bg-gray-50 border border-gray-200 rounded-md pl-9 pr-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                         placeholder="Search articles..."
                     />
                 </div>
                 <button onClick={() => { setIsMobileSearchOpen(false); setSearch(""); }} className="text-[12px] font-medium text-gray-500 hover:text-gray-900 px-2 py-2">
                     Cancel
                 </button>
             </div>
          )}

          <button className="hidden md:flex w-8 h-8 items-center justify-center text-gray-400 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors ml-1">
            <Plus className="w-4 h-4" />
          </button>

          {/* AVATAR & DROPDOWN */}
          <div className="relative group flex items-center">
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 bg-[#6366f1] text-white flex items-center justify-center rounded-full text-[13px] font-semibold ml-1 cursor-pointer ring-2 ring-white shadow-sm shrink-0 select-none"
            >
              {localStorage.getItem("user")?.charAt(0).toUpperCase() || "G"}
            </div>
            
            {isProfileOpen && (
               <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsProfileOpen(false)}></div>
            )}

            <div className={`absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-1.5 border border-gray-100 z-50 transform origin-top-right transition-all duration-200 ${isProfileOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95 md:group-hover:opacity-100 md:group-hover:visible md:group-hover:scale-100'}`}>
              <div className="px-4 py-3 border-b border-gray-100 mb-1 leading-tight">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 mb-1">Signed in as</p>
                <p className="text-[14px] font-bold text-gray-900 truncate">
                  {localStorage.getItem("user") || "Guest"}
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  localStorage.removeItem("user");
                  navigate("/login");
                }}
                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden relative">
      
        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <div className={`
          absolute z-40 top-0 left-0 h-full w-[260px] bg-white border-r border-gray-100 px-4 py-5 overflow-y-auto text-sm shrink-0 flex flex-col justify-between
          transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          md:relative md:translate-x-0 md:shadow-none
        `}>
          <div>
            <div className="flex items-center justify-between md:hidden mb-4 px-2 text-gray-500">
                <span className="font-semibold text-gray-900 text-xs tracking-wider uppercase">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-md">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-0.5">
              <div
                onClick={() => { setView("All"); setSidebarOpen(false); }}
                className={`flex justify-between items-center px-3 py-2 rounded-md cursor-pointer transition mb-1 ${
                  view === "All"
                    ? "bg-[#f0f6ff] text-[#2563eb]"
                    : "hover:bg-gray-50 text-gray-600 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className={`w-4 h-4 flex-shrink-0 ${view === "All" ? "text-[#2563eb]" : "text-gray-400"}`} />
                  <span className={view === "All" ? "font-bold text-[#1d4ed8]" : "font-semibold text-gray-900"}>All Items</span>
                </div>
                <span className={`text-[12px] ${view === "All" ? "text-[#2563eb] font-semibold" : "text-[#2563eb] font-semibold"}`}>
                  {loading ? '...' : articles.length}
                </span>
              </div>

              <div
                onClick={() => { setView("Saved"); setSidebarOpen(false); }}
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
                const count = articles.filter(a => a.category === cat.name || a.source === cat.name).length;
                if (count === 0 && !loading) return null;

                return (
                  <div
                    key={cat.name}
                    onClick={() => { setView(cat.name); setSidebarOpen(false); }}
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
        <div className="flex-1 overflow-y-auto flex flex-col bg-white border-l border-gray-100 shadow-[inset_1px_0_0_rgba(0,0,0,0.02)] w-full">
          
          {/* HEADER AREA (Full Width Borders) */}
          <div className="w-full">
            <div className="w-full max-w-[1000px] px-5 sm:px-8 md:px-12 pt-6 md:pt-8 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-baseline gap-3">
                <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
                  {view === "All" ? "All Items" : view === "Saved" ? "Saved Articles" : view}
                </h2>
                <span className="text-gray-400 text-[13px] font-medium tracking-wide">
                   {loading ? 'loading...' : filteredArticles.length + ' unread'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-3 empty:hidden">
                <div className="hidden sm:flex items-center border border-gray-200 rounded-md bg-white shadow-sm overflow-hidden text-gray-500">
                  <button className="p-1 px-[8px] text-gray-700 bg-gray-100 border-r border-gray-200">
                    <Menu className="w-[15px] h-[15px]" />
                  </button>
                  <button className="p-1 px-[8px] text-gray-400 hover:text-gray-600 border-r border-gray-200 hover:bg-gray-50 transition">
                    <LayoutGrid className="w-[15px] h-[15px]" />
                  </button>
                  <button className="p-1 px-[8px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition">
                    <AlignJustify className="w-[15px] h-[15px]" />
                  </button>
                </div>

                <button className="hidden sm:flex items-center gap-1.5 px-3 py-[5px] border border-gray-200 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition">
                  <ListFilter className="w-3.5 h-3.5 text-gray-500" />
                  Newest
                </button>
                
                <button 
                  onClick={fetchFeeds}
                  disabled={loading}
                  className="flex-1 sm:flex-none justify-center items-center gap-1.5 px-3 py-[5px] border border-gray-200 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                <button className="hidden sm:flex items-center gap-1.5 px-3 py-[5px] border border-gray-200 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-50 bg-white shadow-sm transition">
                  Mark all read
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-gray-100"></div>

            {!loading && (
              <>
                <div className="w-full bg-[#f0f6ff] text-[#2563eb] text-[13px] font-medium py-2 flex justify-center tracking-wide">
                  ↑ 5 new items since your last visit
                </div>
                <div className="w-full h-px bg-[#e0efff]"></div>
              </>
            )}
          </div>

          {/* CONTENT AREA */}
          <div className="w-full max-w-[1000px] flex-1 px-5 sm:px-8 md:px-12 pt-6 pb-20">
            <div className="pb-2 mb-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">TODAY</p>
            </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="font-medium text-[13px]">Fetching latest feeds...</p>
                </div>
              ) : filteredArticles.length > 0 ? (
                filteredArticles.map((item, index) => (
                  <FeedCard
                    key={item.id}
                    {...item}
                    data={item}
                    onSave={handleSave}
                    isSaved={saved.some((i) => i.id === item.id)}
                    isUnread={index < 5}
                  />
                ))
              ) : (
                <div className="py-20 text-center text-gray-500 font-medium text-[14px]">
                  No items found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

export default Home;