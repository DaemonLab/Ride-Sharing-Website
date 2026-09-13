import { Clock, MapPin, Mail, Calendar, Car, MessageCircle, Check, X, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useProfile } from "../hooks/useProfile";
import { useRides } from "../hooks/useRides";
import { useAuth } from "../hooks/useAuth";
import { cancelUserRide, leaveUserRide } from "../services/rideService";
import { Link, useNavigate } from "react-router-dom";
import { useRideRequests } from "../hooks/useRideRequests";
import { HandleRequestPayload, RideRequest, Ride, User as UserType } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../components/ConfirmModal";

/**
 * Parse student details & graduation class year from IIT Indore email (@iiti.ac.in).
 * Uses starting prefix of the email (before '@') directly instead of mapping branch names.
 */
function getStudentDetails(email?: string) {
  if (!email) {
    return { isIitiStudent: false, branch: "", classYear: "", institution: "" };
  }
  const cleanEmail = email.toLowerCase();
  const isStudent = cleanEmail.endsWith("@iiti.ac.in");

  if (!isStudent) {
    return { isIitiStudent: false, branch: "", classYear: "", institution: "" };
  }

  const username = email.split("@")[0];

  // Extract starting letter prefix only (e.g. "ce" from "ce25004042" -> "CE")
  const letterMatch = username.match(/^([a-zA-Z]+)/);
  const branch = letterMatch ? letterMatch[1].toUpperCase() : username.toUpperCase();

  // Try extracting 2-digit entry year (e.g. ce25004042 or 2021101001)
  const digitsMatch = username.match(/\d{2}/);
  let classYear = "Student";
  if (digitsMatch) {
    const entryYear = parseInt(digitsMatch[0], 10);
    if (entryYear >= 15 && entryYear <= 35) {
      classYear = `Class of ${2000 + entryYear + 4}`;
    }
  }

  return {
    isIitiStudent: true,
    branch,
    classYear,
    institution: "IIT Indore",
  };
}

