"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function UnsavedChangesDialog({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  isSaving,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            Unsaved Changes
          </DialogTitle>
          <DialogDescription className="pt-2">
            You have unsaved changes in your post. Would you like to save them before leaving?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> If you don&apos;t save, your changes will be lost permanently.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDiscard}
            disabled={isSaving}
            className="flex-1"
          >
            Discard
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              "Save & Leave"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
