'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Link, Unlink, Search, DollarSign, FileText, Calendar } from 'lucide-react';

interface PPMPDisbursementLinkerProps {
  ppmpId: string;
  links: DisbursementLink[];
  onUpdate: () => void;
}

interface DisbursementLink {
  id: string;
  disbursement: {
    id: string;
    payee: string;
    amount: number;
    status: string;
    releaseDate?: string;
  };
}

interface DisbursementVoucher {
  id: string;
  payee: string;
  amount: number;
  status: string;
  releaseDate?: string;
  particulars: string;
  createdAt: string;
}

interface PPMPItem {
  id: string;
  itemNo: string;
  description: string;
  procurementMethod: string;
  totalCost: number;
}

export function PPMPDisbursementLinker({ ppmpId, links, onUpdate }: PPMPDisbursementLinkerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisbursement, setSelectedDisbursement] = useState<DisbursementVoucher | null>(null);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [availableDisbursements, setAvailableDisbursements] = useState<DisbursementVoucher[]>([]);
  const [ppmpItems, setPpmpItems] = useState<PPMPItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      fetchAvailableDisbursements();
      fetchPPMPItems();
    }
  }, [isDialogOpen]);

  const fetchAvailableDisbursements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/disbursements/search?q=${encodeURIComponent(searchTerm)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setAvailableDisbursements(data);
      }
    } catch (error) {
      console.error('Error fetching disbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPPMPItems = async () => {
    try {
      const response = await fetch(`/api/ppmp/${ppmpId}/items`);
      if (response.ok) {
        const data = await response.json();
        setPpmpItems(data);
      }
    } catch (error) {
      console.error('Error fetching PPMP items:', error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length >= 3) {
        fetchAvailableDisbursements();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleLink = async () => {
    if (!selectedDisbursement || !selectedItem) return;

    try {
      const response = await fetch(`/api/ppmp/${ppmpId}/link-disbursement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disbursementId: selectedDisbursement.id,
          ppmpItemId: selectedItem
        })
      });

      if (!response.ok) {
        throw new Error('Failed to link disbursement');
      }

      setIsDialogOpen(false);
      resetForm();
      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to link disbursement');
    }
  };

  const handleUnlink = async (linkId: string) => {
    if (!confirm('Are you sure you want to unlink this disbursement?')) return;

    try {
      const response = await fetch(`/api/ppmp/${ppmpId}/unlink-disbursement/${linkId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to unlink disbursement');
      }

      onUpdate();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to unlink disbursement');
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedDisbursement(null);
    setSelectedItem('');
    setAvailableDisbursements([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      DRAFT: "secondary",
      PENDING: "default",
      VALIDATED: "default",
      APPROVED: "default",
      RELEASED: "default",
      REJECTED: "destructive",
      CANCELLED: "destructive",
      RETURNED: "outline"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    );
  };

  const totalLinkedAmount = links.reduce((sum, link) => sum + link.disbursement.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Disbursement Links
            </CardTitle>
            <CardDescription>
              Connect PPMP items to disbursement vouchers for tracking
            </CardDescription>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Link Disbursement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Link Disbursement Voucher</DialogTitle>
                <DialogDescription>
                  Connect a disbursement voucher to a PPMP item for tracking and reporting.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Disbursement Vouchers</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by payee, particulars, or voucher ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {selectedDisbursement ? (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{selectedDisbursement.payee}</h4>
                          <p className="text-sm text-muted-foreground">{selectedDisbursement.particulars}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(selectedDisbursement.amount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(selectedDisbursement.createdAt)}
                            </span>
                            {getStatusBadge(selectedDisbursement.status)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDisbursement(null)}
                        >
                          <Unlink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    <Label>Available Disbursement Vouchers</Label>
                    {loading ? (
                      <div className="text-center py-4 text-muted-foreground">Searching...</div>
                    ) : availableDisbursements.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        {searchTerm.length < 3 ? 'Enter at least 3 characters to search' : 'No disbursements found'}
                      </div>
                    ) : (
                      <div className="max-h-48 overflow-y-auto border rounded-md">
                        {availableDisbursements.map((dv) => (
                          <div
                            key={dv.id}
                            className="p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedDisbursement(dv)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{dv.payee}</h4>
                                <p className="text-xs text-muted-foreground truncate">{dv.particulars}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs">
                                  <span>{formatCurrency(dv.amount)}</span>
                                  <span>{formatDate(dv.createdAt)}</span>
                                  {getStatusBadge(dv.status)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ppmpItem">Link to PPMP Item</Label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PPMP item" />
                    </SelectTrigger>
                    <SelectContent>
                      {ppmpItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.itemNo} - {item.description} ({formatCurrency(item.totalCost)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleLink}
                  disabled={!selectedDisbursement || !selectedItem}
                >
                  Link Disbursement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No disbursement links created yet.</p>
            <p className="text-sm mt-2">Link disbursement vouchers to track procurement spending.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Linked Disbursements</p>
                      <p className="text-2xl font-bold">{links.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-muted-foreground">Total Linked Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalLinkedAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Links Table */}
            <Card>
              <CardHeader>
                <CardTitle>Linked Disbursement Vouchers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payee</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Release Date</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{link.disbursement.payee}</p>
                            <p className="text-sm text-muted-foreground">ID: {link.disbursement.id}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(link.disbursement.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(link.disbursement.status)}</TableCell>
                        <TableCell>
                          {link.disbursement.releaseDate
                            ? formatDate(link.disbursement.releaseDate)
                            : 'Not released'
                          }
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {/* TODO: Add created date from link */}
                          -
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnlink(link.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Unlink className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
