'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Calendar, Clock, CheckCircle, AlertTriangle, PlayCircle } from 'lucide-react';

interface ProcurementScheduleProps {
  ppmpId: string;
  activities: ProcurementActivity[];
  canEdit: boolean;
  onUpdate: () => void;
}

interface ProcurementActivity {
  id: string;
  activity: string;
  startDate: string;
  endDate: string;
  responsibleUnit: string;
  status: string;
  ppmpItemId?: string;
  ppmpItem?: {
    id: string;
    itemNo: string;
    description: string;
  };
}

const STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Planned', icon: Clock, color: 'text-blue-600' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: PlayCircle, color: 'text-orange-600' },
  { value: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'text-green-600' },
  { value: 'DELAYED', label: 'Delayed', icon: AlertTriangle, color: 'text-red-600' },
  { value: 'CANCELLED', label: 'Cancelled', icon: AlertTriangle, color: 'text-gray-600' }
];

const RESPONSIBLE_UNITS = [
  'BAC (Bids and Awards Committee)',
  'Accounting Department',
  'Budget Department',
  'GSO (General Services Office)',
  'End-User Department',
  'Legal Department',
  'Mayor\'s Office',
  'Treasury Department'
];

export function ProcurementSchedule({ ppmpId, activities, canEdit, onUpdate }: ProcurementScheduleProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ProcurementActivity | null>(null);
  const [formData, setFormData] = useState({
    activity: '',
    startDate: '',
    endDate: '',
    responsibleUnit: '',
    status: 'PLANNED',
    ppmpItemId: ''
  });

  const resetForm = () => {
    setFormData({
      activity: '',
      startDate: '',
      endDate: '',
      responsibleUnit: '',
      status: 'PLANNED',
      ppmpItemId: ''
    });
    setEditingActivity(null);
  };

  const openDialog = (activity?: ProcurementActivity) => {
    if (activity) {
      setEditingActivity(activity);
      setFormData({
        activity: activity.activity,
        startDate: activity.startDate.split('T')[0],
        endDate: activity.endDate.split('T')[0],
        responsibleUnit: activity.responsibleUnit,
        status: activity.status,
        ppmpItemId: activity.ppmpItemId || ''
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      activity: formData.activity,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      responsibleUnit: formData.responsibleUnit,
      status: formData.status,
      ...(formData.ppmpItemId && { ppmpItemId: formData.ppmpItemId })
    };

    try {
      const url = editingActivity
        ? `/api/ppmp/${ppmpId}/activities/${editingActivity.id}`
        : `/api/ppmp/${ppmpId}/activities`;

      const response = await fetch(url, {
        method: editingActivity ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to save activity');
      }

      closeDialog();
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save activity');
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const response = await fetch(`/api/ppmp/${ppmpId}/activities/${activityId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete activity');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    if (!statusConfig) return <Badge variant="outline">{status}</Badge>;

    const Icon = statusConfig.icon;
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${statusConfig.color}`}>
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getDaysUntil = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-orange-600' };
    return { text: `${diffDays} days remaining`, color: 'text-green-600' };
  };

  const isOverdue = (endDate: string, status: string) => {
    if (status === 'COMPLETED' || status === 'CANCELLED') return false;
    const targetDate = new Date(endDate);
    const today = new Date();
    return targetDate < today;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Procurement Schedule
            </CardTitle>
            <CardDescription>
              Timeline and activities for procurement processes
            </CardDescription>
          </div>
          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingActivity ? 'Edit Procurement Activity' : 'Add Procurement Activity'}
                    </DialogTitle>
                    <DialogDescription>
                      Define the procurement activity details and timeline.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="activity">Activity Description</Label>
                      <Textarea
                        id="activity"
                        value={formData.activity}
                        onChange={(e) => setFormData(prev => ({ ...prev, activity: e.target.value }))}
                        placeholder="Describe the procurement activity"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="responsibleUnit">Responsible Unit</Label>
                      <Select value={formData.responsibleUnit} onValueChange={(value) => setFormData(prev => ({ ...prev, responsibleUnit: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select responsible unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {RESPONSIBLE_UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ppmpItemId">Related Item (Optional)</Label>
                      <Select value={formData.ppmpItemId || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, ppmpItemId: value === 'none' ? '' : value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select related item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No related item</SelectItem>
                          {/* TODO: Fetch and display PPMP items */}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingActivity ? 'Update Activity' : 'Add Activity'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No procurement activities scheduled yet.</p>
            {canEdit && (
              <p className="text-sm mt-2">Click &quot;Add Activity&quot; to create a schedule.</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Timeline view */}
            <div className="space-y-4">
              {activities
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{activity.activity}</h4>
                          {activity.ppmpItem && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Related to: {activity.ppmpItem.itemNo} - {activity.ppmpItem.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                            </span>
                            <span>{activity.responsibleUnit}</span>
                            <span className={getDaysUntil(activity.endDate).color}>
                              {getDaysUntil(activity.endDate).text}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {getStatusBadge(activity.status)}
                          {canEdit && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDialog(activity)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(activity.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {activities.filter(a => a.status === 'PLANNED').length}
                </div>
                <div className="text-xs text-muted-foreground">Planned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {activities.filter(a => a.status === 'IN_PROGRESS').length}
                </div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {activities.filter(a => a.status === 'COMPLETED').length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {activities.filter(a => a.status === 'DELAYED' || isOverdue(a.endDate, a.status)).length}
                </div>
                <div className="text-xs text-muted-foreground">Overdue/Delayed</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
