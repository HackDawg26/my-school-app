import os
import sys
import django
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from LMS.models import QuarterlyGrade, Student, Subject, User

print('=== Populating Quarterly Grades ===\n')

# Get all students
students = Student.objects.all()
if not students.exists():
    print('❌ No students found! Please create students first.')
    sys.exit(1)

# Get all subjects
subjects = Subject.objects.all()
if not subjects.exists():
    print('❌ No subjects found! Please create subjects first.')
    sys.exit(1)

quarters = ['Q1', 'Q2', 'Q3', 'Q4']
remarks_templates = [
    "Excellent work! Keep it up!",
    "Good job! Shows great improvement.",
    "Satisfactory performance. Can do better with more effort.",
    "Needs improvement. Please see me for additional help.",
    "Outstanding achievement! Excellent mastery of the subject.",
    "Very good performance. Keep up the good work!",
    "Fair performance. More practice needed.",
    "Shows potential. Needs more focus on weak areas."
]

created_count = 0
updated_count = 0

# Generate grades for each student in each subject for Q1 and Q2
for student in students:
    print(f"\n📚 Creating grades for {student.user.first_name} {student.user.last_name}")
    
    for subject in subjects:
        # Create grades for Q1 and Q2 only (you can change this)
        for quarter in ['Q1', 'Q2']:
            # Check if grade already exists
            existing_grade = QuarterlyGrade.objects.filter(
                student=student,
                subject=subject,
                quarter=quarter
            ).first()
            
            # Generate random scores
            ww_total = random.randint(50, 100)
            ww_score = random.randint(int(ww_total * 0.6), ww_total)  # 60-100% range
            
            pt_total = random.randint(50, 100)
            pt_score = random.randint(int(pt_total * 0.6), pt_total)
            
            qa_total = random.randint(50, 100)
            qa_score = random.randint(int(qa_total * 0.6), qa_total)
            
            # Calculate component percentages
            ww_pct = (ww_score / ww_total * 100) if ww_total > 0 else 0
            pt_pct = (pt_score / pt_total * 100) if pt_total > 0 else 0
            qa_pct = (qa_score / qa_total * 100) if qa_total > 0 else 0
            
            # Calculate weighted grade (40-40-20)
            final_grade = (ww_pct * 0.4) + (pt_pct * 0.4) + (qa_pct * 0.2)
            
            # Select remarks based on grade
            if final_grade >= 90:
                remarks = random.choice([remarks_templates[0], remarks_templates[4], remarks_templates[5]])
            elif final_grade >= 80:
                remarks = random.choice([remarks_templates[1], remarks_templates[5]])
            elif final_grade >= 75:
                remarks = random.choice([remarks_templates[2], remarks_templates[6]])
            else:
                remarks = random.choice([remarks_templates[3], remarks_templates[7]])
            
            if existing_grade:
                # Update existing grade
                existing_grade.written_work_score = ww_score
                existing_grade.written_work_total = ww_total
                existing_grade.performance_task_score = pt_score
                existing_grade.performance_task_total = pt_total
                existing_grade.quarterly_assessment_score = qa_score
                existing_grade.quarterly_assessment_total = qa_total
                existing_grade.ww_weight = 0.4
                existing_grade.pt_weight = 0.4
                existing_grade.qa_weight = 0.2
                existing_grade.remarks = remarks
                existing_grade.save()
                updated_count += 1
                print(f"  ✓ Updated {subject.name} - {quarter}: {final_grade:.2f}%")
            else:
                # Create new grade
                QuarterlyGrade.objects.create(
                    student=student,
                    subject=subject,
                    quarter=quarter,
                    written_work_score=ww_score,
                    written_work_total=ww_total,
                    performance_task_score=pt_score,
                    performance_task_total=pt_total,
                    quarterly_assessment_score=qa_score,
                    quarterly_assessment_total=qa_total,
                    ww_weight=0.4,
                    pt_weight=0.4,
                    qa_weight=0.2,
                    remarks=remarks
                )
                created_count += 1
                print(f"  ✓ Created {subject.name} - {quarter}: {final_grade:.2f}%")

print(f"\n{'='*50}")
print(f"✅ Data population complete!")
print(f"   Created: {created_count} grades")
print(f"   Updated: {updated_count} grades")
print(f"   Total: {created_count + updated_count} grades")
print(f"{'='*50}\n")

# Show sample data
print("📊 Sample Grade Data:")
sample_grades = QuarterlyGrade.objects.select_related('student', 'subject').all()[:3]
for grade in sample_grades:
    print(f"\n  Student: {grade.student.user.first_name} {grade.student.user.last_name}")
    print(f"  Subject: {grade.subject.name}")
    print(f"  Quarter: {grade.quarter}")
    print(f"  Final Grade: {grade.final_grade:.2f}%")
    print(f"  Remarks: {grade.remarks}")
