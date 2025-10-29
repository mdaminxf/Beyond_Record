"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BookOpen, 
  Users, 
  Award,
  Search,
  Plus,
  CheckCircle,
  Loader2,
  GraduationCap,
  Calendar,
  User
} from "lucide-react"
import toast from "react-hot-toast"

interface Course {
  _id: string
  courseId: string
  name: string
  instructor: string
  credits: number
  semester: string
  year: string
  description?: string
  students: string[]
  enrollment?: {
    progress: number
    grade: string | null
    status: string
    enrolledAt: Date
  }
}

interface CourseEnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  onEnrollmentUpdate: () => void
}

export function CourseEnrollmentModal({ isOpen, onClose, onEnrollmentUpdate }: CourseEnrollmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null)

  // Fetch courses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCourses()
    }
  }, [isOpen])

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true)
      setError("")

      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/student/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }

      const data = await response.json()
      setEnrolledCourses(data.enrolledCourses)
      setAvailableCourses(data.availableCourses)

    } catch (err: any) {
      setError(err.message || "Failed to load courses")
    } finally {
      setCoursesLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingCourseId(courseId)
      setError("")

      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/student/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ courseId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to enroll in course')
      }

      const result = await response.json()
      toast.success(`Successfully enrolled in ${result.enrollment.courseName}!`)
      
      // Refresh courses list
      await fetchCourses()
      onEnrollmentUpdate()

    } catch (err: any) {
      setError(err.message || "Failed to enroll in course")
      toast.error("Failed to enroll in course")
    } finally {
      setEnrollingCourseId(null)
    }
  }

  // Filter available courses based on search term
  const filteredAvailableCourses = availableCourses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const CourseCard = ({ course, isEnrolled = false }: { course: Course; isEnrolled?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{course.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <User className="mr-1 h-4 w-4" />
              {course.instructor}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {course.courseId}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Award className="mr-1 h-4 w-4" />
            {course.credits} Credits
          </div>
          <div className="flex items-center text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {course.semester} {course.year}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="mr-1 h-4 w-4" />
            {course.students?.length || 0} Students
          </div>
        </div>

        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}

        {isEnrolled && course.enrollment && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-medium">{course.enrollment.progress}%</span>
            </div>
            {course.enrollment.grade && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Grade:</span>
                <Badge variant="outline">{course.enrollment.grade}</Badge>
              </div>
            )}
          </div>
        )}

        {!isEnrolled && (
          <Button 
            className="w-full mt-3" 
            onClick={() => handleEnroll(course.courseId)}
            disabled={enrollingCourseId === course.courseId}
          >
            {enrollingCourseId === course.courseId ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Enroll
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <BookOpen className="mr-2 h-6 w-6" />
            Course Enrollment
          </DialogTitle>
          <DialogDescription>
            Browse available courses and manage your enrollments
          </DialogDescription>
        </DialogHeader>

        {coursesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading courses...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="available" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available" className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Available Courses ({filteredAvailableCourses.length})
              </TabsTrigger>
              <TabsTrigger value="enrolled" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                My Courses ({enrolledCourses.length})
              </TabsTrigger>
            </TabsList>

            {/* Available Courses Tab */}
            <TabsContent value="available" className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses by name, instructor, or course ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredAvailableCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No courses found' : 'No available courses'}
                      </h3>
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? 'Try adjusting your search terms'
                          : 'All available courses have been enrolled'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredAvailableCourses.map((course) => (
                        <CourseCard key={course._id} course={course} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Enrolled Courses Tab */}
            <TabsContent value="enrolled" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't enrolled in any courses yet. Browse available courses to get started!
                      </p>
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Browse Available Courses
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {enrolledCourses.map((course) => (
                        <CourseCard key={course._id} course={course} isEnrolled={true} />
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
