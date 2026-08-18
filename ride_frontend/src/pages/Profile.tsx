import { User, Clock, MapPin, Mail, Calendar, Car, MessageCircle, Check, X } from "lucide-react";
import { useState } from "react";
import { useProfile } from "../hooks/useProfile";
import { useRides } from "../hooks/useRides";
import { useAuth } from "../hooks/useAuth";
import { cancelUserRide, leaveUserRide } from "../services/rideService";
import { Link } from "react-router-dom";
import { useRideRequests } from "../hooks/useRideRequests";
import { HandleRequestPayload, RideRequest } from "../types";

/**
 * UI Layer — Profile
 *
 * This page ONLY reads from hooks — no fetch(), no API_URL, no inline async logic.
 *  - useProfile()  → user's name, email, avatar (GET /user/profile)
 *  - useRides('profile') → upcoming + completed rides
 *
 * Note: the backend has no "cancel ride", "edit avatar" or "rating" endpoints,
 * so those UI affordances were removed rather than left as non-functional decoration.
 */
export default function Profile() {
  const [activeTab, setActiveTab] = useState("rides");
  const [actionError, setActionError] = useState<string | null>(null);
  const { user } = useAuth();
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
  } = useRides("profile");

  const isLoading = profileLoading || ridesLoading;

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
          <Link to={`/chat/${ride.rideID}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">
            <MessageCircle className="w-3.5 h-3.5" /> Chat
          </Link>
          <Link to={`/rides/${ride.rideID}/group`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium">View group</Link>
          {String(ride.createdBy) === String(user?.id) ? (
            <button className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-medium" onClick={async () => {
              if (!window.confirm("Cancel this ride?")) return;
              try { await cancelUserRide(Number(ride.rideID)); window.location.reload(); } catch { setActionError("Unable to cancel ride."); }
            }}>Cancel ride</button>
          ) : (
            <button className="px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-medium" onClick={async () => {
              if (!window.confirm("Leave this ride?")) return;
              try { await leaveUserRide(Number(ride.rideID)); window.location.reload(); } catch { setActionError("Unable to leave ride."); }
            }}>Leave ride</button>
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
              <button disabled={isSubmitting} onClick={() => decide("Accepted")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/15 text-secondary-dark text-xs font-medium disabled:opacity-60">
                <Check className="w-3.5 h-3.5" /> Accept
              </button>
              <button disabled={isSubmitting} onClick={() => decide("Rejected")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-medium disabled:opacity-60">
                <X className="w-3.5 h-3.5" /> Reject
              </button>
            </div>
          ) : (
            <span className="px-3 py-1 h-fit rounded-full bg-primary/10 text-primary-dark text-xs font-medium">Pending</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-28 relative">
      <div className="absolute w-[24rem] h-[24rem] rounded-full bg-primary/10 blur-[110px] top-10 -right-20 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <div className="glass-strong rounded-md overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary to-secondary" />
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center -mt-12">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-glass-lg">
                  <div className="w-full h-full bg-surface-container rounded-full flex items-center justify-center overflow-hidden">
                    {profile?.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-10 h-10 text-ink-variant" />
                    )}
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                  <h1 className="font-display text-2xl font-bold text-ink">{profile?.name}</h1>
                  <div className="flex items-center justify-center sm:justify-start mt-2 gap-4 text-sm text-ink-variant">
                    <div className="flex items-center">
                      <Car className="w-4 h-4 mr-1.5" />
                      <span>{completedRides.length} rides completed</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center text-sm text-ink-variant">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{profile?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 glass-strong rounded-md">
            <div className="border-b border-white/60">
              <div className="flex">
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "rides"
                      ? "border-b-2 border-primary text-primary"
                      : "text-ink-variant hover:text-ink"
                  }`}
                  onClick={() => setActiveTab("rides")}
                >
                  Upcoming Rides
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "history"
                      ? "border-b-2 border-primary text-primary"
                      : "text-ink-variant hover:text-ink"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  Ride History
                </button>
                <button
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === "requests"
                      ? "border-b-2 border-primary text-primary"
                      : "text-ink-variant hover:text-ink"
                  }`}
                  onClick={() => setActiveTab("requests")}
                >
                  Requests {receivedRequests.length > 0 && `(${receivedRequests.length})`}
                </button>
              </div>
            </div>

            <div className="p-6">
              {ridesError && (
                <p className="text-danger text-sm mb-4">{ridesError}</p>
              )}
              {actionError && <p className="text-danger text-sm mb-4">{actionError}</p>}

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
    </div>
  );
}
