import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function HealthTracking() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [metricType, setMetricType] = useState<"blood_sugar" | "blood_pressure" | "weight" | "exercise" | "diet" | "hba1c">("blood_sugar");
  const [formData, setFormData] = useState({
    bloodSugarValue: "",
    bloodSugarMeasurementTime: "random" as const,
    bpSystolic: "",
    bpDiastolic: "",
    bpPulse: "",
    weightValue: "",
    exerciseActivityType: "",
    exerciseDurationMinutes: "",
    exerciseIntensity: "moderate" as const,
    dietMeal: "breakfast" as const,
    dietDescription: "",
    hba1cValue: "",
    notes: "",
  });

  const { data: metrics, isLoading: metricsLoading } = trpc.healthMetrics.list.useQuery({ type: metricType });
  const createMetricMutation = trpc.healthMetrics.create.useMutation({
    onSuccess: () => {
      toast.success("Health metric recorded successfully!");
      setFormData({
        bloodSugarValue: "",
        bloodSugarMeasurementTime: "random",
        bpSystolic: "",
        bpDiastolic: "",
        bpPulse: "",
        weightValue: "",
        exerciseActivityType: "",
        exerciseDurationMinutes: "",
        exerciseIntensity: "moderate",
        dietMeal: "breakfast",
        dietDescription: "",
        hba1cValue: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record metric");
    },
  });

  if (!user || user.role !== "patient") {
    setLocation("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      type: metricType,
    };

    if (metricType === "blood_sugar") {
      payload.bloodSugarValue = parseInt(formData.bloodSugarValue);
      payload.bloodSugarMeasurementTime = formData.bloodSugarMeasurementTime;
    } else if (metricType === "blood_pressure") {
      payload.bpSystolic = parseInt(formData.bpSystolic);
      payload.bpDiastolic = parseInt(formData.bpDiastolic);
      payload.bpPulse = parseInt(formData.bpPulse);
    } else if (metricType === "weight") {
      payload.weightValue = parseFloat(formData.weightValue);
    } else if (metricType === "exercise") {
      payload.exerciseActivityType = formData.exerciseActivityType;
      payload.exerciseDurationMinutes = parseInt(formData.exerciseDurationMinutes);
      payload.exerciseIntensity = formData.exerciseIntensity;
    } else if (metricType === "diet") {
      payload.dietMeal = formData.dietMeal;
      payload.dietDescription = formData.dietDescription;
    } else if (metricType === "hba1c") {
      payload.hba1cValue = parseFloat(formData.hba1cValue);
    }

    if (formData.notes) {
      payload.notes = formData.notes;
    }

    createMetricMutation.mutate(payload);
  };

  // Get risk level color
  const getRiskColor = (type: string, value: number) => {
    if (type === "blood_sugar") {
      if (value < 70) return "text-blue-600 bg-blue-50";
      if (value < 100) return "text-green-600 bg-green-50";
      if (value < 140) return "text-yellow-600 bg-yellow-50";
      return "text-red-600 bg-red-50";
    }
    return "text-gray-600 bg-gray-50";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Health Metrics Tracking</h1>
          <p className="text-gray-600 mt-2">Log and monitor your daily health data</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Log New Metric</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Metric Type */}
                <div>
                  <Label htmlFor="metricType" className="text-sm font-medium text-gray-700">
                    Metric Type
                  </Label>
                  <Select value={metricType} onValueChange={(value: any) => setMetricType(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood_sugar">Blood Sugar</SelectItem>
                      <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="diet">Diet</SelectItem>
                      <SelectItem value="hba1c">HbA1c</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Blood Sugar Fields */}
                {metricType === "blood_sugar" && (
                  <>
                    <div>
                      <Label htmlFor="bloodSugarValue" className="text-sm font-medium text-gray-700">
                        Blood Sugar (mg/dL)
                      </Label>
                      <Input
                        id="bloodSugarValue"
                        type="number"
                        value={formData.bloodSugarValue}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bloodSugarValue: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bloodSugarMeasurementTime" className="text-sm font-medium text-gray-700">
                        Measurement Time
                      </Label>
                      <Select
                        value={formData.bloodSugarMeasurementTime}
                        onValueChange={(value: any) => setFormData((prev) => ({ ...prev, bloodSugarMeasurementTime: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fasting">Fasting</SelectItem>
                          <SelectItem value="before_meal">Before Meal</SelectItem>
                          <SelectItem value="after_meal">After Meal</SelectItem>
                          <SelectItem value="bedtime">Bedtime</SelectItem>
                          <SelectItem value="random">Random</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Blood Pressure Fields */}
                {metricType === "blood_pressure" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bpSystolic" className="text-sm font-medium text-gray-700">
                          Systolic
                        </Label>
                        <Input
                          id="bpSystolic"
                          type="number"
                          value={formData.bpSystolic}
                          onChange={(e) => setFormData((prev) => ({ ...prev, bpSystolic: e.target.value }))}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bpDiastolic" className="text-sm font-medium text-gray-700">
                          Diastolic
                        </Label>
                        <Input
                          id="bpDiastolic"
                          type="number"
                          value={formData.bpDiastolic}
                          onChange={(e) => setFormData((prev) => ({ ...prev, bpDiastolic: e.target.value }))}
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bpPulse" className="text-sm font-medium text-gray-700">
                        Pulse
                      </Label>
                      <Input
                        id="bpPulse"
                        type="number"
                        value={formData.bpPulse}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bpPulse: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                {/* Weight Field */}
                {metricType === "weight" && (
                  <div>
                    <Label htmlFor="weightValue" className="text-sm font-medium text-gray-700">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weightValue"
                      type="number"
                      step="0.1"
                      value={formData.weightValue}
                      onChange={(e) => setFormData((prev) => ({ ...prev, weightValue: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Exercise Fields */}
                {metricType === "exercise" && (
                  <>
                    <div>
                      <Label htmlFor="exerciseActivityType" className="text-sm font-medium text-gray-700">
                        Activity Type
                      </Label>
                      <Input
                        id="exerciseActivityType"
                        value={formData.exerciseActivityType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, exerciseActivityType: e.target.value }))}
                        placeholder="e.g., Walking, Running"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exerciseDurationMinutes" className="text-sm font-medium text-gray-700">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="exerciseDurationMinutes"
                        type="number"
                        value={formData.exerciseDurationMinutes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, exerciseDurationMinutes: e.target.value }))}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exerciseIntensity" className="text-sm font-medium text-gray-700">
                        Intensity
                      </Label>
                      <Select
                        value={formData.exerciseIntensity}
                        onValueChange={(value: any) => setFormData((prev) => ({ ...prev, exerciseIntensity: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Diet Fields */}
                {metricType === "diet" && (
                  <>
                    <div>
                      <Label htmlFor="dietMeal" className="text-sm font-medium text-gray-700">
                        Meal Type
                      </Label>
                      <Select
                        value={formData.dietMeal}
                        onValueChange={(value: any) => setFormData((prev) => ({ ...prev, dietMeal: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dietDescription" className="text-sm font-medium text-gray-700">
                        Description
                      </Label>
                      <Textarea
                        id="dietDescription"
                        value={formData.dietDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dietDescription: e.target.value }))}
                        placeholder="What did you eat?"
                        required
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                {/* HbA1c Field */}
                {metricType === "hba1c" && (
                  <div>
                    <Label htmlFor="hba1cValue" className="text-sm font-medium text-gray-700">
                      HbA1c (%)
                    </Label>
                    <Input
                      id="hba1cValue"
                      type="number"
                      step="0.1"
                      value={formData.hba1cValue}
                      onChange={(e) => setFormData((prev) => ({ ...prev, hba1cValue: e.target.value }))}
                      required
                      className="mt-1"
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional notes"
                    className="mt-1"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full mt-6"
                  disabled={createMetricMutation.isPending}
                >
                  {createMetricMutation.isPending ? "Recording..." : "Record Metric"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Metrics History */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Readings</h2>

              {metricsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : metrics && metrics.length > 0 ? (
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className={`border rounded-lg p-4 ${getRiskColor(metric.type, metric.bloodSugarValue || 0)}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {metric.type === "blood_sugar" && `${metric.bloodSugarValue} mg/dL`}
                            {metric.type === "blood_pressure" && `${metric.bpSystolic}/${metric.bpDiastolic} mmHg`}
                            {metric.type === "weight" && `${metric.weightValue} kg`}
                            {metric.type === "exercise" && `${metric.exerciseActivityType} - ${metric.exerciseDurationMinutes} min`}
                            {metric.type === "diet" && `${metric.dietMeal}`}
                            {metric.type === "hba1c" && `${metric.hba1cValue}%`}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(metric.recordedAt).toLocaleString()}
                          </p>
                          {metric.notes && (
                            <p className="text-sm text-gray-600 mt-2">{metric.notes}</p>
                          )}
                        </div>
                        <TrendingUp className="w-5 h-5 opacity-50" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-gray-600">No {metricType.replace("_", " ")} readings yet</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
