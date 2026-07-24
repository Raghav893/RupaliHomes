"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Trash2, Mail, RefreshCw, Plus, UserPlus, X, Eye, EyeOff } from "lucide-react";
import { fetchAdmins, deleteAdmin, createAdmin } from "@/lib/api";
import { Admin } from "@/types";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { isSuperAdmin } = useAdminAuth();

  // Add Admin form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAdmins();
    setAdmins(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    setDeletingId(id);
    const success = await deleteAdmin(id);
    if (success) {
      setAdmins((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert("Failed to delete admin.");
    }
    setDeletingId(null);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError("All fields are required.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setCreating(true);
    const success = await createAdmin(formData);
    if (success) {
      setFormData({ name: "", email: "", password: "" });
      setShowAddForm(false);
      setShowPassword(false);
      await loadData();
    } else {
      setFormError("Failed to create admin. Email may already be registered.");
    }
    setCreating(false);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold font-syne text-accent-dark">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only Super Admins can access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-syne text-accent-dark flex items-center gap-2">
            <Shield className="text-gold" /> Admin Management
          </h1>
          <p className="text-gray-500 mt-1">Manage system administrators.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="gap-2 bg-accent-dark hover:bg-accent-dark/90 text-white"
          >
            <UserPlus size={16} />
            Add Admin
          </Button>
        </div>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <Card className="border-gold/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserPlus size={20} className="text-gold" />
                Add New Admin
              </CardTitle>
              <CardDescription>
                Create a new administrator account. Only Super Admins can perform this action.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowAddForm(false);
                setFormError("");
                setFormData({ name: "", email: "", password: "" });
                setShowPassword(false);
              }}
              className="shrink-0"
            >
              <X size={18} />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-sm"
                    disabled={creating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-sm"
                    disabled={creating}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min. 6 characters"
                      className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-all text-sm"
                      disabled={creating}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-500 font-medium">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError("");
                    setFormData({ name: "", email: "", password: "" });
                    setShowPassword(false);
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="gap-2 bg-gold hover:bg-gold-hover text-white"
                >
                  {creating ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Create Admin
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Administrators</CardTitle>
          <CardDescription>
            {admins.length} total admins in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 flex justify-center">
              <RefreshCw className="animate-spin text-gray-400 w-8 h-8" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>No admins found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-1 divide-y divide-gray-200">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <div className={`p-2 rounded-full ${admin.role === 'SUPER_ADMIN' ? 'bg-gold/20 text-gold' : 'bg-blue-100 text-blue-600'}`}>
                          <Shield size={20} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-accent-dark">
                            {admin.email}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${admin.role === 'SUPER_ADMIN' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                            {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail size={14} /> {admin.email}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Created: {new Date(admin.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 flex items-center gap-2 w-full md:w-auto">
                      {admin.role !== 'SUPER_ADMIN' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full md:w-auto gap-2"
                          onClick={() => handleDelete(admin.id)}
                          disabled={deletingId === admin.id}
                        >
                          <Trash2 size={14} />
                          {deletingId === admin.id ? "Removing..." : "Remove"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
