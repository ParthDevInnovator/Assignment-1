import React, { useState, useEffect } from "react";
import { api } from "../api";
import { OwnerDashboardData, ReviewerRecord } from "../types";
import { StarRating } from "../components/StarRating";
import {
  Store,
  Star,
  Users,
  Calendar,
  MapPin,
  Mail,
  ArrowUpDown,
  Search,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "score" | "date">("date");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOwnerDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to load store dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSortToggle = (field: "name" | "score" | "date") => {
    if (sortBy === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 font-medium">Loading store metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Store Information Unavailable
        </h2>
        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
          {error || "No store is currently associated with your account. Please reach out to your administrator."}
        </p>
      </div>
    );
  }

  const query = search.toLowerCase();
  const filteredReviewers = data.reviewers
    .filter(({ user }) =>
      [user.name, user.email, user.address].some((field) => field.toLowerCase().includes(query))
    )
    .sort((a, b) => {
      let diff: number;
      if (sortBy === "name") diff = a.user.name.localeCompare(b.user.name);
      else if (sortBy === "score") diff = a.score - b.score;
      else diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return order === "asc" ? diff : -diff;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Performance Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {data.store.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              {data.store.email}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              {data.store.address}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-100 shrink-0">
          <div className="text-center sm:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Average Rating
            </span>
            <div className="flex items-baseline gap-1 justify-center sm:justify-end">
              <span className="text-4xl font-black text-slate-900">
                {data.stats.averageRating > 0 ? data.stats.averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-slate-400 text-lg font-bold">/ 5.0</span>
            </div>
            <div className="mt-1 flex justify-center sm:justify-end">
              <StarRating rating={data.stats.averageRating} size="md" />
            </div>
            <span className="text-xs text-slate-500 font-medium block mt-1">
              Based on {data.stats.totalRatings} customer {data.stats.totalRatings === 1 ? "rating" : "ratings"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = data.stats.breakdown[star] || 0;
          const percentage =
            data.stats.totalRatings > 0
              ? Math.round((count / data.stats.totalRatings) * 100)
              : 0;

          return (
            <div
              key={star}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs text-center"
            >
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
                <span>{star}</span>
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
              <div className="text-xl font-black text-slate-800 mt-1">
                {count}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-1.5 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {percentage}% of reviews
              </span>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <span>Customer Ratings & Reviewers</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              List of all users who submitted feedback for {data.store.name}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviewer name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSortToggle("name")}
                  className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-6 py-3.5">
                  <span>Customer Email</span>
                </th>
                <th className="px-6 py-3.5">
                  <span>Address</span>
                </th>
                <th
                  onClick={() => handleSortToggle("score")}
                  className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Rating Given</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle("date")}
                  className="px-6 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReviewers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <span>No customer reviews found.</span>
                  </td>
                </tr>
              ) : (
                filteredReviewers.map((rev) => (
                  <tr key={rev.ratingId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {rev.user.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {rev.user.email}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={rev.user.address}>
                      {rev.user.address}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-600 text-sm">
                          {rev.score} / 5
                        </span>
                        <StarRating rating={rev.score} size="sm" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
