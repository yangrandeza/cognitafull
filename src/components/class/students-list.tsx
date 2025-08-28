"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function StudentsList({ students }: { students: Student[] }) {
  const { toast } = useToast();

  const handleGeneratePdf = (studentName: string) => {
    toast({
      title: "Generating Report...",
      description: `A PDF report for ${studentName} is being generated.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Student Roster</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.age}</TableCell>
                <TableCell>
                  <Badge variant={student.quizStatus === 'completed' ? 'default' : 'outline'} className={student.quizStatus === 'completed' ? 'bg-green-600' : ''}>
                    {student.quizStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGeneratePdf(student.name)}
                    disabled={student.quizStatus !== 'completed'}
                  >
                    Generate PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
