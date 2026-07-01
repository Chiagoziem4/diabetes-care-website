import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Activity, Users, Brain, Bell, FileText, BarChart3, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DiabetesCare</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-600">Welcome, {user?.firstName || "User"}</span>
                {user?.role === "patient" && (
                  <Button onClick={() => setLocation("/patient/dashboard")} variant="default">
                    Dashboard
                  </Button>
                )}
                {user?.role === "doctor" && (
                  <Button onClick={() => setLocation("/doctor/dashboard")} variant="default">
                    Dashboard
                  </Button>
                )}
                {user?.role === "admin" && (
                  <Button onClick={() => setLocation("/admin/dashboard")} variant="default">
                    Admin Panel
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setLocation("/login")}>
                  Sign In
                </Button>
                <Button onClick={() => setLocation("/register")}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Smart Diabetes Management for Better Health
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with healthcare providers, track your health metrics, and get AI-powered insights to manage your diabetes effectively.
            </p>
            <div className="flex gap-4">
              {!isAuthenticated && (
                <>
                  <Button size="lg" onClick={() => setLocation("/register")}>
                    Start Free Trial
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setLocation("/login")}>
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-teal-400 rounded-3xl blur-3xl opacity-20"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Blood Sugar</p>
                    <p className="text-sm text-gray-600">125 mg/dL - Normal</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Activity className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Exercise</p>
                    <p className="text-sm text-gray-600">45 min - Moderate</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Health Score</p>
                    <p className="text-sm text-gray-600">82/100 - Excellent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
          Comprehensive Health Management
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Heart className="w-8 h-8 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Tracking</h3>
            <p className="text-gray-600">Log blood sugar, BP, weight, exercise, diet, and HbA1c with color-coded risk levels</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Users className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Doctor Network</h3>
            <p className="text-gray-600">Connect with specialists, book appointments, and receive personalized medical guidance</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Brain className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant</h3>
            <p className="text-gray-600">Get real-time blood sugar analysis and personalized health recommendations</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Bell className="w-8 h-8 text-orange-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Reminders</h3>
            <p className="text-gray-600">Never miss medication or appointments with intelligent notification system</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <BarChart3 className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">View detailed health trends and generate comprehensive PDF reports</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <FileText className="w-8 h-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messaging</h3>
            <p className="text-gray-600">Secure communication with your healthcare team anytime, anywhere</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Activity className="w-8 h-8 text-cyan-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointments</h3>
            <p className="text-gray-600">Book in-person or telemedicine appointments with flexible scheduling</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <Lock className="w-8 h-8 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-gray-600">Enterprise-grade encryption protects your sensitive health data</p>
          </Card>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
          Built for Everyone
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-8 border-2 border-blue-200 bg-blue-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Patients</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Track daily health metrics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Connect with doctors
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Manage medications
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Get AI health insights
              </li>
            </ul>
            {!isAuthenticated && (
              <Button className="w-full mt-6" onClick={() => setLocation("/register")}>
                Sign Up as Patient
              </Button>
            )}
          </Card>

          <Card className="p-8 border-2 border-green-200 bg-green-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Doctors</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Manage patient list
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Review health metrics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Schedule appointments
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                Add medical notes
              </li>
            </ul>
            {!isAuthenticated && (
              <Button className="w-full mt-6" onClick={() => setLocation("/register")}>
                Sign Up as Doctor
              </Button>
            )}
          </Card>

          <Card className="p-8 border-2 border-purple-200 bg-purple-50">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">For Admins</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                User management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Platform analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                System monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                Account activation
              </li>
            </ul>
            <Button className="w-full mt-6" disabled>
              Admin Access Only
            </Button>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Take Control of Your Health?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of patients and doctors using DiabetesCare for better health management.
          </p>
          {!isAuthenticated && (
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => setLocation("/register")}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => setLocation("/login")}>
                Sign In
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2026 DiabetesCare. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </div>
  );
}
