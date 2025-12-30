

"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import type { SubjectGrade, Student } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

export function GradeReport({ grades, student }: { grades: SubjectGrade[], student: Student }) {
  const getStatusVariant = (status: 'Passed' | 'Failed' | 'Incomplete') => {
    switch (status) {
      case 'Passed':
        return 'success';
      case 'Failed':
        return 'destructive';
      case 'Incomplete':
        return 'warning';
      default:
        return 'outline';
    }
  };
  
  return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Academic Year Summary</CardTitle>
          <CardDescription>Your quarterly and final grades for all subjects.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
            <Table className="min-w-[800px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px] whitespace-nowrap">Subject</TableHead>
                        <TableHead className="text-center">1st Quarter</TableHead>
                        <TableHead className="text-center">2nd Quarter</TableHead>
                        <TableHead className="text-center">3rd Quarter</TableHead>
                        <TableHead className="text-center">4th Quarter</TableHead>
                        <TableHead className="text-right font-semibold">Final Grade</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {grades.map((grade) => (
                        <TableRow key={grade.subjectId}>
                            <TableCell className="font-medium">{grade.subjectName}</TableCell>
                            <TableCell className="text-center">{grade.q1 ?? 'N/A'}</TableCell>
                            <TableCell className="text-center">{grade.q2 ?? 'N/A'}</TableCell>
                            <TableCell className="text-center">{grade.q3 ?? 'N/A'}</TableCell>
                            <TableCell className="text-center">{grade.q4 ?? 'N/A'}</TableCell>
                            <TableCell className="text-right font-bold text-primary">{grade.finalGrade.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={getStatusVariant(grade.status)}>{grade.status}</Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                 <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6} className="font-bold text-right text-lg">General Average</TableCell>
                    <TableCell className="text-center font-bold text-2xl text-primary">{student.gpa.toFixed(2)}%</TableCell>
                  </TableRow>
                </TableFooter>
            </Table>
        </CardContent>
      </Card>
  )
}
