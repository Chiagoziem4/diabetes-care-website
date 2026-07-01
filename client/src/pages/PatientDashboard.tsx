import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Heart, Pill, TrendingUp, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch patient profile
  const { data: patientProfile, isLoading: profileLoading } = trpc.patient.profile.useQuery(undefined, {
    enabled: user?.role === "patient",
  });

  // Fetch health metrics
  const { data: bloodSugarMetrics, isLoading: metricsLoading } = trpc.healthMetrics.list.useQuery(
    { type: "blood_sugar", limit: 7 },
    { enabled: user?.role === "patient" }
  );

  // Fetch appointments
  const { data: appointments, isLoading: appointmentsLoading } = trpc.appointments.list.useQuery(undefined, {
    enabled: user?.role === "patient",
  });

  // Fetch notifications
  const { data: notifications } = trpc.notifications.list.useQuery(undefined, {
    enabled: user?.role === "patient",
  });

  // Fetch medications
  const { data: medications } = trpc.medications.list.useQuery(undefined, {
    enabled: user?.role === "patient",
  });

  if (user?.role !== "patient") {
    setLocation("/");
    return null;
  }

  // Calculate average blood sugar
  const avgBloodSugar =
    bloodSugarMetrics && bloodSugarMetrics.length > 0
      ? Math.round(
          bloodSugarMetrics.reduce((sum, m) => sum + (m.bloodSugarValue || 0), 0) / bloodSugarMetrics.length
        )
      : 0;

  // Calculate health score (mock calculation)
  const healthScore = Math.min(100, Math.max(0, 100 - Math.abs(avgBloodSugar - 120) / 2));

  // Prepare chart data
  const chartData = (bloodSugarMetrics || [])
    .slice()
    .reverse()
    .map((m) => ({
      time: new Date(m.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: m.bloodSugarValue || 0,
    }));

  // Get upcoming appointments
  const upcomingAppointments = (appointments || [])
    .filter((a) => new Date(a.scheduledDate) > new Date() && a.status !== "cancelled")
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 3);

  // Get unread notifications
  const unreadNotifications = (notifications || []).filter((n) => !n.isRead).length;

  // Get active medications
  const activeMedications = (medications || []).filter((m) => m.isActive).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Welcome, {user?.firstName || "Patient"}</h1>
          <p className="text-gray-600 mt-2">Here's your health overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Blood Sugar Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-red-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Blood Sugar</span>
            </div>
            {metricsLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">{avgBloodSugar}</p>
                <p className="text-sm text-gray-600 mt-1">mg/dL - {avgBloodSugar < 100 ? "Low" : avgBloodSugar < 140 ? "Normal" : "High"}</p>
              </>
            )}
          </Card>

          {/* Appointments Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Appointments</span>
            </div>
            {appointmentsLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                <p className="text-sm text-gray-600 mt-1">Upcoming</p>
              </>
            )}
          </Card>

          {/* Medications Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Pill className="w-8 h-8 text-green-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Medications</span>
            </div>
            {metricsLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">{activeMedications}</p>
                <p className="text-sm text-gray-600 mt-1">Active</p>
              </>
            )}
          </Card>

          {/* Health Score Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase">Health Score</span>
            </div>
            {metricsLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">{Math.round(healthScore)}</p>
                <p className="text-sm text-gray-600 mt-1">out of 100</p>
              </>
            )}
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Blood Sugar Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Blood Sugar Trend (7 Days)</h2>
              {metricsLoading ? (
                <Skeleton className="h-64" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 300]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} dot={{ fill: "#dc2626" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No blood sugar data yet</p>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => setLocation("/patient/health-tracking")}
                >
                  Log Metrics
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => setLocation("/patient/appointments")}
                >
                  Book Appointment
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => setLocation("/patient/medications")}
                >
                  Manage Medications
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => setLocation("/patient/messages")}
                >
                  Messages
                  {unreadNotifications > 0 && (
                    <span className="bg-red-600 text-white text-xs rounded-full px-2 py-1">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{apt.reason}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(apt.scheduledDate).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Type: {apt.type} | Status: <span className="font-medium">{apt.status}</span>
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notifications Alert */}
        {unreadNotifications > 0 && (
          <Card className="p-6 border-l-4 border-l-blue-600 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">You have {unreadNotifications} new notification(s)</h3>
                <p className="text-sm text-gray-600 mt-1">Check your notification center for updates</p>
              </div>
              <Button onClick={() => setLocation("/patient/notifications")}>View All</Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
