import { User, Clock, MapPin, Mail, Calendar, Car, MessageCircle, Check, X, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useProfile } from "../hooks/useProfile";
import { useRides } from "../hooks/useRides";
import { useAuth } from "../hooks/useAuth";
import { cancelUserRide, leaveUserRide } from "../services/rideService";
import { Link, useNavigate } from "react-router-dom";
import { useRideRequests } from "../hooks/useRideRequests";
import { HandleRequestPayload, RideRequest } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "../components/ConfirmModal";

/**
 * Parse student details & graduation class year from institutional email.
 * Uses starting prefix of the email (before '@') directly instead of mapping branch names.
 */
function getStudentDetails(email?: string) {
  if (!email) {
    return { isIitiStudent: false, branch: "", classYear: "", institution: "" };
  }
  const cleanEmail = email.toLowerCase();
  const isStudent = cleanEmail.endsWith("@iiti.ac.in") || cleanEmail.endsWith("@iiit.ac.in") || cleanEmail.endsWith(".ac.in");

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

  const institution = cleanEmail.endsWith("@iiit.ac.in")
    ? "IIIT"
    : cleanEmail.endsWith("@iiti.ac.in")
    ? "IIT Indore"
    : "Institutional Student";

  return {
    isIitiStudent: true,
    branch,
    classYear,
    institution,
  };
}

