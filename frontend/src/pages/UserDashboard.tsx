import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Store } from "../types";
import { StarRating } from "../components/StarRating";
import {
  Search,
  Store as StoreIcon,
  Star,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowUpDown,
  ThumbsUp,
} from "lucide-react";

export const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedScore, setSelectedScore] = useState<number>(5);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingSuccess, setRatingSuccess] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.getStores({
        search,
        sortBy,
        order,
      });
      setStores(res.stores);
    } catch (err) {
      console.error("Failed to load stores", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, order]);

  const handleOpenRatingModal = (store: Store) => {
    setSelectedStore(store);
    setSelectedScore(store.userRating || 5);
    setRatingError(null);
    setRatingSuccess(null);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore) return;

    try {
      setRatingLoading(true);
      setRatingError(null);

      const res = await api.submitRating({
        storeId: selectedStore.id,
        score: selectedScore,
      });

      setRatingSuccess("Rating saved successfully!");

      // update the card in place instead of refetching the whole list
      setStores((prev) =>
        prev.map((s) => {
          if (s.id === selectedStore.id) {
            return {
              ...s,
              userRating: selectedScore,
              averageRating: res.storeStats.averageRating,
              totalRatings: res.storeStats.totalRatings,
            };
          }
          return s;
        })
      );

      setTimeout(() => {
        setSelectedStore(null);
        setRatingSuccess(null);
      }, 1200);
    } catch (err: any) {
      setRatingError(err.message || "Failed to submit rating.");
    } finally {
      setRatingLoading(false);
    }
  };

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-600 p-8 sm:p-10 text-white shadow-xl shadow-brand-700/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Community Store Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Discover & Rate Registered Stores
          </h1>
          <p className="mt-2 text-brand-100 text-sm sm:text-base leading-relaxed">
            Search local stores by name or address, check out community ratings, and submit or modify your personal reviews from 1 to 5 stars.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <StoreIcon className="w-80 h-80 text-white" />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stores by store name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Sort by:
          </span>
          <button
            onClick={() => handleSortToggle("name")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              sortBy === "name"
                ? "bg-brand-50 border-brand-200 text-brand-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Name</span>
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleSortToggle("rating")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              sortBy === "rating"
                ? "bg-brand-50 border-brand-200 text-brand-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Rating</span>
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleSortToggle("address")}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              sortBy === "address"
                ? "bg-brand-50 border-brand-200 text-brand-700"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Address</span>
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
          <p className="text-slate-400 font-medium">Loading registered stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-6">
          <StoreIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No stores found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const hasUserRated = store.userRating !== null && store.userRating !== undefined;

            return (
              <div
                key={store.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                      <StoreIcon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <StarRating rating={store.averageRating} size="sm" showValue />
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {store.totalRatings} {store.totalRatings === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {store.name}
                  </h3>

                  <div className="flex items-start gap-2 mt-2 text-slate-500 text-xs">
                    <MapPin className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                    <span className="line-clamp-2">{store.address}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Your Rating
                    </span>
                    {hasUserRated ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                          <span>{store.userRating} / 5</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not rated yet</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenRatingModal(store)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                      hasUserRated
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        : "bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{hasUserRated ? "Modify Rating" : "Rate Store"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3>{selectedStore.userRating ? "Modify Your Rating" : "Submit Store Rating"}</h3>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="p-6 space-y-5 text-center">
              {ratingError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5 text-left">
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                  <span>{ratingError}</span>
                </div>
              )}

              {ratingSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2.5 justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{ratingSuccess}</span>
                </div>
              )}

              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  {selectedStore.name}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedStore.address}
                </p>
              </div>

              <div className="py-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Select rating (1 to 5 Stars)
                </p>
                <div className="flex justify-center">
                  <StarRating
                    rating={selectedScore}
                    interactive={true}
                    onRatingChange={(score) => setSelectedScore(score)}
                    size="lg"
                  />
                </div>
                <div className="mt-2 text-base font-extrabold text-amber-500">
                  {selectedScore} / 5 Stars
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStore(null)}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ratingLoading}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-600/20 disabled:opacity-50"
                >
                  {ratingLoading ? "Submitting..." : "Confirm Rating"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
