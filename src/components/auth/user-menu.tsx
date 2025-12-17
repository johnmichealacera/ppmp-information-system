'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Settings, Shield } from 'lucide-react';

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const { name, email, role, department } = session.user;

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      PPMP_PREPARER: 'PPMP Preparer',
      PPMP_APPROVER: 'PPMP Approver',
      PPMP_VIEWER: 'PPMP Viewer',
      ADMIN: 'Administrator',
      REQUESTER: 'Requester',
      ACCOUNTING: 'Accounting',
      BUDGET: 'Budget Officer',
      TREASURY: 'Treasury',
      MAYOR: 'Mayor',
      SECRETARY: 'Secretary',
      DEPARTMENT_HEAD: 'Department Head',
      FINANCE_HEAD: 'Finance Head',
      GSO: 'General Services',
      HR: 'Human Resources',
      BAC: 'Bids & Awards Committee',
      INSPECTORATE: 'Inspectorate'
    };
    return roleMap[role] || role;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {getInitials(name || email || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
            <div className="flex items-center pt-1">
              <Shield className="mr-1 h-3 w-3 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">
                {getRoleDisplayName(role)}
              </p>
            </div>
            {department && (
              <p className="text-xs text-muted-foreground">
                {department}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
