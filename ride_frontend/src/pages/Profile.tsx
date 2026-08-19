import { User, Clock, MapPin, Mail, Calendar, Car, MessageCircle, Check, X } from "lucide-react";
import { useState } from "react";
import { useProfile } from "../hooks/useProfile";
import { useRides } from "../hooks/useRides";
import { useAuth } from "../hooks/useAuth";
import { cancelUserRide, leaveUserRide } from "../services/rideService";
import { Link } from "react-router-dom";
import { useRideRequests } from "../hooks/useRideRequests";
import { HandleRequestPayload, RideRequest } from "../types";
import ConfirmModal from "../components/ConfirmModal";

/**
 * UI Layer — Profile
 *
 * This page ONLY reads from hooks — no fetch(), no API_URL, no inline async logic.
 *  - useProfile()  → user's name, email, avatar (GET /user/profile)
 *  - useRides('profile') → upcoming + completed rides
 *  - ConfirmModal  → sleek confirmation for ride cancellation/leave with in-place refresh
 */
export default function Profile() {
  const [activeTab, setActiveTab] = useState("rides");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
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

  const isLoading = profileLoading || ridesLoading;

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-danger">{profileError}</p>
      </div>
    );
  }

  const RideRow = ({ ride, index, completed }: { ride: any; index: number; completed?: boolean }) => (
    <div
      key={ride.id ?? index}
      className="glass rounded-lg p-4 hover:border-primary/40 transition-all"
    >
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <div className="flex items-center text-base font-medium text-ink">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="ml-2">
              {ride.from ?? ride.pickup} → {ride.to ?? ride.dropoff}
            </span>
          </div>
          <div className="mt-2 space-y-1 text-sm text-ink-variant">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{ride.date ?? ride.dateTime}</span>
            </div>
            {ride.time && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{ride.time}</span>
              </div>
            )}
            {ride.vehicle && (
              <div className="flex items-center capitalize">
                <Car className="w-4 h-4 mr-2" />
                <span>{ride.vehicle}</span>
              </div>
            )}
          </div>
        </div>

        {completed ? (
          <span className="px-3 py-1 bg-secondary/10 text-secondary-dark border border-secondary/30 rounded-full text-xs font-medium">
            Completed
          </span>
        ) : (
          <span className="px-3 py-1 bg-primary/10 text-primary-dark border border-primary/30 rounded-full text-xs font-medium">
            Upcoming
          </span>
        )}
      </div>

      {!completed && ride.rideID && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={`/chat/${ride.rideID}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Chat
          </Link>
          <Link
            to={`/rides/${ride.rideID}/group`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
          >
            View group
          </Link>
          {String(ride.createdBy) === String(user?.id) ? (
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger text-xs font-medium transition-colors"
              onClick={() => handleCancelRideClick(Number(ride.rideID))}
            >
              Cancel ride
            </button>
          ) : (
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger text-xs font-medium transition-colors"
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
      <div className="glass rounded-lg p-4">
        <div className="flex justify-between gap-3 flex-wrap">
          <div>
            <p className="font-medium text-ink">{request.ride.source} → {request.ride.destination}</p>
            <p className="text-sm text-ink-variant mt-1">{request.ride.date} • {request.ride.time}</p>
            {received ? (
              <p className="text-sm text-ink-variant mt-2">Requested by: {request.requester?.name ?? request.requester?.email ?? "Student"}</p>
            ) : (
              <p className="text-sm text-ink-variant mt-2">Awaiting the ride owner’s decision</p>
            )}
          </div>
          {received ? (
            <div className="flex gap-2 items-start">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => decide("Accepted")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => decide("Rejected")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-medium hover:bg-danger/20 transition-colors disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full bg-ink/5 text-ink-variant font-medium self-start">
              Pending
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[26rem] h-[26rem] rounded-full bg-primary/10 blur-[110px] top-10 -left-24 pointer-events-none" />
      <div className="absolute w-[22rem] h-[22rem] rounded-full bg-secondary/10 blur-[100px] bottom-0 -right-16 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="glass-strong rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden shrink-0 shadow-sm">
                {profile?.photoUrl? (
                  <img
                    src={profile.photoUrl}
                    alt={profile.name ?? "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              

              <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-ink">
                  {profile?.name ?? "Student"}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-ink-variant">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{profile?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity / Rides Tabs */}
          <div className="glass-strong rounded-2xl p-6 md:p-8">
            <div className="flex border-b border-ink/10 mb-6 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("rides")}
                className={`pb-3 px-4 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                  activeTab === "rides"
                    ? "text-primary border-b-2 border-primary"
                    : "text-ink-variant hover:text-ink"
                }`}
              >
                My Rides ({upcomingRides.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`pb-3 px-4 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                  activeTab === "history"
                    ? "text-primary border-b-2 border-primary"
                    : "text-ink-variant hover:text-ink"
                }`}
              >
                Ride History ({completedRides.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("requests")}
                className={`pb-3 px-4 text-sm font-semibold whitespace-nowrap transition-colors relative ${
                  activeTab === "requests"
                    ? "text-primary border-b-2 border-primary"
                    : "text-ink-variant hover:text-ink"
                }`}
              >
                Requests ({receivedRequests.length + sentRequests.length})
              </button>
            </div>

            {/* Content Area */}
            <div>
              {ridesError && (
                <p className="text-danger text-sm mb-4">{ridesError}</p>
              )}
              {actionError && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm mb-4">
                  {actionError}
                </div>
              )}
              {actionSuccess && (
                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary-dark text-sm mb-4">
                  {actionSuccess}
                </div>
              )}

              {activeTab === "rides" ? (
                <div className="space-y-3">
                  {upcomingRides.length === 0 ? (
                    <p className="text-center text-ink-variant py-6">No upcoming rides</p>
                  ) : (
                    upcomingRides.map((ride, index) => (
                      <RideRow ride={ride} index={index} key={ride.id ?? index} />
                    ))
                  )}
                </div>
              ) : activeTab === "history" ? (
                <div className="space-y-3">
                  {completedRides.length === 0 ? (
                    <p className="text-center text-ink-variant py-6">No completed rides yet</p>
                  ) : (
                    completedRides.map((ride, index) => (
                      <RideRow ride={ride} index={index} completed key={ride.id ?? index} />
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {requestsError && <p className="text-danger text-sm">{requestsError}</p>}
                  {requestsLoading ? <p className="text-ink-variant">Loading requests...</p> : <>
                    <section>
                      <h2 className="font-display text-lg font-semibold text-ink mb-3">Requests to join your rides</h2>
                      {receivedRequests.length === 0 ? <p className="text-ink-variant text-sm">No pending requests for your rides.</p> : (
                        <div className="space-y-3">{receivedRequests.map((request) => <RequestRow key={request.id} request={request} received />)}</div>
                      )}
                    </section>
                    <section>
                      <h2 className="font-display text-lg font-semibold text-ink mb-3">Your pending requests</h2>
                      {sentRequests.length === 0 ? <p className="text-ink-variant text-sm">You have no pending ride requests.</p> : (
                        <div className="space-y-3">{sentRequests.map((request) => <RequestRow key={request.id} request={request} received={false} />)}</div>
                      )}
                    </section>
                  </>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
