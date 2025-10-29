"use client"

import { useState } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import {
  User,
  GraduationCap,
  Loader2,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  BookOpen,
} from "lucide-react"

import { authService } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { EditProfileModal } from "./edit-profile-modal"
import { CourseEnrollmentModal } from "./course-enrollment-modal"
import { AchievementUploadModal } from "./achievement-upload-modal"

interface Achievement {
  _id: string
  title: string
  description: string
  date: string
  verifiedBy?: string
  reviewedBy?: string
  status: "verified" | "pending" | "rejected"
  reviewComments?: string
  evidenceUrl?: string
  evidenceFiles?: { filename: string; originalName: string }[]
}

interface CourseProgress {
  name: string
  grade: string
  progress: number
}

interface StudentProfile {
  name: string
  studentId: string
  major: string
  year: string
  gpa: number
  avatar?: string
}

interface StudentData {
  profile: StudentProfile
  progress: {
    overall: number
    courses: CourseProgress[]
  }
  stats: {
    completedCourses: number
    totalCredits: number
    currentGPA: number
    rank: number
  }
  achievements: Achievement[]
  pendingAchievements: Achievement[]
}

const fetcher = async (): Promise<StudentData> => {
  const data = await authService.getStudentProfile()
  return data
}

export function StudentDashboard() {
  const router = useRouter()
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showCourseEnrollment, setShowCourseEnrollment] = useState(false)
  const [showAchievementUpload, setShowAchievementUpload] = useState(false)

  const {
    data: studentData,
    error,
    isLoading,
    mutate,
  } = useSWR<StudentData>("/student/profile", fetcher, {
    refreshInterval: 10000, // refresh every 10s
    revalidateOnFocus: true,
  })

  const handleLogout = () => {
    authService.logout()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load data. Try again.</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    )
  }

  const { profile, progress, stats, achievements, pendingAchievements } = studentData

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HEADER */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Student Dashboard</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* PROFILE CARD */}
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>
                {profile.major} • {profile.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Student ID</p>
                  <p className="font-medium">{profile.studentId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">GPA</p>
                  <p className="font-medium">{profile.gpa}</p>
                </div>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowEditProfile(true)}
              >
                <User className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* OVERALL PROGRESS */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Progress value={progress.overall} className="w-2/3 mb-2" />
                <p className="text-sm text-muted-foreground">{progress.overall}% complete</p>
              </div>
            </CardContent>
          </Card>

          {/* QUICK STATS */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.completedCourses}</p>
                <p className="text-sm text-muted-foreground">Completed Courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.totalCredits}</p>
                <p className="text-sm text-muted-foreground">Credits</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.currentGPA}</p>
                <p className="text-sm text-muted-foreground">Current GPA</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">#{stats.rank}</p>
                <p className="text-sm text-muted-foreground">Class Rank</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* COURSES */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Current Courses
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowCourseEnrollment(true)}>
                Enroll
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress.courses.map((course, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{course.name}</span>
                    <Badge variant="outline">{course.grade}</Badge>
                  </div>
                  <Progress value={course.progress} className="h-2 mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ACHIEVEMENTS */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Achievements
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowAchievementUpload(true)}>
                Submit Achievement
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Verified */}
              {achievements.length > 0 && (
                <div>
                  <h5 className="font-medium text-green-700 flex items-center mb-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verified Achievements
                  </h5>
                  {achievements.map((a) => (
                    <div
                      key={a._id}
                      className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 mb-3"
                    >
                      <div className="flex justify-between">
                        <p className="font-medium">{a.title}</p>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Verified
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                      {a.evidenceUrl && (
                        <a
                          href={a.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View evidence
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pending */}
              {pendingAchievements.some((a) => a.status === "pending") && (
                <div>
                  <h5 className="font-medium text-yellow-700 flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Verification
                  </h5>
                  {pendingAchievements
                    .filter((a) => a.status === "pending")
                    .map((a) => (
                      <div
                        key={a._id}
                        className="p-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 mb-3"
                      >
                        <div className="flex justify-between">
                          <p className="font-medium">{a.title}</p>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{a.description}</p>
                      </div>
                    ))}
                </div>
              )}

              {/* Rejected */}
              {pendingAchievements.some((a) => a.status === "rejected") && (
                <div>
                  <h5 className="font-medium text-red-700 flex items-center mb-2">
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejected
                  </h5>
                  {pendingAchievements
                    .filter((a) => a.status === "rejected")
                    .map((a) => (
                      <div
                        key={a._id}
                        className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 mb-3"
                      >
                        <div className="flex justify-between">
                          <p className="font-medium">{a.title}</p>
                          <Badge variant="destructive">Rejected</Badge>
                        </div>
                        {a.reviewComments && (
                          <p className="text-sm text-red-600 mt-1">Comments: {a.reviewComments}</p>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {/* Empty state */}
              {achievements.length === 0 && pendingAchievements.length === 0 && (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No achievements yet. Start your journey!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* MODALS */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentProfile={profile}
        onProfileUpdate={() => mutate()}
      />

      <CourseEnrollmentModal
        isOpen={showCourseEnrollment}
        onClose={() => setShowCourseEnrollment(false)}
        onEnrollmentUpdate={() => mutate()}
      />

      <AchievementUploadModal
        isOpen={showAchievementUpload}
        onClose={() => setShowAchievementUpload(false)}
        onUploaded={() => {
          toast.success("Achievement submitted for review")
          mutate()
        }}
      />
    </div>
  )
}
