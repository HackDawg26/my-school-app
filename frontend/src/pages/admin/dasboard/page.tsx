
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Briefcase, ClipboardList, Link as LinkIcon, UserPlus, Building } from "lucide-react";
import { teachers, students, gradeLogs as initialGradeLogs, sections, subjects, departments } from "@/lib/data";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Student, Teacher, SectionSubjectLink } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type CombinedAccount = (Student | Teacher) & { accountType: 'Student' | 'Teacher' };

export default function AdminDashboardPage() {
  const [studentList] = useLocalStorage<Student[]>('students', students);
  const [teacherList] = useLocalStorage<Teacher[]>('teachers', teachers);
  const [links] = useLocalStorage<SectionSubjectLink[]>('sectionSubjectLinks', []);
  const [gradeLogs] = useLocalStorage('gradeLogs', initialGradeLogs);

  const [isClient, setIsClient] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState<CombinedAccount[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
      if(isClient) {
          const studentAccounts: CombinedAccount[] = studentList.map(s => ({ ...s, accountType: 'Student' }));
          const teacherAccounts: CombinedAccount[] = teacherList.map(t => ({...t, accountType: 'Teacher'}));
          
          const allAccounts: CombinedAccount[] = [...studentAccounts, ...teacherAccounts];
          
          // Since there are no timestamps, we'll just take the last few as "recent"
          const sortedAccounts = allAccounts.sort((a,b) => (b.id > a.id) ? 1 : -1);

          setRecentAccounts(sortedAccounts.slice(0, 5));
      }

  }, [isClient, studentList, teacherList]);

  const totalStudents = studentList.length;
  const totalTeachers = teacherList.length;
  const totalDepartments = departments.length;

  const recentGradeLogs = gradeLogs.slice(0, 5);
  const recentLinks = links.slice(-5).reverse();

  const getChangeTypeChipClassName = (changeType: string) => {
        switch (changeType) {
            case 'Create':
                return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'Update':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            default:
                return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        }
    }

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage user accounts and view system overview.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/students">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isClient ? (
                <div className="text-4xl font-bold font-headline">{totalStudents}</div>
              ) : (
                <Skeleton className="h-10 w-16" />
              )}
              <p className="text-xs text-muted-foreground">Click to manage student accounts</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/faculty">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isClient ? (
                <div className="text-4xl font-bold font-headline">{totalTeachers}</div>
              ) : (
                <Skeleton className="h-10 w-16" />
              )}
              <p className="text-xs text-muted-foreground">Click to manage faculty accounts</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/faculty">
            <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isClient ? (
                <div className="text-4xl font-bold font-headline">{totalDepartments}</div>
                ) : (
                <Skeleton className="h-10 w-16" />
                )}
                <p className="text-xs text-muted-foreground">Click to manage departments</p>
            </CardContent>
            </Card>
        </Link>
      </div>

        <div className="grid gap-6 md:grid-cols-2">
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Recent Accounts Created</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {isClient ? (
                       <div className="space-y-2">
                            {recentAccounts.map(account => (
                                <div key={`${account.accountType}-${account.id}`} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium">{account.firstName} {account.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{account.email}</p>
                                    </div>
                                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", account.accountType === 'Student' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800')}>
                                        {account.accountType}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {[...Array(5)].map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}
                        </div>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Recent Grade Logs</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                     {isClient ? (
                        <div className="space-y-2 text-sm">
                            {recentGradeLogs.map(log => (
                                <div key={log.id} className="flex justify-between items-center">
                                    <div>
                                        <p><span className="font-medium">{log.teacher}</span> updated grade for <span className="font-medium">{log.student}</span></p>
                                        <p className="text-xs text-muted-foreground">{log.subject} - {log.activity}</p>
                                    </div>
                                     <span className={cn(
                                        "inline-block rounded-full px-2 py-1 text-xs font-semibold", 
                                        getChangeTypeChipClassName(log.changeType)
                                    )}>
                                        {log.changeType}
                                    </span>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="space-y-3">
                            {[...Array(5)].map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
        <div className="grid gap-6">
          <Card>
              <CardHeader>
                  <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Recent Team Links Saved</CardTitle>
                    </div>
              </CardHeader>
              <CardContent>
                   {isClient ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Link</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentLinks.map(link => {
                                    const section = sections.find(s => s.id === link.sectionId);
                                    const subject = subjects.find(s => s.id === link.subjectId);
                                    return (
                                        <TableRow key={`${link.sectionId}-${link.subjectId}`} className="text-xs">
                                            <TableCell className="font-medium">{section ? `Grade ${section.yearLevel} - ${section.name}` : 'N/A'}</TableCell>
                                            <TableCell>{subject?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-muted-foreground truncate" style={{maxWidth: '200px'}}>{link.teamLink}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                   ) : (
                       <div className="space-y-3">
                            {[...Array(5)].map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}
                        </div>
                   )}
              </CardContent>
          </Card>
        </div>
    </main>
  );
}
