"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  User,
  Users,
  Building2,
  FileText,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  type LucideProps,
} from "lucide-react"
import { authService, type User as UserType } from "@/lib/auth"
import { notificationService } from "@/lib/notifications"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { OfflineIndicator } from "@/components/system/offline-indicator"
import type { ForwardRefExoticComponent, RefAttributes } from "react"


interface NavItem {
  label: string
  href: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >
  roles: ("student" | "faculty" | "admin")[]
}


const navigationItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard/student",
        icon: User,
        roles: ["student"],
    },
    {
        label: "Dashboard",
        href: "/dashboard/faculty",
        icon: Users,
        roles: ["faculty"],
    },
    {
        label: "Dashboard",
        href: "/dashboard/admin",
        icon: Building2,
        roles: ["admin"],
    },
    {
        label: "Institution",
        href: "/dashboard/institution",
        icon: Building2,
        roles: ["admin"],
    },
    {
        label: "Portfolio",
        href: "/portfolio/generator",
        icon: FileText,
        roles: ["student", "faculty", "admin"],
    },
    {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        roles: ["faculty", "admin"],
    },
]

export function RoleBasedNav()
{
    const [user, setUser] = useState<UserType | null>(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNotifications, setShowNotifications] = useState(false)
    const pathname = usePathname()

    useEffect(() =>
    {
        const currentUser = authService.getCurrentUser()
        setUser(currentUser)

        if (currentUser)
        {
            // Update unread count
            const updateUnreadCount = () =>
            {
                setUnreadCount(notificationService.getUnreadCount(currentUser.id))
            }

            updateUnreadCount()

            // Subscribe to notification updates
            const unsubscribe = notificationService.subscribe(() =>
            {
                updateUnreadCount()
            })

            // Request notification permission
            notificationService.requestPermission()

            return unsubscribe
        }
    }, [])

    const handleLogout = () =>
    {
        authService.logout()
        window.location.href = "/"
    }
const getFilteredNavItems = React.useCallback(() => {
  if (!user) return []
  return navigationItems.filter((item) => item.roles.includes(user.role))
}, [user])


    const isActivePath = (href: string) =>
    {
        return pathname === href || pathname.startsWith(href + "/")
    }

    if (!user) return null

    return (
        <>
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo and Brand */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
                                <span className="text-xl font-semibold text-gray-900 dark:text-white">Beyond Record</span>
                            </Link>
                        </div>

                        {/* Navigation Items */}
                        <div className="hidden md:flex items-center space-x-4">
                            {getFilteredNavItems().map((item) =>
                            {
                                const Icon = item.icon
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={isActivePath(item.href) ? "default" : "ghost"}
                                            size="sm"
                                            className="flex items-center space-x-2"
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </Button>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Offline Indicator */}
                            <OfflineIndicator />

                            {/* User Role Badge */}
                            <Badge variant="outline" className="capitalize">
                                {user.role}
                            </Badge>

                            {/* Notifications */}
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="relative"
                                >
                                    <Bell className="h-4 w-4" />
                                    {unreadCount > 0 && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0"
                                        >
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </Badge>
                                    )}
                                </Button>
                            </div>

                            {/* Settings */}
                            <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                            </Button>

                            {/* User Info and Logout */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden pb-4">
                        <div className="flex flex-wrap gap-2">
                            {getFilteredNavItems().map((item) =>
                            {
                                const Icon = item.icon
                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={isActivePath(item.href) ? "default" : "outline"}
                                            size="sm"
                                            className="flex items-center space-x-2 bg-transparent"
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                        </Button>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Notification Center */}
            <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </>
    )
}
