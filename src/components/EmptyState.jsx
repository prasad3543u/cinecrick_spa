import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Search, 
  Users, 
  MapPin,
  CalendarX
} from "lucide-react";

export function EmptyBookings({ navigate }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-pink-500/20 mb-6">
        <Calendar className="h-10 w-10 text-pink-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No bookings yet</h3>
      <p className="text-white/50 mb-8 max-w-md mx-auto">
        Ready to play? Book your first cricket ground and start your match!
      </p>
      <Button 
        onClick={() => navigate("/grounds")}
        className="bg-gradient-to-r from-pink-500 to-violet-500"
      >
        Browse Grounds
      </Button>
    </div>
  );
}

export function EmptyGrounds({ clearFilters, hasFilters }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/20 mb-6">
        <MapPin className="h-10 w-10 text-violet-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No grounds found</h3>
      {hasFilters ? (
        <>
          <p className="text-white/50 mb-8 max-w-md mx-auto">
            No grounds match your current filters. Try adjusting your search!
          </p>
          <Button 
            onClick={clearFilters}
            className="bg-white/10 text-white hover:bg-white/15"
          >
            Clear Filters
          </Button>
        </>
      ) : (
        <p className="text-white/50">
          Check back later for new grounds!
        </p>
      )}
    </div>
  );
}

export function EmptySearch({ query }) {
  return (
    <div className="text-center py-20 px-4">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/20 mb-6">
        <Search className="h-10 w-10 text-yellow-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
      <p className="text-white/50 mb-2">
        We couldn't find anything matching "{query}"
      </p>
      <p className="text-white/30 text-sm">
        Try different keywords or check your spelling
      </p>
    </div>
  );
}

export function EmptyUsers() {
  return (
    <div className="text-center py-20 px-4">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/20 mb-6">
        <Users className="h-10 w-10 text-cyan-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No users found</h3>
      <p className="text-white/50">
        There are no users matching your search.
      </p>
    </div>
  );
}

export function EmptyAdminToday() {
  return (
    <div className="text-center py-20 px-4">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 mb-6">
        <CalendarX className="h-10 w-10 text-emerald-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No matches today</h3>
      <p className="text-white/50 mb-2">
        Enjoy your day off. No confirmed matches scheduled.
      </p>
      <p className="text-white/30 text-sm">
        Check back tomorrow for new matches.
      </p>
    </div>
  );
}