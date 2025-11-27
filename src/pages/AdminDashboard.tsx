import { useState, useEffect } from 'react'
import { useAuth } from '../core/authProvider'
import { adminAPI, UserRead } from '../core/adminAPI'
import Card from '../library/Card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Badge } from '../components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination'
import { Users, Trash2, Shield, AlertTriangle, Search, Power } from 'lucide-react'
import { toast } from 'react-toastify'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'

const AdminDashboard = () => {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<UserRead[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // Fixed items per page

  // Check if current user is admin
  const isAdmin = currentUser?.is_superuser === true;

  useEffect(() => {
    if (isAdmin) {
      fetchUsers()
    }
  }, [isAdmin])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await adminAPI.getUsers()
      setUsers(usersData)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    try {
      await adminAPI.updateUserStatus(userId, false);
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, is_active: !user.is_active } : user
        )
      );
      toast.success(
        `User ${user?.is_active ? "deactivated" : "activated"} successfully`
      );
    } catch (error) {
      console.error('Failed to toggle user:', error)
      toast.error(`Failed to ${user?.is_active ? "deactivate" : "activate"} user: ${(error as Error).message}`)
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await adminAPI.deleteUser(userId)
      setUsers(users.filter(user => user.id !== userId))
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error(`Failed to delete user: ${(error as Error).message}`)
    }
  }

  const formatCredit = (credit: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(credit / 100)
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.[0] || "";
    const last = lastName?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in to access this page.</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage user accounts, permissions, and access</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card title="User Management" icon={<Users size={22} />}>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-400 dark:border-gray-600">
                    <TableHead className="w-[300px]">User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => (
                    <TableRow className="border-gray-400 dark:border-gray-600" key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(user.first_name, user.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.first_name || user.last_name
                                ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                                : "Unknown User"}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={user.is_active ? "success" : "destructive"}
                            className="w-fit"
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.is_superuser ? "default" : "secondary"}
                        >
                          {user.is_superuser ? "Admin" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatCredit(user.total_credit)}
                          </div>
                          <div className="text-gray-600 dark:text-gray-300">
                            Used: {formatCredit(user.used_credit)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={user.is_active ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleToggleActive(user.id)}
                                  aria-label={user.is_active ? "Deactivate user" : "Activate user"}
                                >
                                  <Power className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{user.is_active ? "Deactivate user" : "Activate user"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <TooltipTrigger asChild>
                                    <Button variant="destructive" size="sm" aria-label="Delete user">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the user account for{" "}
                                  <span className="font-semibold">
                                    {user.email}
                                  </span>
                                  .
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                              </AlertDialog>
                              <TooltipContent>
                                <p>Delete user</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {filteredUsers.length === 0 
                          ? "No users match your search." 
                          : "No users on this page."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              )}

              {/* Pagination */}
              {filteredUsers.length > itemsPerPage && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                            }
                          }}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current page
                        const shouldShow = 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        if (!shouldShow) {
                          // Show ellipsis for gaps
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <PaginationItem key={`ellipsis-${page}`}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        }
                        
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                            }
                          }}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  {/* Pagination info */}
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card title="Total Users" icon={<Users size={20} />}>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600 mt-1">Registered users</div>
          </div>
        </Card>

        <Card title="Active Users" icon={<Shield size={20} />}>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {users.filter(user => user.is_active).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Currently active</div>
          </div>
        </Card>

        <Card title="Inactive Users" icon={<Power size={20} />}>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600">
              {users.filter(user => !user.is_active).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Not active</div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
