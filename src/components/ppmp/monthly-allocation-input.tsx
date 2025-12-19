/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface MonthlyAllocationInputProps {
  values: {
    jan?: number | null;
    feb?: number | null;
    march?: number | null;
    april?: number | null;
    may?: number | null;
    june?: number | null;
    july?: number | null;
    august?: number | null;
    sept?: number | null;
    oct?: number | null;
    nov?: number | null;
    dec?: number | null;
  };
  onChange: (values: MonthlyAllocationInputProps['values']) => void;
  totalCost?: number;
  disabled?: boolean;
}

const MONTHS = [
  { key: 'jan', label: 'January', short: 'Jan' },
  { key: 'feb', label: 'February', short: 'Feb' },
  { key: 'march', label: 'March', short: 'Mar' },
  { key: 'april', label: 'April', short: 'Apr' },
  { key: 'may', label: 'May', short: 'May' },
  { key: 'june', label: 'June', short: 'Jun' },
  { key: 'july', label: 'July', short: 'Jul' },
  { key: 'august', label: 'August', short: 'Aug' },
  { key: 'sept', label: 'September', short: 'Sep' },
  { key: 'oct', label: 'October', short: 'Oct' },
  { key: 'nov', label: 'November', short: 'Nov' },
  { key: 'dec', label: 'December', short: 'Dec' }
];

export function MonthlyAllocationInput({
  values,
  onChange,
  totalCost,
  disabled = false
}: MonthlyAllocationInputProps) {
  const handleChange = (month: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (numValue !== null && (isNaN(numValue) || numValue < 0)) {
      return;
    }
    onChange({
      ...values,
      [month]: numValue
    });
  };

  const calculateTotal = () => {
    return Object.values(values).reduce((sum: any, val: any) => sum + (val || 0), 0);
  };

  const allocatedTotal = calculateTotal() || 0;
  const remaining = totalCost ? totalCost - allocatedTotal : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle>Monthly Budget Allocation</CardTitle>
        </div>
        <CardDescription>
          Allocate budget across 12 months. Total: ₱{totalCost?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MONTHS.map((month) => (
            <div key={month.key} className="space-y-2">
              <Label htmlFor={month.key} className="text-sm font-medium">
                {month.short}
              </Label>
              <Input
                id={month.key}
                type="number"
                step="0.01"
                min="0"
                value={values[month.key as keyof typeof values] || ''}
                onChange={(e) => handleChange(month.key, e.target.value)}
                disabled={disabled}
                placeholder="0.00"
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Allocated Total:</span>
            <span className="font-medium">₱{allocatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {totalCost && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Remaining:</span>
              <span className={`font-medium ${remaining < 0 ? 'text-red-600' : remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                ₱{remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {totalCost && remaining !== 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              {remaining < 0 
                ? '⚠️ Allocation exceeds total cost' 
                : 'ℹ️ Some budget remains unallocated'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

