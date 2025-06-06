
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
  requireTyping?: boolean;
  confirmText?: string;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  requireTyping = true,
  confirmText = "delete"
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (requireTyping && inputValue.toLowerCase() !== confirmText.toLowerCase()) {
      setError(`Please type "${confirmText}" to confirm`);
      return;
    }
    onConfirm();
    setInputValue("");
    setError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setInputValue("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-destructive/10 p-3 rounded-md">
            <p className="text-sm font-medium text-destructive">
              This action will permanently delete:
            </p>
            <ul className="text-sm text-destructive mt-1 list-disc list-inside">
              <li>{itemName}</li>
              <li>All associated timetable data</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
          
          {requireTyping && (
            <div className="space-y-2">
              <Label htmlFor="confirm-input">
                Type <span className="font-mono font-bold">"{confirmText}"</span> to confirm:
              </Label>
              <Input
                id="confirm-input"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError("");
                }}
                placeholder={`Type "${confirmText}" here`}
                className={error ? "border-destructive" : ""}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={requireTyping && inputValue.toLowerCase() !== confirmText.toLowerCase()}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
