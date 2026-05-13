import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface CanProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to wrap elements that require specific permissions.
 * Usage: <Can permission="members.add"> <button>Add Member</button> </Can>
 */
export default function Can({ permission, children, fallback = null }: CanProps) {
  const { permissions, isOwner } = useAuth();

  // Owners have all permissions
  if (isOwner) return <>{children}</>;

  // Check if staff has the specific permission
  if (permissions.includes(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * Utility function to check permissions programmatically.
 */
export function hasPermission(userPermissions: string[], permission: string, isOwner: boolean = false): boolean {
  if (isOwner) return true;
  return userPermissions.includes(permission);
}
