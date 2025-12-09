"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ScheduleDialogProps } from "./types";

export function ScheduleDialog({
  isOpen,
  onClose,
  onSchedule,
  isScheduling,
}: ScheduleDialogProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];
  
  // Get current time for minimum time if date is today
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const handleSchedule = () => {
    setError("");

    // Validation
    if (!date || !time) {
      setError("Please select both date and time");
      return;
    }

    // Combine date and time
    const scheduledDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    // Check if scheduled time is in the future
    if (scheduledDateTime <= now) {
      setError("Scheduled time must be in the future");
      return;
    }

    // Check if scheduled time is within reasonable range (not more than 1 year)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (scheduledDateTime > oneYearFromNow) {
      setError("Cannot schedule more than 1 year in advance");
      return;
    }

    // Convert to ISO string and call onSchedule
    onSchedule(scheduledDateTime.toISOString());
  };

  const handleClose = () => {
    if (!isScheduling) {
      setDate("");
      setTime("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule Post
          </DialogTitle>
          <DialogDescription>
            Choose when you want this post to be published
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Input */}
          <div className="space-y-2">
            <Label htmlFor="schedule-date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date
            </Label>
            <Input
              id="schedule-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              disabled={isScheduling}
              className="w-full"
            />
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <Label htmlFor="schedule-time" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time
            </Label>
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              min={date === today ? currentTime : undefined}
              disabled={isScheduling}
              className="w-full"
            />
          </div>

          {/* Timezone Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
            <p className="font-medium">Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            <p className="mt-1">
              Your post will be published at the selected time in your local timezone
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preview */}
          {date && time && !error && (
            <div className="bg-primary/5 p-3 rounded-md border border-primary/10">
              <p className="text-sm font-medium text-primary">
                Scheduled for:
              </p>
              <p className="text-sm mt-1">
                {new Date(`${date}T${time}`).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isScheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={isScheduling || !date || !time}
            className="bg-primary hover:bg-primary/90"
          >
            {isScheduling ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Scheduling...
              </>
            ) : (
              "Schedule Post"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
