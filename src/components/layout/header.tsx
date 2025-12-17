'use client';

import { UserMenu } from '@/components/auth/user-menu';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FileText, BarChart3, CheckCircle, LogOut } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: BarChart3,
      current: true,
    },
    {
      name: 'PPMPs',
      href: '/ppmp/list',
      icon: FileText,
      current: false,
    },
    ...(session?.user?.role === 'PPMP_APPROVER' || session?.user?.role === 'ADMIN'
      ? [
          {
            name: 'Approvals',
            href: '/ppmp/approvals',
            icon: CheckCircle,
            current: false,
          },
        ]
      : []),
  ];

  if (!session) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                PPMP Information System
              </h1>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