function getInitials(name?: string) {
  if (!name) return "ST";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Module-level sub-components
// These MUST live outside Profile() so React's hook call order stays stable.
// ---------------------------------------------------------------------------

interface RideRowProps {
  ride: any;
  index: number;
  completed?: boolean;
  user: UserType | null;
  onCancel: (rideID: number) => void;
  onLeave: (rideID: number) => void;
}

function RideRow({ ride, completed, user, onCancel, onLeave }: RideRowProps) {
  return (
    <div className="glass-card rounded-2xl p-5 border border-white/60 transition-all duration-300 hover:shadow-glass-lg">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="space-y-3 flex-1 min-w-[240px]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 glass-pill px-3.5 py-1.5 text-ink font-semibold text-sm">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>{ride.from ?? ride.pickup}</span>
            </div>
            <span className="text-primary font-bold text-lg">→</span>
            <div className="flex items-center gap-2 glass-pill px-3.5 py-1.5 text-ink font-semibold text-sm">
              <MapPin className="w-4 h-4 text-secondary shrink-0" />
              <span>{ride.to ?? ride.dropoff}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-variant">
            <div className="flex items-center gap-1.5 glass-input rounded-lg px-3 py-1 text-ink-variant font-medium">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{ride.date ?? ride.dateTime}</span>
            </div>
            {ride.time && (
              <div className="flex items-center gap-1.5 glass-input rounded-lg px-3 py-1 text-ink-variant font-medium">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{ride.time}</span>
              </div>
            )}
            {ride.vehicle && (
              <div className="flex items-center gap-1.5 glass-input rounded-lg px-3 py-1 text-ink-variant font-medium capitalize">
                <Car className="w-3.5 h-3.5 text-primary" />
                <span>{ride.vehicle}</span>
              </div>
            )}
            {ride.price != null && (
              <div className="flex items-center gap-1 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1 text-primary font-bold">
                <span>₹{ride.price}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          {completed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/15 text-secondary-dark border border-secondary/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 text-primary-dark border border-primary/30 rounded-full text-xs font-bold uppercase tracking-wider">
              Upcoming
            </span>
          )}
        </div>
      </div>

      {!completed && ride.rideID && (
        <div className="mt-4 pt-3.5 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/chat/${ride.rideID}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition shadow-glow shine-hover"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </Link>
            <Link
              to={`/rides/${ride.rideID}/group`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl glass-input text-ink text-xs font-semibold hover:border-primary/40 transition"
            >
              <span>View Group</span>
            </Link>
          </div>

          {String(ride.createdBy) === String(user?.id) ? (
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold hover:bg-danger hover:text-white transition-all"
              onClick={() => onCancel(Number(ride.rideID))}
            >
              Cancel ride
            </button>
          ) : (
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold hover:bg-danger hover:text-white transition-all"
              onClick={() => onLeave(Number(ride.rideID))}
            >
              Leave ride
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface RequestRowProps {
  request: RideRequest;
  received: boolean;
  onHandle: (payload: HandleRequestPayload) => Promise<boolean>;
  onError: (msg: string) => void;
}

function RequestRow({ request, received, onHandle, onError }: RequestRowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const decide = async (flag: HandleRequestPayload["flag"]) => {
    setIsSubmitting(true);
    const success = await onHandle({ rideID: request.rideID, requestBy: request.requestBy, flag });
    if (!success) onError("Unable to update this ride request.");
    setIsSubmitting(false);
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/60 shadow-glass">
      <div className="flex justify-between gap-4 flex-wrap items-center">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-ink font-semibold text-base font-display">
            <span className="text-primary">{request.ride.source}</span>
            <span className="text-outline">→</span>
            <span className="text-secondary">{request.ride.destination}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-variant">
            <span className="flex items-center gap-1 glass-input rounded-md px-2.5 py-1">
              <Calendar className="w-3 h-3 text-primary" /> {request.ride.date}
            </span>
            <span className="flex items-center gap-1 glass-input rounded-md px-2.5 py-1">
              <Clock className="w-3 h-3 text-primary" /> {request.ride.time}
            </span>
          </div>
          {received ? (
            <p className="text-xs text-ink-variant pt-1">
              Requested by: <strong className="text-ink font-medium">{request.requester?.name ?? request.requester?.email ?? "Student"}</strong>
            </p>
          ) : (
            <p className="text-xs text-ink-variant pt-1">Awaiting the ride owner's decision</p>
          )}
        </div>

        {received ? (
          <div className="flex gap-2 items-center">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => decide("Accepted")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-white font-semibold text-xs hover:bg-secondary-dark transition shadow-sm disabled:opacity-60"
            >
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => decide("Rejected")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-danger/10 border border-danger/20 text-danger font-semibold text-xs hover:bg-danger hover:text-white transition disabled:opacity-60"
            >
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        ) : (
          <span className="px-3.5 py-1.5 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary-dark text-xs font-bold uppercase tracking-wider">
            Pending
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * UI Layer — Profile
 */
export default function Profile() {
  const [activeTab, setActiveTab] = useState<"rides" | "history" | "requests">("rides");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    isDanger: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    isDanger: true,
    onConfirm: async () => {},
  });

  const {
    sentRequests,
    receivedRequests,
    loading: requestsLoading,
    error: requestsError,
    handleRequest,
  } = useRideRequests();

  const { profile, loading: profileLoading, error: profileError } = useProfile();

  const {
    upcomingRides,
    completedRides,
    loading: ridesLoading,
    error: ridesError,
    fetchProfileRides,
  } = useRides("profile");

  const isLoading = (profileLoading && !user) || ridesLoading;
  const activeProfile = profile ?? (user ? { id: String(user.id), name: user.name, email: user.email, photoUrl: user.picture || user.profilePicture } : null);
  const studentDetails = getStudentDetails(activeProfile?.email);
  const initials = getInitials(activeProfile?.name);

  const handleCancelRideClick = (rideID: number) => {
    setActionError(null);
    setActionSuccess(null);
    setConfirmModal({
      isOpen: true,
      title: "Cancel Ride",
      description: "Are you sure you want to cancel this ride? All accepted and pending requests will be canceled and your co-riders notified.",
      confirmText: "Yes, Cancel Ride",
      isDanger: true,
      onConfirm: async () => {
        try {
          await cancelUserRide(rideID);
          await fetchProfileRides();
          setActionSuccess("Ride canceled successfully.");
        } catch {
          setActionError("Unable to cancel ride. Please try again.");
        }
      },
    });
  };

  const handleLeaveRideClick = (rideID: number) => {
    setActionError(null);
    setActionSuccess(null);
    setConfirmModal({
      isOpen: true,
      title: "Leave Ride",
      description: "Are you sure you want to leave this ride? Your seat will be freed up for other students.",
      confirmText: "Yes, Leave Ride",
      isDanger: true,
      onConfirm: async () => {
        try {
          await leaveUserRide(rideID);
          await fetchProfileRides();
          setActionSuccess("You have left the ride successfully.");
        } catch {
          setActionError("Unable to leave ride. Please try again.");
        }
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-28 lumina-bg">
        <div className="glass-strong p-8 rounded-3xl border border-white/70 flex flex-col items-center gap-4 shadow-glass">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-ink font-medium text-sm">Loading Profile & Rides...</p>
        </div>
      </div>
    );
  }

  if (profileError && !activeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-28 lumina-bg">
        <div className="glass-strong p-8 rounded-3xl border border-danger/30 max-w-md w-full text-center shadow-glass">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-ink mb-2">Error Loading Profile</h2>
          <p className="text-danger text-sm mb-6">{profileError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-xs hover:bg-primary-dark transition shadow-glow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lumina-bg text-ink relative font-body">
      {/* Background Glow Orbs */}
      <div className="absolute w-[28rem] h-[28rem] rounded-full bg-primary/15 blur-[120px] top-10 -left-28 pointer-events-none" />
      <div className="absolute w-[24rem] h-[24rem] rounded-full bg-secondary/15 blur-[110px] bottom-10 -right-20 pointer-events-none" />

      {/* Page Header Bar */}
      <div className="max-w-[1080px] mx-auto px-6 pt-24 pb-4 flex items-center justify-between flex-wrap gap-4 relative z-10">
        <div className="text-xs text-outline font-medium">
          Account <span className="mx-1.5">/</span> <b className="text-ink-variant font-semibold">Profile</b>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/offer')}
            className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-glow shine-hover transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Offer a ride
          </button>
        </div>
      </div>

      {/* Action / Error / Success Banner */}
      {(actionError || actionSuccess) && (
        <div className="max-w-[1080px] mx-auto px-6 mb-4 relative z-10">
          <div className={`rounded-2xl p-4 text-xs font-medium flex items-center justify-between border ${
            actionError
              ? "bg-danger/10 border-danger/20 text-danger"
              : "bg-secondary/10 border-secondary/20 text-secondary-dark"
          }`}>
            <span>{actionError ?? actionSuccess}</span>
            <button
              onClick={() => { setActionError(null); setActionSuccess(null); }}
              className="font-bold underline ml-2 hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Content */}
      <main className="max-w-[1080px] mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-[296px_1fr] gap-6 items-start relative z-10">
        {/* LEFT: Profile Summary Card */}
        <aside className="glass-strong rounded-3xl border border-white/70 shadow-glass overflow-hidden md:sticky md:top-24">
          <div className="h-[80px] bg-gradient-to-r from-primary via-[#6a5cf0] to-secondary" />

          <div className="px-5 -mt-10">
            <div className="w-[80px] h-[80px] rounded-full bg-white p-1 border-4 border-white shadow-md relative">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/10 to-secondary/15 flex items-center justify-center overflow-hidden">
                {activeProfile?.photoUrl ? (
                  <img
                    src={activeProfile.photoUrl}
                    alt={activeProfile.name ?? "Profile"}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-bold text-2xl text-primary font-display">{initials}</span>
                )}
              </div>
              {studentDetails.isIitiStudent && (
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-secondary border-2 border-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              )}
            </div>
          </div>

          <div className="px-5 pt-3 pb-4">
            <h1 className="font-display font-bold text-xl text-ink leading-snug">
              {activeProfile?.name}
            </h1>
            {studentDetails.isIitiStudent ? (
              <p className="text-xs text-ink-variant mt-0.5 leading-relaxed">
                {studentDetails.branch} &middot; {studentDetails.classYear}
                <br />{studentDetails.institution}
              </p>
            ) : (
              <p className="text-xs text-ink-variant mt-0.5 leading-relaxed">Rider &middot; Verified User</p>
            )}

            {studentDetails.isIitiStudent && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-secondary-dark bg-secondary/15 border border-secondary/30 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Verified student
                </span>
              </div>
            )}

            <div className="mt-4 pt-3.5 border-t border-outline-variant/30 space-y-2.5 text-xs text-ink-variant">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-outline shrink-0" />
                <span className="truncate">{activeProfile?.email}</span>
              </div>
            </div>
          </div>

          {/* Left Card Stat List */}
          <div className="border-t border-outline-variant/30 px-5 py-3 divide-y divide-outline-variant/20">
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary-dark shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-ink-variant">Rides completed</span>
              </div>
              <span className="font-display text-sm font-bold text-ink">{completedRides.length}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-ink-variant">Scheduled</span>
              </div>
              <span className="font-display text-sm font-bold text-ink">{upcomingRides.length}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-tertiary/15 flex items-center justify-center text-tertiary-dark shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-ink-variant">Pending requests</span>
              </div>
              <span className="font-display text-sm font-bold text-ink">{receivedRequests.length + sentRequests.length}</span>
            </div>
          </div>
        </aside>

        {/* RIGHT: Rides & Requests Container */}
        <section className="space-y-5">
          <div className="glass-strong rounded-3xl border border-white/70 shadow-glass overflow-hidden">
            {/* Tab Header Bar */}
            <div className="flex border-b border-outline-variant/30 px-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("rides")}
                className={`py-3.5 px-4 font-semibold text-sm relative transition-colors ${
                  activeTab === "rides" ? "text-ink" : "text-outline hover:text-ink"
                }`}
              >
                Upcoming
                <span className="ml-1.5 text-xs bg-surface-low text-ink-variant px-2 py-0.5 rounded-full font-bold">
                  {upcomingRides.length}
                </span>
                {activeTab === "rides" && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-t"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`py-3.5 px-4 font-semibold text-sm relative transition-colors ${
                  activeTab === "history" ? "text-ink" : "text-outline hover:text-ink"
                }`}
              >
                Ride history
                {completedRides.length > 0 && (
                  <span className="ml-1.5 text-xs bg-surface-low text-ink-variant px-2 py-0.5 rounded-full font-bold">
                    {completedRides.length}
                  </span>
                )}
                {activeTab === "history" && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-t"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`py-3.5 px-4 font-semibold text-sm relative transition-colors ${
                  activeTab === "requests" ? "text-ink" : "text-outline hover:text-ink"
                }`}
              >
                Requests
                {(receivedRequests.length > 0 || sentRequests.length > 0) && (
                  <span className={`ml-1.5 text-xs px-2 py-0.5 rounded-full font-bold ${
                    receivedRequests.length > 0
                      ? "bg-tertiary/20 text-tertiary-dark"
                      : "bg-surface-low text-ink-variant"
                  }`}>
                    {receivedRequests.length + sentRequests.length}
                  </span>
                )}
                {activeTab === "requests" && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-t"
                  />
                )}
              </button>
            </div>

            {/* Tab Panel Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === "rides" && (
                  <motion.div
                    key="rides-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {ridesError && <p className="text-danger text-xs mb-3">{ridesError}</p>}
                    {upcomingRides.length === 0 ? (
                      <div className="py-12 px-4 text-center">
                        <div className="w-12 h-12 rounded-2xl glass-input flex items-center justify-center mx-auto mb-4 text-outline">
                          <Car className="w-6 h-6" />
                        </div>
                        <h3 className="font-display font-bold text-base text-ink mb-1">
                          No rides on the road yet
                        </h3>
                        <p className="text-xs text-ink-variant max-w-[320px] mx-auto leading-relaxed mb-5">
                          Once you book or offer a ride, it'll show up here so you can track pickup times and co-riders at a glance.
                        </p>
                        <button
                          onClick={() => navigate('/find')}
                          className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-glow"
                        >
                          Find a ride
                        </button>
                      </div>
                    ) : (
                      upcomingRides.map((ride, index) => (
                        <RideRow
                          key={ride.id ?? index}
                          ride={ride}
                          index={index}
                          user={user}
                          onCancel={handleCancelRideClick}
                          onLeave={handleLeaveRideClick}
                        />
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "history" && (
                  <motion.div
                    key="history-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {completedRides.length === 0 ? (
                      <div className="py-12 px-4 text-center">
                        <div className="w-12 h-12 rounded-2xl glass-input flex items-center justify-center mx-auto mb-4 text-outline">
                          <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="font-display font-bold text-base text-ink mb-1">
                          No ride history yet
                        </h3>
                        <p className="text-xs text-ink-variant max-w-[320px] mx-auto leading-relaxed">
                          Completed rides will appear here once you finish your journeys.
                        </p>
                      </div>
                    ) : (
                      completedRides.map((ride, index) => (
                        <RideRow
                          key={ride.id ?? index}
                          ride={ride}
                          index={index}
                          completed
                          user={user}
                          onCancel={handleCancelRideClick}
                          onLeave={handleLeaveRideClick}
                        />
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "requests" && (
                  <motion.div
                    key="requests-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {requestsError && <p className="text-danger text-xs mb-3">{requestsError}</p>}

                    {requestsLoading ? (
                      <div className="text-center py-8 text-xs text-ink-variant">
                        Loading ride requests...
                      </div>
                    ) : (
                      <>
                        <section className="space-y-3">
                          <h2 className="font-display font-bold text-sm text-ink">
                            Requests to join your rides ({receivedRequests.length})
                          </h2>
                          {receivedRequests.length === 0 ? (
                            <div className="p-4 rounded-2xl border border-white/60 text-center text-xs text-ink-variant glass">
                              No pending requests to join your rides.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {receivedRequests.map((request) => (
                                <RequestRow
                                  key={request.id}
                                  request={request}
                                  received
                                  onHandle={handleRequest}
                                  onError={setActionError}
                                />
                              ))}
                            </div>
                          )}
                        </section>

                        <section className="space-y-3 pt-2">
                          <h2 className="font-display font-bold text-sm text-ink">
                            Your pending requests ({sentRequests.length})
                          </h2>
                          {sentRequests.length === 0 ? (
                            <div className="p-4 rounded-2xl border border-white/60 text-center text-xs text-ink-variant glass">
                              You have no pending ride requests.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {sentRequests.map((request) => (
                                <RequestRow
                                  key={request.id}
                                  request={request}
                                  received={false}
                                  onHandle={handleRequest}
                                  onError={setActionError}
                                />
                              ))}
                            </div>
                          )}
                        </section>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
      />
    </div>
  );
}
