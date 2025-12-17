'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, FileText, Building, Calendar, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Department {
  id: string;
  name: string;
  code?: string;
}

const STEPS = [
  { id: 'basic', title: 'Basic Information', icon: FileText },
  { id: 'department', title: 'Department & Year', icon: Building },
  { id: 'budget', title: 'Budget Planning', icon: DollarSign },
  { id: 'review', title: 'Review & Create', icon: Check }
];

export function PPMPCreationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    fiscalYear: new Date().getFullYear().toString(),
    departmentId: '',
    totalEstimatedBudget: '',
    totalAllocatedBudget: '',
    description: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 0: // Basic Information
        return formData.title.trim().length > 0;
      case 1: // Department & Year
        return formData.departmentId && formData.fiscalYear;
      case 2: // Budget Planning
        return formData.totalEstimatedBudget && formData.totalAllocatedBudget;
      case 3: // Review & Create
        return true;
      default:
        return false;
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ppmp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          fiscalYear: parseInt(formData.fiscalYear),
          departmentId: formData.departmentId,
          totalEstimatedBudget: parseFloat(formData.totalEstimatedBudget),
          totalAllocatedBudget: parseFloat(formData.totalAllocatedBudget)
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create PPMP');
      }

      const ppmp = await response.json();
      router.push(`/ppmp/${ppmp.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create PPMP');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(num);
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / STEPS.length) * 100;
  };

  const selectedDepartment = departments.find(d => d.id === formData.departmentId);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide the basic details for your PPMP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">PPMP Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Q1 2025 Procurement Plan for Office Supplies"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Give your PPMP a descriptive title that clearly identifies its purpose
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the procurement objectives..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        );

      case 1: // Department & Year
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Department & Fiscal Year
              </CardTitle>
              <CardDescription>
                Select the department and fiscal year for this PPMP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.departmentId} onValueChange={(value) => updateFormData('departmentId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} {dept.code && `(${dept.code})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  You can only create PPMPs for your assigned department
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYear">Fiscal Year *</Label>
                <Select value={formData.fiscalYear} onValueChange={(value) => updateFormData('fiscalYear', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fiscal year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Budget Planning
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Budget Planning
              </CardTitle>
              <CardDescription>
                Set the estimated and allocated budget amounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="estimated">Total Estimated Budget *</Label>
                  <Input
                    id="estimated"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.totalEstimatedBudget}
                    onChange={(e) => updateFormData('totalEstimatedBudget', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Total estimated cost of all procurement items
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allocated">Total Allocated Budget *</Label>
                  <Input
                    id="allocated"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.totalAllocatedBudget}
                    onChange={(e) => updateFormData('totalAllocatedBudget', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Approved budget allocation from COA
                  </p>
                </div>
              </div>

              {formData.totalEstimatedBudget && formData.totalAllocatedBudget && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Budget Variance:</span>
                    <span className={`font-bold ${
                      parseFloat(formData.totalAllocatedBudget) >= parseFloat(formData.totalEstimatedBudget)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {formatCurrency((parseFloat(formData.totalAllocatedBudget) - parseFloat(formData.totalEstimatedBudget)).toString())}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3: // Review & Create
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                Review & Create
              </CardTitle>
              <CardDescription>
                Review your PPMP details before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Title:</span>
                  <span>{formData.title}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Department:</span>
                  <span>{selectedDepartment?.name || 'Not selected'}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Fiscal Year:</span>
                  <span>{formData.fiscalYear}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Estimated Budget:</span>
                  <span className="font-mono">{formatCurrency(formData.totalEstimatedBudget)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Allocated Budget:</span>
                  <span className="font-mono">{formatCurrency(formData.totalAllocatedBudget)}</span>
                </div>

                {formData.description && (
                  <div className="py-2 border-b">
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 text-sm text-muted-foreground">{formData.description}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">What happens next?</h4>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• PPMP will be created in DRAFT status</li>
                      <li>• You can add procurement items and activities</li>
                      <li>• Submit for approval when ready</li>
                      <li>• Approved PPMPs can be linked to disbursements</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="hidden sm:block w-12 h-0.5 bg-muted mx-4" />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex justify-between max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/ppmp')}>
            Cancel
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button
              onClick={handleCreate}
              disabled={loading || !isStepValid(currentStep)}
              className="min-w-32"
            >
              {loading ? 'Creating...' : 'Create PPMP'}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
