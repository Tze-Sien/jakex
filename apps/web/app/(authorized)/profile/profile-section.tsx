"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  updateUserProfile,
  sendPasswordResetEmail,
  deleteUserAccount,
} from "@/lib/actions/profile";
import { User, Mail, KeyRound, Trash2 } from "lucide-react";
import { signOut } from "@repo/auth";
import { ROUTES } from "@/lib/constants";

interface ProfileSectionProps {
  profile: {
    id: string;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    status: string;
  };
}

export function ProfileSection({ profile: initialProfile }: ProfileSectionProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasNameChanged = fullName !== (profile.fullName || "");

  const getInitials = () => {
    if (profile.fullName) {
      return profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (profile.email) {
      return profile.email[0].toUpperCase();
    }
    return "U";
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      const result = await updateUserProfile({ fullName });

      if (result.success) {
        toast.success("Profile updated successfully");
        setProfile({ ...profile, fullName });
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred while updating profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setIsSendingReset(true);
    try {
      const result = await sendPasswordResetEmail();

      if (result.success) {
        toast.success("Password reset email sent! Check your inbox.");
      } else {
        toast.error(result.error || "Failed to send password reset email");
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred while sending reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserAccount();

      if (result.success) {
        toast.success("Account deleted successfully");
        // Sign out and redirect to login
        await signOut();
        window.location.href = ROUTES.LOGIN;
      } else {
        toast.error(result.error || "Failed to delete account");
        setIsDeleting(false);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An error occurred while deleting account");
      setIsDeleting(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName || "User"} />
              <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
            </Avatar>

          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="flex gap-2">
              <User className="h-4 w-4 mt-3 text-muted-foreground" />
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
              <Input
                id="email"
                value={profile.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. This is your login email.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateProfile} disabled={!hasNameChanged || isUpdating}>
            {isUpdating ? "Updating..." : "Update Profile"}
          </Button>
        </CardFooter>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password and account security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Reset your account password</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleSendPasswordReset}
                disabled={isSendingReset}
              >
                {isSendingReset ? "Sending..." : "Reset Password"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="destructive" disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    This will permanently delete your account and all associated data. This action
                    cannot be undone.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