function getInitials(name?: string) {
  if (!name) return "ST";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

/**
 * UI Layer — Profile
 *
 * This page ONLY reads from hooks — no fetch(), no API_URL, no inline async logic.
 *  - useProfile()      → user's name, email, avatar (GET /user/profile)
 *  - useRides('profile') → upcoming + completed rides
 *  - ConfirmModal      → sleek confirmation for ride cancellation/leave with in-place refresh
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
  const activeProfile = profile ?? (user ? { id: String(user.id), name: user.name, email: user.email, photoUrl: user.picture } : null);
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
      <div className="min-h-screen flex flex-col items-center justify-center py-28 bg-[#f6f7fb]">
        <div className="bg-white p-8 rounded-2xl border border-[#e7e9f2] flex flex-col items-center gap-4 shadow-sm">
          <div className="w-10 h-10 border-4 border-[#3b6ef0]/20 border-t-[#3b6ef0] rounded-full animate-spin" />
          <p className="text-[#12172b] font-medium text-sm">Loading Profile & Rides...</p>
        </div>
      </div>
    );
  }

  if (profileError && !activeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-28 bg-[#f6f7fb]">
        <div className="bg-white p-8 rounded-2xl border border-[#ba1a1a]/30 max-w-md w-full text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-[#ba1a1a] mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-[#12172b] mb-2">Error Loading Profile</h2>
          <p className="text-[#ba1a1a] text-sm mb-6">{profileError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#3b6ef0] text-white px-4 py-2 rounded-lg font-semibold text-xs hover:bg-[#2951c2] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const RideRow = ({ ride, index, completed }: { ride: any; index: number; completed?: boolean }) => (
    <div
      key={ride.id ?? index}
      className="bg-white rounded-xl p-5 border border-[#e7e9f2] hover:border-[#3b6ef0]/40 transition-all duration-200 shadow-sm"
    >
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="space-y-2 flex-1 min-w-[240px]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 bg-[#f0f1f7] border border-[#e7e9f2] rounded-lg px-3 py-1 text-[#12172b] font-semibold text-sm">
              <MapPin className="w-4 h-4 text-[#3b6ef0] shrink-0" />
              <span>{ride.from ?? ride.pickup}</span>
            </div>
            <span className="text-[#3b6ef0] font-bold text-base">→</span>
            <div className="flex items-center gap-2 bg-[#f0f1f7] border border-[#e7e9f2] rounded-lg px-3 py-1 text-[#12172b] font-semibold text-sm">
              <MapPin className="w-4 h-4 text-[#0fb99e] shrink-0" />
              <span>{ride.to ?? ride.dropoff}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#5a6178]">
            <div className="flex items-center gap-1.5 bg-[#f6f7fb] rounded-md px-2.5 py-1 border border-[#e7e9f2]">
              <Calendar className="w-3.5 h-3.5 text-[#3b6ef0]" />
              <span>{ride.date ?? ride.dateTime}</span>
            </div>
            {ride.time && (
              <div className="flex items-center gap-1.5 bg-[#f6f7fb] rounded-md px-2.5 py-1 border border-[#e7e9f2]">
                <Clock className="w-3.5 h-3.5 text-[#3b6ef0]" />
                <span>{ride.time}</span>
              </div>
            )}
            {ride.vehicle && (
              <div className="flex items-center gap-1.5 bg-[#f6f7fb] rounded-md px-2.5 py-1 border border-[#e7e9f2]">
                <Car className="w-3.5 h-3.5 text-[#3b6ef0]" />
                <span>{ride.vehicle}</span>
              </div>
            )}
            {ride.price != null && (
              <div className="flex items-center gap-1 bg-[#eef2ff] border border-[#c7d2fe] rounded-md px-2.5 py-1 text-[#3b6ef0] font-bold">
                <span>₹{ride.price}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          {completed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e6faf4] text-[#0a8a71] border border-[#c7f0e4] rounded-full text-xs font-bold uppercase tracking-wider">
              Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eef2ff] text-[#3b6ef0] border border-[#c7d2fe] rounded-full text-xs font-bold uppercase tracking-wider">
              Upcoming
            </span>
          )}
        </div>
      </div>

      {!completed && ride.rideID && (
        <div className="mt-4 pt-3 border-t border-[#f0f1f7] flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/chat/${ride.rideID}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b6ef0] text-white text-xs font-semibold hover:bg-[#2951c2] transition shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat</span>
            </Link>
            <Link
              to={`/rides/${ride.rideID}/group`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f6f7fb] border border-[#e7e9f2] text-[#12172b] text-xs font-semibold hover:bg-[#f0f1f7] transition"
            >
              <span>View Group</span>
            </Link>
          </div>

          {String(ride.createdBy) === String(user?.id) ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[#fef2f2] border border-[#fee2e2] text-[#dc2626] text-xs font-semibold hover:bg-[#dc2626] hover:text-white transition"
              onClick={() => handleCancelRideClick(Number(ride.rideID))}
            >
              Cancel ride
            </button>
          ) : (
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-[#fef2f2] border border-[#fee2e2] text-[#dc2626] text-xs font-semibold hover:bg-[#dc2626] hover:text-white transition"
              onClick={() => handleLeaveRideClick(Number(ride.rideID))}
            >
              Leave ride
            </button>
          )}
        </div>
      )}
    </div>
  );

  const RequestRow = ({ request, received }: { request: RideRequest; received: boolean }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const decide = async (flag: HandleRequestPayload["flag"]) => {
      setIsSubmitting(true);
      const success = await handleRequest({ rideID: request.rideID, requestBy: request.requestBy, flag });
      if (!success) setActionError("Unable to update this ride request.");
      setIsSubmitting(false);
    };

    return (
      <div className="bg-white rounded-xl p-5 border border-[#e7e9f2] shadow-sm">
        <div className="flex justify-between gap-4 flex-wrap items-center">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-[#12172b] font-semibold text-base">
              <span className="text-[#3b6ef0]">{request.ride.source}</span>
              <span className="text-[#8c93a8]">→</span>
              <span className="text-[#0fb99e]">{request.ride.destination}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#5a6178]">
              <span className="flex items-center gap-1 bg-[#f6f7fb] border border-[#e7e9f2] rounded-md px-2 py-0.5">
                <Calendar className="w-3 h-3 text-[#3b6ef0]" /> {request.ride.date}
              </span>
              <span className="flex items-center gap-1 bg-[#f6f7fb] border border-[#e7e9f2] rounded-md px-2 py-0.5">
                <Clock className="w-3 h-3 text-[#3b6ef0]" /> {request.ride.time}
              </span>
            </div>
            {received ? (
              <p className="text-xs text-[#5a6178] pt-1">
                Requested by: <strong className="text-[#12172b]">{request.requester?.name ?? request.requester?.email ?? "Student"}</strong>
              </p>
            ) : (
              <p className="text-xs text-[#5a6178] pt-1">Awaiting the ride owner's decision</p>
            )}
          </div>

          {received ? (
            <div className="flex gap-2 items-center">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => decide("Accepted")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0fb99e] text-white font-semibold text-xs hover:bg-[#0a8a71] transition disabled:opacity-60"
              >
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => decide("Rejected")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#fef2f2] border border-[#fee2e2] text-[#dc2626] font-semibold text-xs hover:bg-[#dc2626] hover:text-white transition disabled:opacity-60"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          ) : (
            <span className="px-3 py-1 rounded-full bg-[#fdf1e0] border border-[#fce3c1] text-[#e8a13a] text-xs font-bold uppercase tracking-wider">
              Pending
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#12172b]">
      {/* Page Header Bar */}
      <div className="max-w-[1080px] mx-auto px-6 pt-24 pb-4 flex items-center justify-between flex-wrap gap-4">
        <div className="text-xs text-[#8c93a8] font-medium">
          Account <span className="mx-1.5">/</span> <b className="text-[#5a6178] font-semibold">Profile</b>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/offer')}
            className="bg-[#3b6ef0] hover:bg-[#2951c2] text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Offer a ride
          </button>
        </div>
      </div>

      {/* Action / Error / Success Banner */}
      {(actionError || actionSuccess) && (
        <div className="max-w-[1080px] mx-auto px-6 mb-4">
          <div className={`rounded-xl p-3.5 text-xs font-medium flex items-center justify-between border ${
            actionError
              ? "bg-[#fef2f2] border-[#fee2e2] text-[#dc2626]"
              : "bg-[#e6faf4] border-[#c7f0e4] text-[#0a8a71]"
          }`}>
            <span>{actionError ?? actionSuccess}</span>
            <button
              onClick={() => { setActionError(null); setActionSuccess(null); }}
              className="font-bold underline ml-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Content */}
      <main className="max-w-[1080px] mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-[296px_1fr] gap-5 items-start">
        {/* LEFT: Profile Summary Card */}
        <aside className="bg-white rounded-2xl border border-[#e7e9f2] shadow-sm overflow-hidden md:sticky md:top-24">
          <div className="h-[72px] bg-gradient-to-r from-[#2f5df0] via-[#6a5cf0] to-[#0fb99e]" />

          <div className="px-5 -mt-9">
            <div className="w-[76px] h-[76px] rounded-full bg-white p-1 border-4 border-white shadow-md relative">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#e9edff] to-[#dcf9f2] flex items-center justify-center overflow-hidden">
                {activeProfile?.photoUrl ? (
                  <img
                    src={activeProfile.photoUrl}
                    alt={activeProfile.name ?? "Profile"}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-bold text-2xl text-[#2951c2]">{initials}</span>
                )}
              </div>
              {studentDetails.isIitiStudent && (
                <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#0fb99e] border-2 border-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
              )}
            </div>
          </div>

          <div className="px-5 pt-3 pb-4">
            <h1 className="font-display font-bold text-lg text-[#12172b] leading-snug">
              {activeProfile?.name}
            </h1>
            {studentDetails.isIitiStudent ? (
              <p className="text-xs text-[#5a6178] mt-0.5 leading-relaxed">
                {studentDetails.branch} &middot; {studentDetails.classYear}
                <br />{studentDetails.institution}
              </p>
            ) : (
              <p className="text-xs text-[#5a6178] mt-0.5 leading-relaxed">Rider &middot; Verified User</p>
            )}

            {studentDetails.isIitiStudent && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[#0a8a71] bg-[#e6faf4] border border-[#c7f0e4] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Verified student
                </span>
              </div>
            )}

            <div className="mt-4 pt-3.5 border-t border-[#f0f1f7] space-y-2.5 text-xs text-[#5a6178]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-[#8c93a8] shrink-0" />
                <span className="truncate">{activeProfile?.email}</span>
              </div>
            </div>
          </div>

          {/* Left Card Stat List */}
          <div className="border-t border-[#f0f1f7] px-5 py-3 divide-y divide-[#f0f1f7]">
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#e6faf4] flex items-center justify-center text-[#0a8a71] shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-[#5a6178]">Rides completed</span>
              </div>
              <span className="font-display text-sm font-bold text-[#12172b]">{completedRides.length}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#eef1ff] flex items-center justify-center text-[#3b6ef0] shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-[#5a6178]">Scheduled</span>
              </div>
              <span className="font-display text-sm font-bold text-[#12172b]">{upcomingRides.length}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#fdf1e0] flex items-center justify-center text-[#e8a13a] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-[#5a6178]">Pending requests</span>
              </div>
              <span className="font-display text-sm font-bold text-[#12172b]">{receivedRequests.length + sentRequests.length}</span>
            </div>
          </div>
        </aside>

        {/* RIGHT: Rides & Requests Container */}
        <section className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#e7e9f2] shadow-sm overflow-hidden">
            {/* Tab Header Bar */}
            <div className="flex border-b border-[#e7e9f2] px-2">
              <button
                type="button"
                onClick={() => setActiveTab("rides")}
                className={`py-3.5 px-4 font-semibold text-sm relative transition-colors ${
                  activeTab === "rides" ? "text-[#12172b]" : "text-[#8c93a8] hover:text-[#12172b]"
                }`}
              >
                Upcoming
                <span className="ml-1.5 text-xs bg-[#f0f1f7] text-[#5a6178] px-2 py-0.5 rounded-full font-bold">
                  {upcomingRides.length}
                </span>
                {activeTab === "rides" && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#3b6ef0] rounded-t"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`py-3.5 px-4 font-semibold text-sm relative transition-colors ${
                  activeTab === "history" ? "text-[#12172b]" : "text-[#8c93a8] hover:text-[#12172b]"
                }`}
              >
                Ride history
                {completedRides.length > 0 && (
                  <span className="ml-1.5 text-xs bg-[#f0f1f7] text-[#5a6178] px-2 py-0.5 rounded-full font-bold">
                    {completedRides.length}
                  </span>
                )}
                {activeTab === "history" && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#3b6ef0] rounded-t"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`py-3.5 px-4 font-semibold text-sm relative transition-colors ${
                  activeTab === "requests" ? "text-[#12172b]" : "text-[#8c93a8] hover:text-[#12172b]"
                }`}
              >
                Requests
                {(receivedRequests.length > 0 || sentRequests.length > 0) && (
                  <span className={`ml-1.5 text-xs px-2 py-0.5 rounded-full font-bold ${
                    receivedRequests.length > 0
                      ? "bg-[#fdf1e0] text-[#e8a13a]"
                      : "bg-[#f0f1f7] text-[#5a6178]"
                  }`}>
                    {receivedRequests.length + sentRequests.length}
                  </span>
                )}
                {activeTab === "requests" && (
                  <motion.div
                    layoutId="activeUnderline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#3b6ef0] rounded-t"
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
                    {ridesError && <p className="text-[#dc2626] text-xs mb-3">{ridesError}</p>}
                    {upcomingRides.length === 0 ? (
                      <div className="py-12 px-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-[#f0f1f7] flex items-center justify-center mx-auto mb-4 text-[#8c93a8]">
                          <Car className="w-6 h-6" />
                        </div>
                        <h3 className="font-display font-bold text-base text-[#12172b] mb-1">
                          No rides on the road yet
                        </h3>
                        <p className="text-xs text-[#5a6178] max-w-[320px] mx-auto leading-relaxed mb-5">
                          Once you book or offer a ride, it'll show up here so you can track pickup times and co-riders at a glance.
                        </p>
                        <button
                          onClick={() => navigate('/find')}
                          className="bg-[#3b6ef0] hover:bg-[#2951c2] text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition"
                        >
                          Find a ride
                        </button>
                      </div>
                    ) : (
                      upcomingRides.map((ride, index) => (
                        <RideRow ride={ride} index={index} key={ride.id ?? index} />
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
                        <div className="w-12 h-12 rounded-xl bg-[#f0f1f7] flex items-center justify-center mx-auto mb-4 text-[#8c93a8]">
                          <Clock className="w-6 h-6" />
                        </div>
                        <h3 className="font-display font-bold text-base text-[#12172b] mb-1">
                          No ride history yet
                        </h3>
                        <p className="text-xs text-[#5a6178] max-w-[320px] mx-auto leading-relaxed">
                          Completed rides will appear here once you finish your journeys.
                        </p>
                      </div>
                    ) : (
                      completedRides.map((ride, index) => (
                        <RideRow ride={ride} index={index} completed key={ride.id ?? index} />
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
                    {requestsError && <p className="text-[#dc2626] text-xs mb-3">{requestsError}</p>}

                    {requestsLoading ? (
                      <div className="text-center py-8 text-xs text-[#5a6178]">
                        Loading ride requests...
                      </div>
                    ) : (
                      <>
                        <section className="space-y-3">
                          <h2 className="font-display font-bold text-sm text-[#12172b]">
                            Requests to join your rides ({receivedRequests.length})
                          </h2>
                          {receivedRequests.length === 0 ? (
                            <div className="p-4 rounded-xl border border-[#e7e9f2] text-center text-xs text-[#5a6178] bg-[#f6f7fb]">
                              No pending requests to join your rides.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {receivedRequests.map((request) => (
                                <RequestRow key={request.id} request={request} received />
                              ))}
                            </div>
                          )}
                        </section>

                        <section className="space-y-3 pt-2">
                          <h2 className="font-display font-bold text-sm text-[#12172b]">
                            Your pending requests ({sentRequests.length})
                          </h2>
                          {sentRequests.length === 0 ? (
                            <div className="p-4 rounded-xl border border-[#e7e9f2] text-center text-xs text-[#5a6178] bg-[#f6f7fb]">
                              You have no pending ride requests.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {sentRequests.map((request) => (
                                <RequestRow key={request.id} request={request} received={false} />
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
