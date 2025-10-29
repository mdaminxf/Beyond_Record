"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  GraduationCap,
  Calendar,
  TrendingUp,
  Award,
  FileText,
  Clock,
  Target,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react"
import { toast } from "react-hot-toast"
import { authService } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { EditProfileModal } from "./edit-profile-modal"
import { CourseEnrollmentModal } from "./course-enrollment-modal"
import { AchievementUploadModal } from "./achievement-upload-modal"



export function StudentDashboard() {
  const [user, setUser] = useState(authService.getCurrentUser())
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showCourseEnrollment, setShowCourseEnrollment] = useState(false)
  const [showAchievementUpload, setShowAchievementUpload] = useState(false)
  const [previousAchievements, setPreviousAchievements] = useState<any>(null)
  const router = useRouter()

  // Fetch student profile data
  const fetchStudentData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)
      const data = await authService.getStudentProfile()
      
      // Check for achievement updates
      if (!showLoading && previousAchievements && studentData) {
        const newVerified = data.achievements?.length > (previousAchievements.achievements?.length || 0)
        const newPending = data.pendingAchievements?.length > (previousAchievements.pendingAchievements?.length || 0)
        
        if (newVerified) {
          toast.success('✅ New achievement verified!', { duration: 4000 })
        }
        if (newPending) {
          toast.info('📋 New achievement submitted for review', { duration: 4000 })
        }
        
        // Check for status changes
        const previousPending = previousAchievements.pendingAchievements || []
        const currentPending = data.pendingAchievements || []
        
        previousPending.forEach((prev: any) => {
          const current = currentPending.find((curr: any) => curr._id === prev._id)
          if (current && current.status !== prev.status) {
            if (current.status === 'verified') {
              toast.success(`🎉 "${current.title}" has been verified!`, { duration: 5000 })
            } else if (current.status === 'rejected') {
              toast.error(`❌ "${current.title}" was not approved`, { duration: 5000 })
            }
          }
        })
      }
      
      setPreviousAchievements({ achievements: data.achievements, pendingAchievements: data.pendingAchievements })
      setStudentData(data)
    } catch (err) {
      console.error('Failed to fetch student data:', err)
      
      // Handle different types of errors more gracefully
      if (err instanceof Error) {
        if (err.message.includes('Unauthorized') || err.message.includes('403')) {
          console.log('Authentication error, redirecting to login')
          authService.logout()
          router.push('/auth/login')
          return
        }
      }
      
      // For background updates, don't show error state
      if (!showLoading) {
        console.warn('Background fetch failed (retrying on next poll):', err)
        return
      }
      
      // Only set error state for initial load failures
      setError('Failed to load student data. Please try again.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Initial data fetch and setup polling
  useEffect(() => {
    if (user) {
      fetchStudentData()
      
      // Set up polling for real-time updates every 5 seconds
      const interval = setInterval(() => {
        fetchStudentData(false) // Don't show loading spinner for background updates
      }, 5000)
      
      return () => clearInterval(interval)
    } else {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleLogout = () => {
    authService.logout()
    router.push("/")
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays > 0) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Show message if no data
  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">No student data found. Please contact support.</p>
          <Button onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {user?.institution || 'Demo University'}
              </Badge>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Quick Stats */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage
                    src={studentData.profile.avatar || "/placeholder.svg"}
                    alt={studentData.profile.name}
                  />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{studentData.profile.name}</CardTitle>
                <CardDescription>
                  {studentData.profile.major} • {studentData.profile.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Student ID</p>
                    <p className="font-medium">{studentData.profile.studentId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">GPA</p>
                    <p className="font-medium">{studentData.profile.gpa}</p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-transparent" 
                  variant="outline"
                  onClick={() => setShowEditProfile(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Progress Ring */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - studentData.progress.overall / 100)}`}
                        className="text-blue-600 transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">{studentData.progress.overall}%</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">Semester completion</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{studentData.stats.completedCourses}</p>
                    <p className="text-sm text-muted-foreground">Completed Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{studentData.stats.totalCredits}</p>
                    <p className="text-sm text-muted-foreground">Total Credits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{studentData.stats.currentGPA}</p>
                    <p className="text-sm text-muted-foreground">Current GPA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">#{studentData.stats.rank}</p>
                    <p className="text-sm text-muted-foreground">Class Rank</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Current Courses
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCourseEnrollment(true)}
                >
                  Enroll in Courses
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {studentData.progress.courses.map((course: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{course.name}</span>
                      <Badge variant="outline">{course.grade}</Badge>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <p className="text-sm text-muted-foreground">{course.progress}% complete</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tabs for Deadlines, Activity, Achievements */}
            <Tabs defaultValue="deadlines" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="deadlines">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentData.upcomingDeadlines.map((deadline: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{deadline.title}</h4>
                          <p className="text-sm text-muted-foreground">{deadline.course}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityColor(deadline.priority)}>{deadline.priority}</Badge>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatDate(deadline.dueDate)}</p>
                            <p className="text-xs text-muted-foreground">{deadline.dueDate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {studentData.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.course}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Award className="mr-2 h-5 w-5" />
                        Achievements Timeline
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => fetchStudentData(false)}
                          className="text-xs"
                        >
                          🔄 Refresh
                        </Button>
                        <Button variant="outline" onClick={() => setShowAchievementUpload(true)} className="bg-transparent">
                          Submit Achievement
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Verified Achievements */}
                    {studentData.achievements && studentData.achievements.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="font-medium text-green-700 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verified Achievements
                        </h5>
                        {studentData.achievements.map((achievement: any, index: number) => (
                          <div key={`verified-${index}`} className="flex items-start space-x-4 p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                              <Award className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{achievement.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">{achievement.date}</p>
                                {achievement.verifiedBy && (
                                  <p className="text-xs text-green-600">Verified by: {achievement.verifiedBy}</p>
                                )}
                              </div>
                              {achievement.evidenceUrl && (
                                <a href={achievement.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center mt-1">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View evidence
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pending Achievements */}
                    {studentData.pendingAchievements && studentData.pendingAchievements.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="font-medium text-yellow-700 flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Pending Verification ({studentData.pendingAchievements.filter((a: any) => a.status === 'pending').length})
                        </h5>
                        {studentData.pendingAchievements.filter((achievement: any) => achievement.status === 'pending').map((achievement: any, index: number) => (
                          <div key={`pending-${index}`} className="flex items-start space-x-4 p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                              <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{achievement.title}</h4>
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pending Review
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{achievement.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">{achievement.date}</p>
                                <p className="text-xs text-yellow-600">Submitted: {new Date(achievement.submittedAt).toLocaleDateString()}</p>
                              </div>
                              {achievement.evidenceFiles && achievement.evidenceFiles.length > 0 && (
                                <div className="mt-1">
                                  {achievement.evidenceFiles.map((file: any, fileIndex: number) => (
                                    <a key={fileIndex} href={file.filename} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center">
                                      <Eye className="h-3 w-3 mr-1" />
                                      {file.originalName}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Rejected Achievements */}
                        {studentData.pendingAchievements.filter((achievement: any) => achievement.status === 'rejected').length > 0 && (
                          <div className="space-y-4">
                            <h5 className="font-medium text-red-700 flex items-center">
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejected ({studentData.pendingAchievements.filter((a: any) => a.status === 'rejected').length})
                            </h5>
                            {studentData.pendingAchievements.filter((achievement: any) => achievement.status === 'rejected').map((achievement: any, index: number) => (
                              <div key={`rejected-${index}`} className="flex items-start space-x-4 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                                  <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">{achievement.title}</h4>
                                    <Badge variant="destructive">
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Rejected
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                  {achievement.reviewComments && (
                                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/50 rounded text-sm">
                                      <p className="font-medium text-red-800 dark:text-red-200">Review Comments:</p>
                                      <p className="text-red-700 dark:text-red-300">{achievement.reviewComments}</p>
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">{achievement.date}</p>
                                    {achievement.reviewedBy && (
                                      <p className="text-xs text-red-600">Reviewed by: {achievement.reviewedBy}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Empty State */}
                    {(!studentData.achievements || studentData.achievements.length === 0) && 
                     (!studentData.pendingAchievements || studentData.pendingAchievements.length === 0) && (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-2">No achievements yet. Start your journey!</p>
                        <p className="text-sm text-muted-foreground">Submit your achievements for faculty verification.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Portfolio Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Portfolio
                </CardTitle>
                <CardDescription>
                  Create and manage your professional portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Build your professional portfolio to showcase your achievements</p>
                  <Button asChild>
                    <Link href="/portfolio/generator">
                      <FileText className="mr-2 h-4 w-4" />
                      Create Portfolio
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentProfile={studentData?.profile || {}}
        onProfileUpdate={(updatedProfile) => {
          setStudentData(prev => ({
            ...prev,
            profile: { ...prev.profile, ...updatedProfile }
          }))
        }}
      />
      
      {/* Course Enrollment Modal */}
      <CourseEnrollmentModal 
        isOpen={showCourseEnrollment}
        onClose={() => setShowCourseEnrollment(false)}
        onEnrollmentUpdate={() => {
          const fetchStudentData = async () => {
            try {
              const data = await authService.getStudentProfile()
              setStudentData(data)
            } catch (err) {
              console.error('Failed to refresh student data:', err)
            }
          }
          fetchStudentData()
        }}
      />

      {/* Achievement Upload Modal */}
      <AchievementUploadModal
        isOpen={showAchievementUpload}
        onClose={() => setShowAchievementUpload(false)}
        onUploaded={() => {
          // Immediately refresh data after upload
          fetchStudentData()
        }}
      />
    </div>
  )
}
